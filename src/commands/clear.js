const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'clear',
	guildOnly: true,
	cooldown: 10,
	permissions: 'MANAGE_MESSAGES',
	aliases: ['c'],
	execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})
		let j=0,amountleft=args[0]
		if(args[0]==0 || args[0]==undefined){amountleft=100}
		if(args[0]>100){
			for(let i=0;i<Math.floor(args[0]/100);i++){message.channel.bulkDelete(100)}
			amountleft=args[0]-(Math.floor(args[0]/100)*100)
		}
		
		message.channel.bulkDelete(amountleft)
		message.channel.send("Clear Request Performed")
		  .then(msg => {msg.delete({timeout:2500}).catch(err=>{return})})
		  .catch(err=>{return})
	},
};