const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion } = require('mongodb');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
const uri = "mongodb+srv://boombeach3443:H0UuAUsepssXGXWg@cluster0.3gl7t.mongodb.net/discord_clone?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection, messagesCollection, channelsCollection;

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('MongoDB connected!');
    const db = client.db('discord_clone');
    usersCollection = db.collection('users');
    messagesCollection = db.collection('messages');
    channelsCollection = db.collection('channels');
    startServer();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await usersCollection.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  try {
    const user = await usersCollection.findOne({ username });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/chat',
  failureRedirect: '/login',
}));

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await usersCollection.insertOne({ username, password: hashedPassword });
    res.redirect('/login');
  } catch (err) {
    console.error('Error registering user:', err);
    res.redirect('/register');
  }
});

app.get('/chat', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/chat.html'));
});

app.post('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// Socket.io functionality
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('switchChannel', async ({ channel, username }) => {
    const filter = channel === 'General' ? { channel: 'General' } : { channel, username };
    const messages = await messagesCollection.find(filter).toArray();
    socket.emit('messageHistory', messages);
  });

  socket.on('message', async (data) => {
    const newMessage = {
      username: data.username,
      message: data.message,
      timestamp: data.timestamp,
      channel: data.channel,
    };

    try {
      await messagesCollection.insertOne(newMessage);
      io.to(data.channel).emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('joinChannel', ({ channel }) => {
    socket.join(channel);
  });

  socket.on('createServer', async ({ serverName, username }) => {
    const userChannels = await channelsCollection.findOne({ username });

    if (!userChannels) {
      await channelsCollection.insertOne({ username, servers: [serverName] });
    } else if (!userChannels.servers.includes(serverName)) {
      await channelsCollection.updateOne(
        { username },
        { $push: { servers: serverName } }
      );
    }

    socket.emit('newServer', serverName);
  });

  socket.on('fetchUserServers', async (username) => {
    const userChannels = await channelsCollection.findOne({ username });
    if (userChannels && userChannels.servers) {
      socket.emit('userServers', userChannels.servers);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
}

);

// Start the server
function startServer() {
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeDatabase();
