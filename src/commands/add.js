const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'add',
	guildOnly: true,
	cooldown: 1,
	args : true,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['a'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(args.length<2){message.channel.send('Require at least the id of the message and the name of the server or the ip:port').then(msg=>{msg.delete({timeout:2500})})}
		let ipSave="",portSave=""
		for(let i=1;i<args.length;i++){
			if(!(args[i]=='' || args[i]==' ' || args[i]==undefined)){
				ipSave += args[i].split(":")[0]
				portSave += args[i].split(":")[1]
			}
			if(i!=args.length-1){ipSave+='#';portSave+='#'}
		}

		let db = new sqlite3.Database(baselocation)
		db.all(`SELECT * FROM InformationMessage WHERE messageid=? AND channelid=?`,[args[0],message.channel.id], (err,rows) => {
			if(rows!=undefined && rows.length>0){
				db.run(`UPDATE InformationMessage SET ipSave=?,portSave=? WHERE messageid=? AND channelid=?`,[rows[0].ipSave+'#'+ipSave,rows[0].portSave+'#'+portSave,args[0],message.channel.id])
			}
			else{
				message.channel.send("Found no message with this ID in this channel").then(msg=>{msg.delete({timeout:2500})})
			}
		})
		db.close()
	},
};