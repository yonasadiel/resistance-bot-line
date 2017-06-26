module.exports = {
  client        : '',
  event         : '',
  args          : [],
  group_session : {},
  user_session  : {},

  receive : function(client, event, args, group_session, user_session) {
  	this.client        = client;
  	this.event         = event;
  	this.args          = args;
  	this.group_session = group_session;
  	this.user_session  = user_session;

    switch (args[0]) {
      case '!about' :
        return this.aboutCommand();
      case '!help' :
        return this.helpCommand();
      case '!mission' : 
        return this.missionCommand();
      case '!role' : 
        return this.roleCommand();
      default:
        return this.invalidCommand();
    }
  },

  /*** COMMAND LIST ***/

  invalidCommand : function() {
    let reply_text = '';
    reply_text += 'Invalid Command';
    return client.replyMessage(reply_text);
  },

  aboutCommand : function() {
    let reply_text = '';
    reply_text = 'Resistance Game!\n';
    // todo : make a help text
    //        link into github guide
    return client.replyMessage(help_text);
  },

  helpCommand : function() {
    let reply_text = '';
    if (this.group_session.state === 'idle') {
      reply_text += 'No game is running\n';
      reply_text += 'Use !new to make a new game\n';
    } else {
      if (this.group_session.state === 'new') {
        reply_text += 'Waiting for player to join and start the game\n';
        reply_text += 'Min. player is 5 and max. player 10\n';
        reply_text += 'Use !player to check players\n';
        reply_text += 'Use !join to join the game,\n';
        reply_text += 'or !leave to leave the game\n';
        reply_text += 'Use !start to start the game\n';
        reply_text += '5 - 10 players will be needed\n';
      }
    }
    // todo : make help command
    return this.sendResponse(reply_text);
  },

  missionCommand : function() {
    if (this.group_session.state != 'mission') {
      return this.sendResponse('The game is not in mission process.');
    }
    let index = this.indexOfPlayer();
    if (this.group_session.players[index].mission !== 'pending') {
      if (this.group_session.players[index].mission === 'inactive') {
        return this.sendResponse('You are not a mission team member.');
      } else {
        return this.sendResponse('You have completed your mission');
      }
    }
    if (this.args.length < 2) {
      return this.sendResponse('Use "!mission success" or "!mission fail".');
    }
    if (this.args[1] !== 'fail' && this.args[1] !== 'success') {
      return this.sendResponse('Invalid. Use fail or success.');
    }
    if (this.args[1] === 'fail') {
      if (this.group_session.players[index].role === 'resistance') {
        let reply_text = '';
        reply_text += 'Invalid. You are a resistance.\n';
        reply_text += 'You can only support your resistance friends.\n';
        reply_text += 'Don\'t betray them! Use "!mission success"!';
        return this.sendResponse(reply_text);
      } else {
        this.group_session.mission.fail++;
      }
    } else {
      this.group_session.mission.success++;
    }

    this.group_session[index].mission = 'done';

    this.saveGroupData();

    let reply_text = '';
    reply_text += 'Done! You have try to make the mission ' + this.args[1] + '.\n';
    reply_text += 'Use "!check" in group to check who havent done the mission,';
    reply_text += ' or triggering process if all players have done the mission';
    this.sendResponse(reply_text);
  },

  roleCommand : function() {
    let index = this.indexOfPlayer();
    let role  = this.group_session.players[index].role;
    let reply_text = 'You are a ' + role + '\n';
    if (role === 'spy') {
      reply_text += 'The other spy(es) are:\n';
      this.group_session.players.forEach(function(item, index) {
        reply_text += '- ' + item.name + '\n';
      });
    }

    this.sendResponse(reply_text);
  },

  /*** OPERATION LIST ***/

  indexOfPlayer : function() {
    let found = -1;
    this.group_session.players.forEach(function(item, index) {
      if (item.id === this.user_session.id) {
        found = index;
      }
    });

    return found;
  },

  /*** DATA LIST ***/

  saveGroupData : function() {
    const data = require('./data.js');
    data.saveGroupData(this.group_session);
  },

  saveUserData : function() {
    const data = require('./data.js');
    data.saveUserData(this.user_session);
  },

  /*** MESSAGE LIST ***/

  sendResponse : function(text) {
    return this.client.replyMessage(this.event.replyToken,{
      type : "text",
      text : text,
    });
  },

  sendPlayerList : function() {
    let reply_text = 'List of player(s):\n';
    this.group_session.players.forEach(function(item, index) {
      let num = index + 1;
      reply_text += '' + num + '. ' + item.name + '\n';
    });

    return reply_text;
  },

  sendPlayerOnMissionList : function() {
    let reply_text = 'List of player';
    if (this.group_session.state === 'choose') {
      reply_text += '(s) chosen:\n';
    } else {
      reply_text += 's on mission:\n';
    }

    let num = 1;
    this.group_session.players.forEach(function(item, index) {
      if (item.mission !== 'inactive') {
        reply_text += '' + num + '. ' + item.name + '\n';
        num++;
      }
    });

    return reply_text;
  },
	
}