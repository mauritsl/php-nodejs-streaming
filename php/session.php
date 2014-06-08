<?php

require 'lib/predis/autoload.php';
require 'lib/redis-session/redis-session.php';

// Explicitly disable the httponly flag. We must read this cookie from JS.
ini_set('session.cookie_httponly', 0);

// Start Redis session handler.
RedisSession::start();
