<?php

require 'session.php';

// Setup Redis connection.
$redis = new Predis\Client();

// Handle login.
if (!empty($_POST['name'])) {
  $_SESSION['name'] = $_POST['name'];
  $redis->hset('users', $_POST['name'], time());
}

// Handle logout.
if (!empty($_GET['logout']) && !empty($_SESSION['name'])) {
  $redis->hdel('users', $_SESSION['name']);
  session_destroy();
  header('Location: /');
  exit;
}

require 'pages/header.php';

// Define application flow.
// We lack the use of a decent framework, to keep the example simple.
if (empty($_SESSION['name'])) {
  require 'pages/login.php';
}
else {
  require 'pages/post.php';
}

require 'pages/footer.php';