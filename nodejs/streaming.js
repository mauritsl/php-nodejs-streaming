
var db = require('then-redis').createClient();
var subscriber = require('then-redis').createClient();
var io = require('socket.io')(81);

// Socket objects of online users, keyed by username.
var users = {};

// When client connects...
io.on('connection', function(socket) {
  var name = null;
  
  // When we get a session message...
  socket.on('session', function(key) {
    db.get('session:php:' + key).then(function(session) {
      session = JSON.parse(session);
      if (typeof session.name !== undefined) {
        name = session.name;
        users[name] = socket;
        socket.emit('name', name);
        socket.emit('message', 'Welcome ' + name + '!');
        io.emit('userlist', Object.keys(users));
      }
    });
  });
  
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
