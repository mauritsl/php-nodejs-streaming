<?php

require 'session.php';

// Redirect to login if not logged in.
if (empty($_SESSION['name'])) {
  header('Location: /');
  exit;
}

?>
<html>
<head>
  <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
  <script src="//cdn.socket.io/socket.io-1.0.4.js"></script>
  <script src="script.js"></script>
</head>
<body>
  <div><strong>Your name: </strong><span id="username"></span></div>
  <div><strong>Online: </strong><span id="userlist"></span></div>
  <ul id="messages"></ul>
</body>
</html>