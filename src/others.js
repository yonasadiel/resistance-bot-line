module.exports = {
  client        : '',
  event         : '',
  args          : [],
  user_session  : {},

  receive : function(client, event, args, user_session) {
  	this.client        = client;
  	this.event         = event;
  	this.args          = args;
  	this.user_session  = user_session;

  	this.sendResponse('Our system dont have auto-reply. Wait for me to check your message. Thanks!');
  },

  sendResponse : function(text) {
    return this.client.replyMessage(this.event.replyToken,{
      type : "text",
      text : text,
    });
  },
	
}