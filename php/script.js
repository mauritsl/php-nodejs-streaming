$(function() {
  // Connect to the NodeJS application via Socket.IO.
  var socket = io.connect(window.location.hostname + ':81');
  
  // The server will tell us our username, based on the session cookie.
  socket.on('name', function(data) {
    // Update the username.
    $('#username').text(data);
  });
  
  // When we got a "userlist" message.
  socket.on('userlist', function(users) {
    // Update the list of online users.
    $('#userlist').text(users.join(', '));
  });
  
  // When we got a "message" message.
  socket.on('message', function(message) {
    // Append it to the message list.
    $('#messages').append(
      $('<li>').text(message)
    );
  });
});
