const tools = require(`${__dirname}/../tools/embedGenerator.js`)
const sqlite3 = require('sqlite3').verbose();

const config = require(`${__dirname}/../config.json`)

function toString(array){
	let message=""
	for(let i=0;i<array.length-1;i++){message+=array[i]+"#"}
	message+=array[array.length-1]
	return message
}

module.exports = {
	name: 'serverstart',
	args: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['ss','sstart','servers'],
	async execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})

		let db = new sqlite3.Database(baselocation)
		await db.all(`SELECT * FROM Users WHERE id=?`,message.author.id,(err,rows)=>{
			if(rows!=undefined && rows.length>0){
				if(rows[0].servers>=20){
					message.channel.send("You already follow 20 servers").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return})
					return
				}
				if(rows[0].servers + args.length >= 20){
					message.channel.send(`You are going to follow too many server, you already follow ${rows[0].servers} servers and wanted to follow ${args.length} more, and the maximum is 20`).then(msg=>{msg.delete({timeout:7500})}).catch(err=>{return})
					return
				}
				else{
					db.run(`REPLACE INTO Users(id,servers,players) VALUES(?,?,?)`,[message.author.id,rows[0].servers+args.length,rows[0].players])
					let ipSave=[]
					let portSave=[]
					for(let i=0;i<args.length;i++){
						ipSave.push(args[i].split(":")[0])
						portSave.push(parseInt(args[i].split(":")[1]))
					}
					let ips = ipSave;
					let ports = portSave;
					tools.generateEmbed(client,ips,ports).then(embed => {
						message.channel.send("‎ ‎",embed )
						  .then(msg => {
							let db = new sqlite3.Database(baselocation)
							db.run(`INSERT INTO TrackedServers (guildid,channelid,messageid,ips,ports) VALUES(?,?,?,?,?)`,[msg.guild.id,msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
							db.close()

							let ips = ipSave;
							let ports = portSave;

							let timer = setInterval(function() {
								tools.generateMessage(timer,client,msg,msg.channel,msg.id,ips,ports)
							}, 30000)

						})
					})
				}
			}
			else{
				if(args.length<20){
					db.run(`REPLACE INTO Users(id,servers) VALUES(?,?)`,[message.author.id,args.length])
					let ipSave=[]
					let portSave=[]
					for(let i=0;i<args.length;i++){
						ipSave.push(args[i].split(":")[0])
						portSave.push(parseInt(args[i].split(":")[1]))
					}
					let ips = ipSave;
					let ports = portSave;
					tools.generateEmbed(client,ips,ports).then(embed => {
						message.channel.send("‎ ‎",embed )
						  .then(msg => {
							let db = new sqlite3.Database(baselocation)
							db.run(`INSERT INTO TrackedServers (guildid,channelid,messageid,ips,ports) VALUES(?,?,?,?,?)`,[msg.guild.id,msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
							db.close()

							let ips = ipSave;
							let ports = portSave;

							let timer = setInterval(function() {
								tools.generateMessage(timer,client,msg,msg.channel,msg.id,ips,ports)
							}, 30000)

						})
					})
				}
				else{
					message.channel.send(`You are trying too follow too many server, the maximum is 20`).then(msg=>{msg.delete({timeout:7500})}).catch(err=>{return})
					return
				}
			}
		})
		db.close()
	},
};