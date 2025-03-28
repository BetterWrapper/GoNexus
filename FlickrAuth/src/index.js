const express = require('express');
const session = require('express-session');
const Grant = require('grant-express');

// Constants
const { APPLICATION_PORT, FLICKR_CONSUMER_SECRET } = require('./constants');

// Configuration
const { config } = require('./config');

// Auxiliar functions
const { getConnectionData, testLogin, getMethods, getMethodInfo, doCall } = require('./functions');

// App Express
//let app = express();
const app = express.Router();
app.use(session({'secret': FLICKR_CONSUMER_SECRET}));
app.use(new Grant(config));

// Add headers for CORS
app.use( (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Our session variable
let currentSession;

// The main page
app.get('/flickrProfileTest', (req, res) => {

  // If there are no session, must connect
  if (!currentSession) {
    res.redirect('/connect/flickr');
  } else {

    // OK. If we are here we are logged :D
    const connectionData = getConnectionData(req);
    if (connectionData) {

      /*
       * First step. Check the connection.
       * It calls to the testLogin method.
       ***/
      testLogin(connectionData).then( (resultOfLogin) => {
        const statOfResulOfLogin = resultOfLogin.stat;
        if (statOfResulOfLogin === 'ok') {

          /*
           * Second step. Get the list of available methods.
           ***/
          getMethods(connectionData).then( (listOfMethods) => {
            if (listOfMethods && listOfMethods.methods && listOfMethods.methods.method) {

              console.log('\r\nChecking available methods:');

              listOfMethods.methods.method.map( (currentMethod) => {

                let availableMethods = [];

                // Get the method name
                const methodName = currentMethod._content;

                /*
                 * Third step. Get the all the information about the method
                 ***/
                getMethodInfo(connectionData, methodName).then( (methodInfo) => {

                  // Arguments is a reserved word
                  const statOfResuldOfMethodInfo = methodInfo.stat;
                  const methodArguments = methodInfo.arguments.argument;
                  const { name, needslogin, needssigning, requiredperms } = methodInfo.method;

                  /*
                   * Fourht step. Map every method to a app.get. This is the core of the application.
                   * Here we find the proxy for every method without auth o with read permissions of the Flickr API
                   ***/
                  if (statOfResuldOfMethodInfo === 'ok' && requiredperms < 2) {
                    availableMethods.push({ methodName, needslogin, needssigning, requiredperms, methodArguments });

                    let typeOfPermission = requiredperms === 0 ? '(no authentication needed)' : '(authentication needed with read permissions)';
                    console.log('- Adding method ' + name + ' ' + typeOfPermission + '.');
                    app.get('/flickrProfileTest' + methodName, doCall(connectionData, methodName));
                  }

                });

              });
            }
          });

          // Inform that everything is OK
          res.end('Well... You\'re connected. You can work with the API :D');

        } else {
          res.end('Ooops! Something wrong has happened :/');
        }
      });

    } else {
      res.end('Ooops! Something wrong has happened :/');
    }
  }
});

// Callback. Once Flickr has send us the credentials, we redirect to the main page.
app.get('/callback', (req, res) => {
  const listOfSessions = req.sessionStore.sessions;
  const idFirstSession = Object.keys(listOfSessions)[0];
  currentSession = listOfSessions[idFirstSession];
  res.redirect('/flickrProfileTest');
});

// Listen and inform
/*app.listen(APPLICATION_PORT, () => {
  console.log('Express server listening on port ' + APPLICATION_PORT);
  console.log('First of all, you must validate the application opening: http://localhost:' + APPLICATION_PORT + '/');
});*/
module.exports = app;
