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
		let db = new sqlite3.Database(baselocation)
		await db.all(`SELECT * FROM InformationUsers WHERE authorid=?`,message.author.id,(err,rows)=>{
			if(rows!=undefined && rows.length>0){
				if(rows[0].nbPlayerTracking>=30){
					message.channel.send("You already track 30 players").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return})
					return
				}
				if(rows[0].nbPlayerTracking + args.length-1 >= 30){
					message.channel.send(`You are going to track too many players, you already track ${rows[0].nbServerTracking} players and wanted to track ${args.length} more, and the maximum is 30`).then(msg=>{msg.delete({timeout:7500})}).catch(err=>{return})
					return
				}
				if(args.length<2){
					message.channel.send("Too few arguments, you must have the server ip with the format x.x.x.x:p and at least one name of a player").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
					return 
				}
				if(args[0].split(':').length != 2){
					message.channel.send("IP must be at the format x.x.x.x:p, like 170.21.1.247:27016").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
					return
				}
				db.run(`REPLACE INTO InformationUsers(authorid,nbServerTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,rows[0].nbPlayerTracking+args.length-1,0])
				for(let i=1;i<args.length;i++){
					db.run(`INSERT INTO InformationPlayer(guildid,channelid,name,ip,port) VALUES(?,?,?,?,?)`,[message.guild.id,message.channel.id,args[i],args[0].split(':')[0],args[0].split(":")[1]],(err)=>{
						if(err!=undefined){
							if(err.errno==19){
								message.channel.send(`The player ${args[i]} is already tracked on this Discord server with this ARK server`).then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
							}
						}
					})
				}
			}
			else{
				if(args.length-1<30){
					if(args.length<2){
						message.channel.send("Too few arguments, you must have the server ip with the format x.x.x.x:p and at least one name of a player").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
						return 
					}
					if(args[0].split(':').length != 2){
						message.channel.send("IP must be at the format x.x.x.x:p, like 170.21.1.247:27016").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
						return
					}
					db.run(`REPLACE INTO InformationUsers(authorid,nbServerTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,rows[0].nbPlayerTracking+args.length-1,0])
					for(let i=1;i<args.length;i++){
						db.run(`INSERT INTO InformationPlayer(guildid,channelid,name,ip,port) VALUES(?,?,?,?,?)`,[message.guild.id,message.channel.id,args[i],args[0].split(':')[0],args[0].split(":")[1]],(err)=>{
							if(err!=undefined){
								if(err.errno==19){
									message.channel.send(`The player ${args[i]} is already tracked on this Discord server with this ARK server`).then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
								}
							}
						})
					}
				}
				else{
					message.channel.send(`You are trying too track too many player, the maximum is 30`).then(msg=>{msg.delete({timeout:7500})}).catch(err=>{return})
					return
				}
			}
		})
		db.close()
	},
};