const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'help',
	cooldown: config.cooldown.help,
	aliases: ['h'],
	execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})
		message.channel.send(" ‎",{embed:{
			color: 15105570,
			author: {name : client.username,icon_url: client.user.avatarURL},
			fields:[{
				name:"List of commands",
				value:' ‎\n**&start** x.x.x.x:p ... / **&sa** x.x.x.x:p ... \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎start a new player list of a server, maximum of 20 servers\n\n'
					+'**&clear** <amount> / **&c** <amount> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎delete messages \n\n'
					+'**&stop** <message id> / **&so** <message id> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎remove all the active list in the channel/with the message id given\n\n'
					+'**Invite the bot** \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎Follow the link: https://bit.ly/30LMOoe\n\n'
			}]
		}})
		  .then(msg=>{msg.delete({timeout:60000}).catch(err=>{return})}).catch(err=>{return})
	},
};