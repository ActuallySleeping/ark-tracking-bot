module.exports = {
	name: 'help',
	cooldown: 60,
	aliases: ['h'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		message.channel.send(" ‎",{embed:{
			color: 15105570,
			author: {name : client.username,icon_url: client.user.avatarURL},
			fields:[{
				name:"List of commands",
				value:' ‎\n**&start** x.x.x.x:p ... / **&s** x.x.x.x:p ... \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎start a new player list of a server, maximum of 20 servers\n\n'
					+'**&clear** <amount> / **&c** <amount> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎delete message \n\n'
					+'**&stop** <message id> / **&s** <message id> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎remove all the active list in the channel/with the message id given\n\n'
					+'**&defaultcluster** / **&dc** \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎give you a list of all the ips of different cluster\n\n'
					+'**Invite the bot** \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎Follow the link: https://bit.ly/30LMOoe\n\n'
			}]
		}})
		  .then(msg=>{msg.delete({timeout:60000}).catch(err=>{return})}).catch(err=>{return})
	},
};