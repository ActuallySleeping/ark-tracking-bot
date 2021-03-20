const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'playerstop',
	guildOnly: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['po','pstop','playero'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(args.length>0){
			if(args[0].split(':').length>1){
				let db = new sqlite3.Database(baselocation)
				db.all(`SELECT * FROM InformationPlayer WHERE ip=? AND port=? AND channelid=? AND guildid=?`,[args[0].split(':')[0],args[0].split(':')[1],message.channel.id,message.guild.id],(err,rows)=>{
					if(rows!=undefined && rows.length>0){
						db.all(`SELECT * FROM InformationUsers WHERE authorid=?`,[message.author.id],(err,row)=>{
							db.run(`REPLACE INTO InformationUsers(authorid,nbserverTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,row[0].nbServerTracking,row[0].nbPlayerTracking-rows.length])
						})
					}
				})
				db.run(`DELETE FROM InformationPlayer WHERE ip=? AND port=? AND channelid=? AND guildid=?`,[args[0].split(':')[0],args[0].split(':')[1],message.channel.id,message.guild.id],(err)=>{return})
				db.close()
				return
			}
			let db = new sqlite3.Database(baselocation)
			db.all(`SELECT * FROM InformationPlayer WHERE name=? AND channelid=? AND guildid=?`,[args[0],message.channel.id,message.guild.id],(err,rows)=>{
				if(rows!=undefined && rows.length>0){
					db.all(`SELECT * FROM InformationUsers WHERE authorid=?`,[message.author.id],(err,row)=>{
						db.run(`REPLACE INTO InformationUsers(authorid,nbserverTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,row[0].nbServerTracking,row[0].nbPlayerTracking-rows.length])
					})
				}
			})
			db.run(`DELETE FROM InformationPlayer WHERE name=? AND channelid=? AND guildid=?`,[args[0],message.channel.id,message.guild.id],(err)=>{console.log})
			db.close()
			return
		}
		let db = new sqlite3.Database(baselocation)
		db.all(`SELECT * FROM InformationPlayer WHERE channelid=? AND guildid=?`,[message.channel.id,message.guild.id],(err,rows)=>{
			if(rows!=undefined && rows.length>0){
				db.all(`SELECT * FROM InformationUsers WHERE authorid=?`,[message.author.id],(err,row)=>{
					db.run(`REPLACE INTO InformationUsers(authorid,nbserverTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,row[0].nbServerTracking,row[0].nbPlayerTracking-rows.length])
				})
			}
		})
		db.run(`DELETE FROM InformationPlayer WHERE channelid=? AND guildid=?`,[message.channel.id,message.guild.id],(err)=>{return})
		db.close()
	},
};