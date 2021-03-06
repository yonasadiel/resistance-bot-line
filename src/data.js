module.exports = {
  client        : '',
  event         : '',
  args          : [],
  group_session : {},
  user_session  : {},
  base_url      : 'https://script.google.com/macros/s/AKfycbyiLiyDT88t2cBZq9sJFK6xkmnfdwCrsb7FF49eN0TrZKbFr7s/exec?app=resistance',

  receive : function(client, event, args) {
    this.client = client;
    this.event  = event;
    this.args   = args;

    if (! this.event.source.hasOwnProperty('userId')) {
      return this.sendResponse('This bot only support LINE version 7.5.0 or higher.\nTry updating, block, and re-add this bot.');
    }

    this.searchUser(this.event.source.userId);
  },

  searchUser : function(id) {
    const request = require('request');
    let url       = this.base_url;
    url          += '&action=getUser';
    url          += '&id=' + id;

    request(url, this.searchUserCallback.bind(this));
  },

  searchUserCallback : function(error, response, body) {
    this.user_session = JSON.parse(body);

    if (this.event.source.type === 'group') {
      this.searchGroup(this.event.source.groupId);
    } else if (this.event.source.type === 'room') {
      this.searchGroup(this.event.source.roomId);
    } else if (this.user_session.status === 'active') {
      this.searchGroup(this.user_session.groupId);
    } else {
      const others = require('./others.js');
      others.receive(this.client, this.event, this.args, this.user_session);
    }
  },

  searchGroup : function(id) {
    const request = require('request');
    let url       = this.base_url;
    url          += '&action=getGroup';
    url          += '&id=' + id;

    request(url, this.searchGroupCallback.bind(this));
  },

  searchGroupCallback : function(error, response, body) {
    this.group_session = JSON.parse(body);

    if (this.user_session.groupId === '') {
      if (this.event.source.type === 'group') {
        this.user_session.groupId = this.event.source.groupId;
      } else if (this.event.source.type === 'room') {
        this.user_session.groupId = this.event.source.roomId;
      } else {
        this.user_session.groupId = 'unknown';
      }
    }

    if (this.user_session.name === '') {
      this.client
        .getProfile(this.user_session.id)
        .then((profile) => {
          this.user_session.name = profile.displayName;
          this.saveUserDataInitial(this.user_session);
        });
    } else {
      this.saveUserDataInitial(this.user_session);
    }
  },

  saveUserDataInitial : function(user_session) {
    const request = require('request');
    var url       = this.base_url;
    url          += '&action=saveUser';
    url          += '&data=' + JSON.stringify(user_session);

    request (url, this.saveUserDataInitialCallback.bind(this));
  },

  saveUserDataInitialCallback : function(error, response, body) {
    this.forwardProcess();
  },

  forwardProcess : function() {
    const resistance = require('./resistance.js');
    const personal   = require('./personal.js');

    if (this.event.source.type === 'group' || this.event.source.type === 'room') {
      resistance.receive(this.client, this.event, this.args, this.group_session, this.user_session);
    } else if (this.user_session.status === 'active') {
      personal.receive(this.client, this.event, this.args, this.group_session, this.user_session);
    }
  },

  saveGroupData : function(group_session) {
    const request = require('request');
    var url       = this.base_url;
    url          += '&action=saveGroup';
    url          += '&data=' + JSON.stringify(group_session);

    request (url, function(error, response, body) {
      console.log(body);
    });
  },

  saveUserData : function(user_session) {
    const request = require('request');
    var url       = this.base_url;
    url          += '&action=saveUser';
    url          += '&data=' + JSON.stringify(user_session);

    request (url, function(error, response, body) {
      console.log(body);
    });
  },

  resetAllPlayers : function(players) {
    for (var i in players) {
      let reset_player = {
        id      : players[i].id,
        status  : 'inactive',
        groupId : players[i].groupId,
        name    : players[i].name
      };

      this.saveUserData(reset_player);
    }
  },

  sendResponse : function(text) {
    return this.client.replyMessage(this.event.replyToken,{
      type : "text",
      text : text,
    });
  },
	
}