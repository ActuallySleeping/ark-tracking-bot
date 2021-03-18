module.exports = {
	name: 'stop',
	aliases: ['so'],
	execute(client, message, args, baselocation) {
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