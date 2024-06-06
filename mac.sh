#!/bin/sh
killall node
if [ $NODE_ENV==dev ]
then
   npm test
else
   npm start
fi
