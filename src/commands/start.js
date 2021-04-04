const sqlite3 = require('sqlite3').verbose();

const config = require(`${__dirname}/../config.json`)
const { checkIp } = require(`${__dirname}/../tools/toolbox.js`)
const { generateEmbed } = require(`${__dirname}/../tools/embedGenerator.js`)

module.exports = {
	name: 'start',
	args: true,
	cooldown: 60,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['sa'],
	async execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})

		db.all(`SELECT * FROM Users WHERE id=?`, [message.author.id] , async (err,row) => {
			if(args.length>=20 || row!=undefined && row[0].servers+args.length>=20){
				message.channel.send("You will follow too many servers (limit is 20)!").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return})
				return
			}
			if(args.every(checkIp)){
				message.channel.send("Please insert ip with the correct format (x.x.x.x:port)!").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return})
				return
			}

			let ip="", port=""
			for(let i=0;i<args.length-1;i++){
				ip += args[i].split(":")[0] + "#"
				port += args[i].split(":")[1] + "#"
			}
			ip += args[args.length-1].split(":")[0]
			port += args[args.length-1].split(":")[1]

			if(row != undefined){
				db.run(`REPLACE INTO Users(id,servers) VALUES(?,?)`,[message.author.id,row[0].servers+args.length],err=>{return})
			} else{
				db.run(`REPLACE INTO Users(id,servers) VALUES(?,?)`,[message.author.id,args.length],err=>{return})
			}

			message.channel.send(" ‎",await generateEmbed(client,ip.split('#'),port.split('#').map(Number),db))
			  .catch(err=>{return})
			  .then(msg => {
				db.run(`INSERT INTO Tracked (guildid,channelid,messageid,ips,ports,authorid) VALUES(?,?,?,?,?,?)`,
					[msg.guild.id,msg.channel.id,msg.id,ip,port,message.author.id],err=>{return})
			})
		})
	},
};