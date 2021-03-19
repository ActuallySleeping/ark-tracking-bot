const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'serverstop',
	guildOnly: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['so','sstop','servero'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(args.length>0){
			let db = new sqlite3.Database(baselocation)
			db.run(`DELETE FROM InformationMessage WHERE messageid=? AND channelid=?`,args[0],message.channel.id)
			db.close()
			return
		}
		let db = new sqlite3.Database(baselocation)
		db.run(`DELETE FROM InformationMessage WHERE channelid=?`,message.channel.id)
		db.close()
	},
};