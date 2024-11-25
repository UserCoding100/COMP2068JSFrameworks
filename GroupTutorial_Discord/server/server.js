const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const uri = "mongodb+srv://boombeach3443:H0UuAUsepssXGXWg@cluster0.3gl7t.mongodb.net/discord_clone?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let messagesCollection;
let channelsCollection;

async function initializeDatabase() {
  try {
    await client.connect();
    console.log("MongoDB connected!");
    const db = client.db("discord_clone");
    messagesCollection = db.collection("messages");
    channelsCollection = db.collection("channels");
    startServer();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

function startServer() {
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/chat.html'));
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('switchChannel', async ({ channel, username }) => {
      console.log(`${username} switched to channel: ${channel}`);
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
      console.log(`User joined channel: ${channel}`);
      socket.join(channel);
    });

    socket.on('createServer', async ({ serverName, username }) => {
      console.log(`${username} created server: ${serverName}`);
      const userServers = await channelsCollection.findOne({ username });

      if (!userServers) {
        await channelsCollection.insertOne({ username, servers: [serverName] });
      } else if (!userServers.servers.includes(serverName)) {
        await channelsCollection.updateOne(
          { username },
          { $push: { servers: serverName } }
        );
      }

      socket.emit('newServer', serverName);
    });

    socket.on('fetchServers', async (username) => {
      const userServers = await channelsCollection.findOne({ username });
      if (userServers && userServers.servers) {
        socket.emit('userServers', userServers.servers);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeDatabase();
