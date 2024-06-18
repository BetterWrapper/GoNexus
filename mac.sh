#!/bin/sh
killall node
if command -v node &> /dev/null; then
    echo "Node.js is installed!"
    node -v
else
    echo "Node.js is not installed!"
        if ! command -v brew &> /dev/null; then
            echo "Homebrew is not installed!"
            curl -fsSL -o install.sh https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh
            brew install node
    else
            echo "Homebrew is installed!"
            brew install node
    fi
fi

if [ $NODE_ENV==dev ]
then
   npm test
else
   npm start
fi
