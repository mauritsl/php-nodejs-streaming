<?php

if (!empty($_POST['message'])) {
  // Publish this message to the Redis "chats" channel.
  $chat = new stdClass();
  $chat->recipient = $_POST['recipient'];
  $chat->text = $_POST['message'];
  $redis->publish('chats', json_encode($chat));
}

?>
<form action="/" method="post">
<label for="recipient">Recipient:</label>
<select name="recipient">
<?php

foreach ($redis->hkeys('users') as $user) {
  echo '<option value="' . htmlentities($user) . '">' . htmlentities($user) . '</option>';
}

?>
</select>
<label for="message">Message:</label>
<input type="text" name="message" />
<input type="submit" value="Post" />
</form>
