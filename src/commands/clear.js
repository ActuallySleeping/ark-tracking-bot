const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'clear',
	guildOnly: true,
	cooldown: 120,
	permissions: 'MANAGE_MESSAGES',
	aliases: ['c'],
	execute(message, args, client, db) {
		message.delete().catch(err=>{return})

		if( args[0].length && args[0]==0){
			return;
		}

		if(!message.guild.me.hasPermission('MANAGE_MESSAGES')){
			message.channel.send('I cant delete messages, I\'m missing the permission: Manage messages.')
			return;
		}

		const _ = ( args[0] && args[0].length ? Math.floor((args[0]-1)/100) : 1);

		for (let i=0; i<_; i++){
			message.channel.bulkDelete(100).catch(err=>{return});
		}

		message.channel.bulkDelete( 
			args[0] && args[0].length ? args[0] - _ * 100 : 100).catch(err=>{return});

		message.channel.send("Clear Request Performed")
		  .catch(e=>{return})
		  .then(msg => {msg.delete({timeout:2500})
		  				.catch(err=>{return});});
	},
};