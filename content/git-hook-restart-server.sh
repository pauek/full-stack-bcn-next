#!/bin/bash
BIN=$HOME/.volta/bin
set -e
cd $HOME/fullstack-content-deploy-dir/server
$BIN/pm2 del fullstack-content
$BIN/pm2 start ./node_modules/.bin/next --name fullstack-content -- start -p 3333
