
/**
 * Configuration File
 * ------------------
 * All variable that are needed
 * for configuration will be
 * presented here
 */

// you can get channel access token and channel secret in line developer page
var channelAccessToken = 'UtP+/RIULjGi1MZ7Kh1861KGlZsmgTkrUrTfg2j/QAbKlT8q5NGUiM329ijRqtoUsc64dX4f/YZDnq7lrRhSxD5gS70Jl2/V3GFQq/qrpATKx9MigPEdEJiySdEykCbFay6U8dV3N6aGzpTJo9ujXwdB04t89/1O/w1cDnyilFU=';
var channelSecret      = 'fae63d588748fa68a4611c041465bfe0';
// Customize your own command symbol
// only message prefixed with command symbol
// that will be processed
// You can leave it blank for processing all
// message received
var commandSymbol      = '!';

module.exports = {
	channelAccessToken : channelAccessToken,
	channelSecret      : channelSecret,
	commandSymbol      : commandSymbol
};