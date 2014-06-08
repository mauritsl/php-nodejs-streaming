<html>
<body>
<?php

if (!empty($_SESSION['name'])) {
  echo '<p>';
  echo 'Logged in as ' . htmlentities($_SESSION['name']) . ' ';
  echo '(<a href="/?logout=1">logout</a>)';
  echo '</p>';
}
