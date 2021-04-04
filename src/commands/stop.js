const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'stop',
	cooldown: 60,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['so'],
	async execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})

		if(args.length>0){
			db.all(`SELECT * FROM Tracked WHERE messageid=? AND channelid=? AND guildid=?`,
			  [args[0],message.channel.id,message.guild.id],async (err,rows)=>{

			  	if(rows!=undefined && rows.length>0){
					await db.all(`SELECT * FROM Users WHERE id=?`,
						[rows[0].authorid],(err,row)=>{
						if(row!=undefined && row.length>0){
							db.run(`REPLACE INTO Users(id,servers) VALUES(?,?)`,
							  [rows[0].authorid,row[0].servers-rows[0].ips.split('#').length])
						} else{return}

					})
		  			message.channel.messages.fetch(rows[0].messageid)
					  .catch(err=>{console.log})
					  .then(msg => {
					  	msg.delete({timeout:10}).catch(err=>{console.log})
					  })
					db.run(`DELETE FROM Tracked WHERE messageid=? AND channelid=? AND guildid=?`,
					  [args[0],message.channel.id,message.guild.id])
					
				} else{
					message.channel.send(`Found no message to delete`).then(msg=>{msg.delete({timeout:2500}).catch(err=>{return})})
				}
			})
		} else{
			db.all(`SELECT * FROM Tracked WHERE channelid=? AND guildid=?`,
			  [message.channel.id,message.guild.id],async (err,rows)=>{
			  	let store = []
			  	if(rows!=undefined){
			  		for await (let row of rows){

			  			if(store.findIndex(element => element.authorid === row.authorid) != -1 ){
			  				store[store.findIndex(element => element.authorid === row.authorid)].count += row.ips.split('#').length
			  			} else{
			  				store.push({
			  					authorid : row.authorid,
			  					count    : row.ips.split('#').length
			  				})
			  			}
			  			message.channel.messages.fetch(row.messageid)
						  .catch(err=>{return})
						  .then(msg => {
						  	msg.delete({timeout:10}).catch(err=>{return})
						  })
			  		}
					db.run(`DELETE FROM Tracked WHERE channelid=? AND guildid=?`,
			  		  [message.channel.id,message.guild.id])
				} else{
					message.channel.send(`Found no message to delete`).then(msg=>{msg.delete({timeout:2500}).catch(err=>{return})})
				}
				for await (let stock of store){
					await db.all(`SELECT * FROM Users WHERE id=?`,
						[stock.authorid],(err,row)=>{
						if(row!=undefined && row.length>0){
							db.run(`REPLACE INTO Users(id,servers) VALUES(?,?)`,
							  [stock.authorid,row[0].servers-stock.count])
						} else{return}
					})
				}
			})
		}
	},
};