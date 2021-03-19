const tools = require(`${__dirname}/../tools/embedGenerator.js`)
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	name: 'playerstart',
	args: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['ps','pstart','players'],
	async execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})

		if(args.length<2){
			message.channel.send("Too few arguments, you must have the server ip with the format x.x.x.x:p and at least one name of a player").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
			return 
		}
		if(args[0].split(':').length != 2){
			message.channel.send("IP must be at the format x.x.x.x:p, like 170.21.1.247:27016").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
			return
		}
		let db = new sqlite3.Database(baselocation)
		for(let i=1;i<args.length;i++){
			db.run(`INSERT INTO InformationPlayer(guildid,channelid,name,ip,port) VALUES(?,?,?,?,?)`,[message.guild.id,message.channel.id,args[i],args[0].split(':')[0],args[0].split(":")[1]],(err)=>{
				if(err!=undefined){
					if(err.errno==19){
						message.channel.send(`The player ${args[i]} is already tracked on this Discord server with this ARK server`).then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
					}
				}
			})
		}
		db.close()
	},
};