module.exports = {
	name: 'defaultcluster',
	aliases: ['dc'],
	execute(client, message, args, baselocation) {
		message.delete({timeout:10}).catch(err=>{return})
		message.channel.send(" ‎",{embed:{
			color: 15105570,
			author: {name : client.username,icon_url: client.user.avatarURL},
			fields:[{
				name:"List of Servers",
				value:' ‎\n**ARKLIFE** - PvP\n\`145.239.205.193:27015 145.239.205.193:27025 145.239.205.193:27035 145.239.205.193:27045 145.239.205.193:27055 145.239.205.193:27065 145.239.205.193:27075 145.239.205.193:27095 145.239.205.193:27105\` \n\n'
				+ '**ARKLIFE** - PvEvP\n\`145.239.205.193:27085 145.239.205.193:27115\` \n\n'
			}]
		}})
		  .then(msg=>{msg.delete({timeout:20000}).catch(err=>{return})}).catch(err=>{return})
	},
};