const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'stop',
	guildOnly: true,
	cooldown: 60,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['so'],
	async execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})

		if(args.length>0){
			db.all(`SELECT FROM TrackedServers WHERE messageid=? AND channelid=? AND guildid=?`,[args[0],message.channel.id,message.guild.id],async (err,rows)=>{
				for (let i in rows){
					let length = rows[i].ipSave.split('#').length
					await db.all(`SELECT * FROM Users WHERE authorid=?`,message.author.id,(err,rows)=>{
						if(rows!=undefined && rows.length>0){
							db.run(`REPLACE INTO Users(authorid,nbServerTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,rows[0].nbServerTracking-length,rows[0].nbPlayerTracking])
						}
					else{return}
					})
				}
			})
			db.run(`DELETE FROM TrackedServers WHERE messageid=? AND channelid=? AND guildid=?`,[args[0],message.channel.id,message.guild.id])
			return
		}
		db.all(`SELECT * FROM InformationMessage WHERE channelid=? AND guildid=?`,[message.channel.id,message.guild.id],async (err,rows)=>{
			if(rows!=undefined && rows.length>0){
				for (let i in rows){
					let length = rows[i].ipSave.split('#').length
					await db.all(`SELECT * FROM Users WHERE authorid=?`,message.author.id,(err,rows)=>{
						if(rows!=undefined && rows.length>0){
							db.run(`REPLACE INTO Users(authorid,nbServerTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,rows[0].nbServerTracking-length,rows[0].nbPlayerTracking])
						}
					else{return}
					})
				}
				db.run(`DELETE FROM TrackedServers WHERE channelid=? AND guildid=?`,[message.channel.id,message.guild.id])
			}
			else{
				message.channel.send(`Found no message to delete`).then(msg=>{msg.delete({timeout:2500})})
				return
			}
		})
	},
};