var config = require('config.js');
var app = require('express').createServer();
var io = require('socket.io').listen(app);
var crypto = require('crypto');

app.listen(config.port);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/history', function(req, res){
  var body = JSON.stringify(history);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

app.get('/online', function(req, res){
  var body = JSON.stringify(usernames);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

// usernames which are currently connected to the chat
var usernames = {};
var history = [];

io.sockets.on('connection', function (socket) {

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
    var date = dateFormat(new Date(), '%H:%M', false);
    
    io.sockets.emit('updatechat', socket.username, data, date, false);
    history.push({username: socket.username, data: data, date: date});
    history = history.slice(-25);
  });
  
  socket.on('history', function() {
    for (var i = 0; i < history.length; i++) {
      socket.emit('updatechat', history[i].username, history[i].data, history[i].date, true);
    }
  });

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username, hash) {
    var h = crypto.createHash('md5');
    h.update(username + config.secret);
    h = h.digest('hex');
    if (hash != h) {
      console.log('Invalid hash');
      console.log(username + config.secret)
      console.log(hash)
      console.log(h);
      socket.emit('updatechat', 'SERVER', 'invalid hash', dateFormat(new Date(), '%H:%M', false));
      socket.disconnect();
      return;
    }
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    // echo to client they've connected
    //socket.emit('updatechat', 'SERVER', 'you have connected', true);
    // echo globally (all clients) that a person has connected
    //socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected', false);
    // update the list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    
    for (var i = 0; i < history.length; i++) {
      socket.emit('updatechat', history[i].username, history[i].data, history[i].date, true);
    }
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected', false);
  });
});

function dateFormat(date, fstr, utc) {
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}
