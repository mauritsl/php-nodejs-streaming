#!/bin/sh

# Abort provisioning if some select items are already installed. We'll assume if
# these are present, everything is. Test for modules directory in /data/studycards and
# for nginx. This is mainly meant for Vagrant.
which nginx >/dev/null &&
{ echo "Vagrant test setup already installed. If you are running on vagrant and need to test the installation script, please first issue a vagrant destroy."; exit 0; }

export DEBIAN_FRONTEND=noninteractive

apt-get update

ln -sf /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Node.js
echo Installing NodeJS...
apt-get -y install npm
apt-get -y install nodejs-legacy

# Node modules
echo Installing NodeJS modules...
(cd /data/streaming/nodejs && npm install)
cd ~

# NodeJS apps
cp /data/streaming/vagrant/conf/streaming-nodejs /etc/init.d/streaming-nodejs
chmod +x /etc/init.d/streaming-nodejs
service streaming-nodejs start
update-rc.d streaming-nodejs start 3 4 6 . stop 0 1 6 .

# NginX
echo Installing NginX...
apt-get -y install nginx
service nginx stop
sed -i 's/sendfile on/sendfile off/g' /etc/nginx/nginx.conf
sed -i 's/worker_processes 4/worker_processes 2/g' /etc/nginx/nginx.conf
sed -i 's/worker_connections 768/worker_connections 256/g' /etc/nginx/nginx.conf
cp /data/streaming/vagrant/conf/nginx /etc/nginx/sites-enabled/default
service nginx start

# PHP
apt-get -y install php5-cli php5-cgi spawn-fcgi psmisc
apt-get -y install php5-gd php5-mysql
cp /data/streaming/vagrant/conf/php5-fastcgi /usr/bin/php5-fastcgi
cp /data/streaming/vagrant/conf/php5-fastcgi-initd /etc/init.d/php5-fastcgi
chmod +x /usr/bin/php5-fastcgi
chmod +x /etc/init.d/php5-fastcgi
update-rc.d php5-fastcgi defaults
service php5-fastcgi start

# Redis
apt-get install -y redis-server
