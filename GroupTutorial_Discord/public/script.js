const socket = io();
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const channelList = document.getElementById('channel-list');
const createServerForm = document.getElementById('create-channel-form');
const newServerInput = document.getElementById('new-channel-name');

let currentChannel = 'General';
const username = localStorage.getItem('username') || 'Guest';

function initializeChat() {
  socket.emit('joinChannel', { channel: currentChannel });
  setActiveTab(currentChannel);
  socket.emit('switchChannel', { channel: currentChannel, username });
  socket.emit('fetchServers', username);
}

function setActiveTab(channelName) {
  const tabs = document.querySelectorAll('.channel');
  tabs.forEach((tab) => tab.classList.remove('active-tab'));
  const activeTab = document.querySelector(`[data-channel="${channelName}"]`);
  if (activeTab) activeTab.classList.add('active-tab');
}

initializeChat();

channelList.addEventListener('click', (e) => {
  if (e.target.classList.contains('channel')) {
    const channelName = e.target.getAttribute('data-channel');
    if (channelName !== currentChannel) {
      currentChannel = channelName;
      setActiveTab(channelName);
      socket.emit('switchChannel', { channel: channelName, username });
      socket.emit('joinChannel', { channel: channelName });
      messagesDiv.innerHTML = '';
    }
  }
});

createServerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newServerName = newServerInput.value.trim();
  if (newServerName) {
    socket.emit('createServer', { serverName: newServerName, username });
    newServerInput.value = '';
  }
});

socket.on('newServer', (serverName) => {
  const serverElement = document.createElement('li');
  serverElement.classList.add('channel');
  serverElement.setAttribute('data-channel', serverName);
  serverElement.textContent = serverName;
  channelList.appendChild(serverElement);
});

socket.on('userServers', (servers) => {
  servers.forEach((server) => {
    const serverElement = document.createElement('li');
    serverElement.classList.add('channel');
    serverElement.setAttribute('data-channel', server);
    serverElement.textContent = server;
    channelList.appendChild(serverElement);
  });
});

socket.on('messageHistory', (messages) => {
  messages.forEach((message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.username} (${message.timestamp}): ${message.message}`;
    messagesDiv.appendChild(messageElement);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${data.username} (${data.timestamp}): ${data.message}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('message', {
      username,
      message,
      timestamp: new Date().toLocaleTimeString(),
      channel: currentChannel,
    });
    messageInput.value = '';
  }
});

messageInput.addEventListener('input', () => {
  socket.emit('typing', { username, channel: currentChannel });
});

socket.on('typing', (data) => {
  typingIndicator.textContent = `${data.username} is typing...`;
  typingIndicator.style.display = 'block';
  setTimeout(() => (typingIndicator.style.display = 'none'), 1000);
});
