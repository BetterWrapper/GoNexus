#!/bin/bash
if which node > /dev/null
    then
          killall node
          echo "Node is installed!"
        if [ "$1" = "--dev" ]; then
          echo "Running in development mode."
          npm test
        elif [ "$1" = "--prod" ]; then
          echo "Running in production mode."
          npm start
        else
          npm start
        fi 
    else
        echo "Node is not installed!"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        nvm install node
        node -v # 22.2.0
        npm -v # 10.7.0
        if [ "$1" = "--dev" ]; then
          echo "Running in development mode."
          npm test
        elif [ "$1" = "--prod" ]; then
          echo "Running in production mode."
          npm start
        else
          npm start
        fi 
    fi
    
