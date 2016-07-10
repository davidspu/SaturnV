var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var base64url = require('base64url')
var _ = require('underscore');
var MailParser = require("mailparser").MailParser;
var mailparser = new MailParser();

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.gmail.com'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {

  var msgs = [];
  var parsedMsgs = [];

  mailparser.on("end", function(mail_object){
    parsedMsgs.push(mail_object);
    if(parsedMsgs.length === msgs.length){
      console.log(parsedMsgs);
    }
    // console.log(msgs.length);
    // console.log("From:", mail_object.from); //[{address:'sender@example.com',name:'Sender Name'}] 
    // console.log("Subject:", mail_object.subject); // Hello world! 
    // console.log("Text body:", mail_object.text); // How are you today? 
  });

var gmail = google.gmail('v1');
function getMessages(nextPage, callback) {
  gmail.users.messages.list({
    auth: auth,
    userId: 'me',
    pageToken: nextPage,
    q: "from:crisllop24@gmail.com to:crisllop24@gmail.com"
  }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      // console.log(msgs);
      msgs = msgs.concat(response.messages);
      response.messages.forEach(function(item, i){
        setTimeout(function() {
          gmail.users.messages.get({
            auth: auth,
            userId: 'me',
            // from: "crisllop24@gmail.com",
            id:item.id,
            format: "raw"
          },function(err,response){
            // console.log(response.raw);
            var isSomething = (response !== null)
            // console.log(i, isSomething)
            if (!isSomething) {
              console.log(err);
            }
            // send the email source to the parser
            if(response){
              mailparser.write(base64url.decode(response.raw));
              mailparser.end();
            }
          })
        }, i * 20);
      });
      if(response.nextPageToken){
        return getMessages(response.nextPageToken, callback);
      } else {
        return callback(msgs);
      }
  })
}

getMessages(null, function(messages){
});

}
