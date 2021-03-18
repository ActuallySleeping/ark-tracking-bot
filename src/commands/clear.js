module.exports = {
	name: 'clear',
	aliases: ['c'],
	execute(client, message, args, baselocation) {
		message.delete({timeout:10}).catch(err=>{return})
		if(!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")){
			message.channel.send("You must have the Manage Messages permission")
			  .then(msg => {msg.delete({timeout:2500})})
			return
		}
		let j=0,amountleft=args[0]
		if(args[0]==0 || args[0]==undefined){amountleft=100}
		if(args[0]>100){
			for(let i=0;i<Math.floor(args[0]/100);i++){message.channel.bulkDelete(100)}
			amountleft=args[0]-(Math.floor(args[0]/100)*100)
		}
		
		message.channel.bulkDelete(amountleft)
		message.channel.send("Clear Request Performed")
		  .then(msg => {msg.delete({timeout:2500})})
	},
};