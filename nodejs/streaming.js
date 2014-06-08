
var db = require('then-redis').createClient();
var subscriber = require('then-redis').createClient();
var io = require('socket.io')(81);
var cookie = require('cookie');

// Socket objects of online users, keyed by username.
var users = {};

// Define an authorization function. We will check of the user has a valid
// session and grab the username.
io.use(function(socket, next) {
  // Check if a cookie is set.
  if (typeof socket.handshake.headers.cookie === 'undefined') {
    next(new Error('No session found.'));
  }
  
  // Parse the cookie header.
  var cookies = cookie.parse(socket.handshake.headers.cookie);
  if (typeof cookies.PHPSESSID === 'undefined') {
    // There is no PHPSESSID cookie.
    next(new Error('No session found.'));
  }
  
  // Get the session from Redis.
  db.get('session:php:' + cookies.PHPSESSID).then(function(session) {
    if (session) {
      session = JSON.parse(session);
      if (typeof session.name !== undefined) {
        // Temporary store the username.
        socket.handshake.username = session.name;
        // Tell Socket.IO that this connection is valid.
        next();
      }
    }
    else {
      // No response from Redis. This session is expired or invalid.
      next(new Error('Invalid session.'));
    }
  });
});

// When client connects...
io.on('connection', function(socket) {
  // Get the username, which was set by the authorization function.
  var name = socket.handshake.username;
  
  // Update the list of users.
  users[name] = socket;
  socket.emit('name', name);
  socket.emit('message', 'Welcome ' + name + '!');
  io.emit('userlist', Object.keys(users));
  
  // When client disconnects.
  socket.on('disconnect', function() {
    if (typeof users[name] !== undefined) {
      // Remove from the list of online users.
      delete users[name];
      // Delete user from online users in Redis.
      db.hdel('users', name);
      // Broadcast list of online users to all connected clients.
      io.emit('userlist', Object.keys(users));
    }
  });
});

// Listen for broadcasted messages from Redis on the "chats" channel.
subscriber.on('message', function(channel, message) {
  // Message is in json text, we need to parse it first.
  message = JSON.parse(message);
  if (typeof users[message.recipient] !== 'undefined') {
    users[message.recipient].emit('message', message.text);
  }
}).subscribe('chats');
