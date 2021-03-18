module.exports = {
	name: 'start',
	args: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['s','sa'],
	async execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(!(message.channel.permissionsFor(message.member).has("MANAGE_GUILD") || message.author.id=="224142905537855489")){
			message.channel.send("You must have the Manage Server permission")
			  .then(msg => {msg.delete({timeout:2500})})
		return
		}

		let ipSave=[]
		let portSave=[]

		if(args.length>20){
			message.channel.send("Too many arguments").then(msg=>{msg.delete({timeout:2500})})
			return 
		}
		for(let i=0;i<args.length;i++){
			ipSave.push(args[i].split(":")[0])
			portSave.push(parseInt(args[i].split(":")[1]))
		}
		let ips = ipSave;
		let ports = portSave;
		message.channel.send("‎ ‎",await generateEmbed(ips,ports))
		  .then(msg => {
			let db = new sqlite3.Database(baselocation)
			db.run(`INSERT INTO InformationMessage (channelid,messageid,ipsave,portSave) VALUES(?,?,?,?)`,[msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
			db.close()

			let ips = ipSave;
			let ports = portSave;

			let timer = setInterval(function() {
				generateMessage(timer,msg,msg.channel,msg.id,ips,ports)
			}, 30000)

		  })
	},
};