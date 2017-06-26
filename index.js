
/**
 * Index
 * ------------------
 * Main program of the bot
 * Will organize the route
 * and all the command
 */

const express = require('express');
const line    = require('@line/bot-sdk');
const config  = require('./config');

/** SERVER **/

const app = express();
app.post('/line_webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // only process messages with commandsymbol in first character
  if (event.message.text.startsWith(config.commandSymbol)) {

    var args = event.message.text.split(" ");

    const data       = require('./src/data');

    data.receive(client, event, args);
  }
}

app.listen(process.env.PORT || 5000);