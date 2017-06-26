const numOfSpy        = [0,0,0,0,0,2,2,3,3,3,4,4];
const numOfResistance = [0,0,0,0,0,3,4,4,5,6,6,6];
const numOfTeam       = [[],[],[],[],[],
                         [0,2,3,2,3,3],
                         [0,2,3,4,3,4],
                         [0,2,3,3,4,4],
                         [0,3,4,4,5,5],
                         [0,3,4,4,5,5],
                         [0,3,4,4,5,5]];
const numOfFail       = [[],[],[],[],[],
                         [0,1,1,1,1,1],
                         [0,1,1,1,1,1],
                         [0,1,1,1,2,1],
                         [0,1,1,1,2,1],
                         [0,1,1,1,2,1],
                         [0,1,1,1,2,1]];

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
      case '!player' :
        return this.playerCommand();
      case '!new' :
        return this.newCommand();
      case '!join' :
        return this.joinCommand();
      case '!cancel' :
        return this.cancelCommand();
      case '!start' :
        return this.startCommand();
      case '!choose' :
        return this.chooseCommand();
      case '!list' :
        return this.listCommand();
      case '!vote' :
        return this.voteCommand();
      case '!check' :
        return this.checkCommand();
      case '!stop' :
        return this.stopCommand();
      case '!role' :
        return this.roleCommand();
      case '!mission' :
        return this.missionCommand();
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
      reply_text += '[[RESISTANCE]]\n';
      reply_text += 'Resistance is a mafia game that ';
      reply_text += 'ask you to be a discretive person. ';
      reply_text += 'There is two roles in this game, ';
      reply_text += 'The Resistance and The Spy. In ';
      reply_text += 'this game the resistance have a ';
      reply_text += 'mission to complete and the spy have ';
      reply_text += 'roles to sabotage the mission. ';
      reply_text += 'The resistance woldnt know who is ';
      reply_text += 'the spy, but the spy would know its ';
      reply_text += 'friends and enemies.\n';
      reply_text += 'To start the games type : "!new"';
    } else if (this.group_session.state === 'new') {
      reply_text += '[[RECRUIT THEM]]\n';
      reply_text += 'You need minimum of 5 person to ';
      reply_text += 'starts the game.';
      reply_text += 'To join the game, type : !join\n';
      reply_text += 'To cancel join, type   : !cancel\n';
      reply_text += 'To stop the game, type : !stop';
    } else if (this.group_session.state === 'choose') {
      reply_text += '[[Choose Your Team]]\n';
      reply_text += 'In this states, the person that ';
      reply_text += 'being choosed as a captain will ';
      reply_text += 'choose its squad to start the ';
      reply_text += 'mission.\n';
      reply_text += 'Choose ' + numOfTeam[this.group_session.players.length][this.group_session.round] + ' to start the mission.\n';
      reply_text += 'Keep cautios and beware.';
    } else if (this.group_session.state === 'vote') {
      reply_text += '[[Votes your decision]]\n';
      reply_text += 'In this states the player will ';
      reply_text += 'vote to the team that had been ';
      reply_text += 'created, either agree or disagree ';
      reply_text += 'with the captains decision.\n';
      reply_text += 'If half or more than half of the ';
      reply_text += 'players disagree then the mission ';
      reply_text += 'automatically stopped.\n';
      reply_text += 'Beware of the spies, they may try ';
      reply_text += 'to sabotage the mission.';
    } else if (this.group_session.state === 'mission') {
      reply_text += '[[Mission in Proggress]]\n';
      reply_text += 'In this states, the person that ';
      reply_text += 'had been chosen by the captain to ';
      reply_text += 'do the mission must tell me ';
      reply_text += 'wether they will successing or ';
      reply_text += 'failing the mission.\n';
    }
    return this.sendResponse(reply_text);
  },

  newCommand : function() {
    if (this.group_session.state !== 'idle') {
      return this.sendResponse('A game is already running.');
    }
    if (this.user_session.status === 'active') {
      return this.sendResponse('You are playing the game in other group.');
    }

    this.group_session.state = 'new';
    this.user_session.status - 'active';

    this.group_session.players = [];
    this.addPlayer({
      id      : this.user_session.id,
      name    : this.user_session.name,
      role    : 'resistance',
      mission : 'inactive',
      vote    : 'done',
    });
    this.group_session.round = 0;
    this.group_session.captain = 0;
    this.group_session.score = {
      resistance : 0,
      spy        : 0,
    };
    this.group_session.vote = {
      agree    : 0,
      disagree : 0,
    };
    this.group_session.mission = {
      success : 0,
      fail    : 0,
    };

    this.saveGroupData();
    this.saveUserData();

    let reply_text = 'Game has been created.\n';
    reply_text += this.user_session.name + ' has joined the game.\n';
    reply_text += 'Use !join to join.';
    this.sendResponse(reply_text);
  },

  joinCommand : function() {
    if (this.group_session.state === 'idle') {
      return this.sendResponse('No game is running. Use !new to start a new game');
    } else if (this.group_session.state !== 'new') {
      return this.sendResponse('Game is running.');
    }
    if (this.user_session.status === 'active') {
      if (this.user_session.groupId === this.group_session.groupId) {
        return this.sendResponse('You have joined.');
      } else {
        return this.sendResponse('You are playing in other group.');
      }
    }
    if (this.group_session.players.length === 10) {
      return this.sendResponse('Max number of players is 10.');
    }

    this.addPlayer({
      id      : this.user_session.id,
      name    : this.user_session.name,
      role    : 'resistance',
      mission : 'inactive',
      vote    : 'done',
    });
    this.user_session.status = 'active';

    this.saveGroupData();
    this.saveUserData();

    let reply_text = 'User ' + this.user_session.name + ' has joined.\n';
    if (this.group_session.players.length >= 5) {
      reply_text += 'There is enough player to start the game.\n';
      reply_text += 'Use !start to start the game.\n';
    }
    this.sendResponse(reply_text);
  },

  playerCommand : function() {
    if (this.group_session.state === 'idle') {
      return this.sendResponse('No game is running');
    }

    this.sendResponse(this.sendPlayerList());
  },

  cancelCommand : function() {
    if (this.group_session.state === 'idle') {
      return this.sendResponse('No game is created. Use !new to create.');
    } else if (this.group_session.state !== 'new') {
      return this.sendResponse('Game is already running');
    }
    if (this.indexOfPlayer() === -1) {
      return this.sendResponse('You are not registered as players');
    }

    let name = this.user_session.name;
    for (var i = this.indexOfPlayer(); i<this.group_session.players.length-1; i++) {
      this.group_session.players[i] = this.group_session.players[i+1];
    }
    this.group_session.players.pop();
    this.user_session.status = 'inactive';
    
    this.saveGroupData();
    this.saveUserData();

    let reply_text = 'User ' + name + ' left the game\n';
    reply_text += this.sendPlayerList();
    this.sendResponse(reply_text);
  },

  startCommand : function() {
    if (this.group_session.state === 'idle') {
      return this.sendResponse('No game is created. Use !new to create.');
    } else if (this.group_session.state !== 'new') {
      return this.sendResponse('Game is already running');
    }
    if (this.indexOfPlayer() === -1) {
      return this.sendResponse('You are not registered as players');
    }
    if (this.group_session.players.length < 5) {
      return this.sendResponse('Need minimum players of 5 to start the game');
    }

    this.group_session.captain = -1;
    this.group_session.round   = 0;
    this.group_session.score.resistance = 0;
    this.group_session.score.spy        = 0;
    this.randomSpy();

    let reply_text = 'The Game begins!\n';
    reply_text += 'You can check your role by PM "!role" to me';
    this.startNewRound('');
  },

  chooseCommand : function() {
    if (this.group_session.state !== 'choose') {
      if (this.group_session.state === 'idle') {
        return this.sendResponse('No game is running.');
      } else if (this.group_session.state === 'new') {
        return this.sendResponse('Game hasnt been started.');
      } else {
        return this.sendResponse('Its not choosing time');
      }
    }
    if (this.indexOfPlayer() !== this.group_session.captain) {
      return this.sendResponse('You are not the captain');
    }

    let chosen_player_index = this.searchChosenPlayer();
    if (chosen_player_index === -1) {
      return this.sendResponse('Player not found. Use exactly name of the player in !player');
    } else if (this.group_session.players[chosen_player_index].mission === 'pending') {
      return this.sendResponse('Player has been selected.');
    }

    this.group_session.players.[chosen_player_index].mission = 'pending';

    let count_chosen_player = 0;
    this.group_session.players.forEach(function(item, index) {
      if (item.mission === 'pending') {
        count_chosen_player++;
      }
    });

    if (count_chosen_player === numOfTeam[this.group_session.length][this.group_session.round]) {
      return this.startVote();
    } else {
      this.saveGroupData();

      let remTeam = numOfTeam[this.group_session.length][this.group_session.round] - count_chosen_player;
      let reply_text = this.group_session.players[chosen_player_index].name;
      reply_text += ' has been added.\n';
      reply_text += 'Use !list to check chosen team member\n';
      reply_text += 'You need ' + remTeam + ' team member remaining.\n';
      return this.sendResponse(reply_text);
    }
  },

  listCommand : function() {
    if (this.group_session.state === 'idle') {
      return this.sendResponse('No game is running.');
    } else if (this.group_session.state === 'new') {
      return this.sendResponse('Game hasnt been started. Maybe you mean "!player"?');
    }

    let reply_text = this.sendPlayerOnMissionList();
    this.sendResponse(reply_text);
  },

  voteCommand : function() {
    if (this.group_session.state !== 'vote') {
      if (this.group_session.state === 'idle') {
        return this.sendResponse('No game is running');
      } else if (this.group_session.state === 'new') {
        return this.sendResponse('Game hasnt been started');
      } else if (this.group_session.state === 'choose') {
        return this.sendResponse('Team Captain hasnt done choosing team member');
      } else {
        return this.sendResponse('Game is running.');
      }
    }
    if (this.indexOfPlayer() === -1) {
      return this.sendResponse('You are not part of this game');
    }
    if (this.group_session.players[this.indexOfPlayer()].vote === 'done') {
      return this.sendResponse(this.user_session.name + ', you have cast your vote');
    }
    if (this.args[1] !== 'agree' && this.args[1].disagree !== 'disagree') {
      return this.sendResponse('Invalid vote from ' + this.user_session.name);
    }

    this.group_session.players[this.indexOfPlayer()].vote = 'done';
    if (this.args[1] === 'agree') {
      this.group_session.vote.agree++;
    } else {
      this.group_session.vote.disagree++;
    }

    let disagree_vote_needed = Math.round(this.group_session.players.length / 2) - this.group_session.vote.disagree;
    let agree_vote_needed    = this.group_session.players.length - disagree_vote_needed + 1 - this.group_session.vote.agree;

    if (agree_vote_needed === 0) {
      this.startMission();
    } else if (disagree_vote_needed === 0) {
      let reply_text = '';
      reply_text += 'There are ' + this.group_session.vote.disagree + ' player disagree!\n';
      reply_text += 'Restart The Vote!\n\n';
      this.startNewTeamPick(reply_text);
    } else {
      this.saveGroupData();

      let reply_text = this.user_session.name;
      reply_text += ' has cast vote!\n';
      reply_text += '' + agree_vote_needed    + ' vote(s) needed to go to next step\n';
      reply_text += '' + disagree_vote_needed + ' vote(s) needed to go to cancel the team\n';
      this.sendResponse(reply_text);
    }
  },

  checkCommand : function() {
    if (this.group_session.state !== 'mission') {
      if (this.group_session.state === 'idle') {
        return this.sendResponse('No game is running');
      } else if (this.group_session.state === 'new') {
        return this.sendResponse('Game hasnt been started');
      } else if (this.group_session.state === 'choose') {
        return this.sendResponse('Team Captain hasnt done choosing team member');
      } else {
        return this.sendResponse('Mission hasnt been started, vote hasnt ended');
      }
    }

    let done_mission = this.group_session.mission.success + this.group_session.mission.fail;
    let left_mission = numOfTeam[this.group_session.players.length][this.group_session.round] - done_mission;
    if (left_mission === 0) {
      this.endMission();
    } else {
      let cnt = 1;
      let reply_text = '';
      reply_text += done_mission + ' has completed the mession.';
      reply_text += ' ' + left_mission + ' left:\n';
      this.group_session.players.forEach(function(item, index) {
        if (item.mission === 'pending') {
          reply_text += '' + cnt + '. ' + item.name;
        }
      });
      this.sendResponse(reply_text);
    }
  },

  stopCommand : function() {
    this.endGame();
    //
  },

  roleCommand : function() {
    this.sendResponse('Use this in PM! Nobody should know your role.');
    //
  },

  missionCommand : function() {
    this.sendResponse('Use this in PM! Nobody should know your result.');
    //
  },

  /*** OPERATION LIST ***/

  addPlayer : function(new_player) {
    this.group_session.players.push(new_player);
    //
  },

  indexOfPlayer : function() {
    let found = -1;
    this.group_session.players.forEach(function(item, index) {
      if (item.id === this.user_session.id) {
        found = index;
      }
    });

    return found;
  },

  randomSpy: function() {
    let index = [];
    for (var i = 0; i<this.group_session.players.length; i++) {
      index.push(i);
    }
    index = shuffleArray(index);
    for (var i = 0; i<numOfSpy[this.group_session.players.length]; i++) {
      this.group_session.players[index[i]].role = 'spy';
    }
  },

  shuffleArray : function(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },

  searchChosenPlayer : function() {
    let chosen_player_name = '';
    args.forEach(function(item, index) {
      if (index !== 0) {
        if (index !== 1) {
          chosen_player_name += ' ';
        }
        chosen_player_name += item;
      }
    });

    let index_found = -1;
    this.group_session.players.forEach(function(item, index) {
      if (item.name === chosen_player_name) {
        index_found = index;
      }
    });
    return index_found;
  },

  startNewRound : function(pre_reply_text) {
    this.group_session.round += 1;

    pre_reply_text += 'Round ' + this.group_session.round + ' begins!\n';
    
    this.startNewTeamPick(pre_reply_text);
  },

  startNewTeamPick : function(pre_reply_text) {
    this.group_session.state   = 'choose';
    this.group_session.captain = (this.group_session.captain + 1) % this.group_session.players.length;
    for (var i in this.group_session.players) {
      this.group_session.players[i].mission = 'inactive';
    }

    this.saveGroupData();

    let reply_text = pre_reply_text;
    reply_text += this.group_session.players[this.group_session.captain].name;
    reply_text += ' is the captain!\n';
    reply_text += 'Choose your team member using their full name below\n';
    reply_text += this.sendPlayerList();
    reply_text += 'Usage: !choose <full-name>\n';
    reply_text += 'You need ' + numOfTeam[this.group_session.players.length][this.group_session.round];
    reply_text += ' to continue\n\n';

    this.sendResponse(reply_text);
  },

  startVote : function() {
    for (var i in this.group_session.players) {
      this.group_session.players[i].vote = 'pending';
    }
    this.group_session.vote.agree    = 0;
    this.group_session.vote.disagree = 0;
    this.group_session.state = 'vote';

    this.saveGroupData();

    let reply_text = 'Vote has been started!\n';
    reply_text += 'Use "!vote agree" or "!vote disagree"\n';
    reply_text += 'Use "!list" to see chosen team\n';
    this.sendResponse(reply_text);
  },

  startMission : function() {
    this.group_session.mission.success = 0;
    this.group_session.mission.fail    = 0;
    this.group_session.state           = 'mission';

    this.saveGroupData();

    let reply_text = '';
    reply_text += 'Mission started!\n';
    reply_text += 'PM to me with "!mission success"\n';
    reply_text += 'if you are resistance. You can choose\n';
    reply_text += 'to success or failing the mission with\n';
    reply_text += 'PM "!mission fail" to me if you are spy\n\n';
    reply_text += 'Use !check to check result.\n\n';
    reply_text += 'Beware! Spies need ' + numOfFail[this.group_session.players.length][this.group_session.round];
    reply_text += ' fail to make this mission fail.';
    this.sendResponse(reply_text);
  },

  endMission : function() {
    let winner = 'resistance';
    if (this.group_session.mission.fail >= numOfFail[this.group_session.players.length][this.group_session.round]) {
      winner = 'spy';
    }

    if (winner === 'resistance') {
      this.group_session.score.resistance++;
    } else {
      this.group_session.score.spy++;
    }

    if (this.group_session.score.resistance === 3 || this.group_session.score.spy === 3) {
      this.endGame();
    } else {
      let reply_text = '';
      if (winner === 'resistance') {
        reply_text += 'No fail vote!\n';
        reply_text += 'Mission success! One point for resistance\n';
      } else {
        reply_text += 'There are ' + this.group_session.mission.fail + ' person make this mission fail!\n';
        reply_text += 'Beware! One point for spy!\n';
      }
      this.startNewRound(reply_text);
    }
  },

  endGame : function() {
    this.group_session.state = 'idle';

    const data = require('./data.js');
    data.resetAllPlayers(this.group_session.players);

    this.saveGroupData();

    let cnt = 1;
    let reply_text = '';
    if (this.group_session.score.spy === 3) {
      reply_text += 'Spies win the game!\n';
    } else if (this.group_session.score.resistance === 3) {
      reply_text += 'Resistance wins the game!\n';
    }
    reply_text += 'The spies are:\n';
    this.group_session.players.forEach(function(item, index) {
      if (item.role === 'spy') {
        reply_text += '' + cnt + '. ' + item.name + '\n';
        cnt++;
      }
    });
    this.sendResponse(reply_text);
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