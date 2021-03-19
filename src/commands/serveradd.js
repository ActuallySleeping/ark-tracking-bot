const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'serveradd',
	guildOnly: true,
	cooldown: 10,
	args : true,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['sa','sadd','servera'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(args.length<2){message.channel.send('Require at least the id of the message and the name of the server or the ip:port').then(msg=>{msg.delete({timeout:5000})})}
		let ipSave="",portSave=""
		for(let i=1;i<args.length;i++){
			if(args[i].split(":").length!=2){
				message.channel.send("IP(s) must be with the format: x.x.x.x:p, example: 170.15.26.248:27018").then(msg=>{msg.delete({timeout:5000})}).catch(err=>{return})
				return
			}
		}
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
				message.channel.send("Found no message with this ID in this channel").then(msg=>{msg.delete({timeout:2500})}).catch(err=>{return})
			}
		})
		db.close()
	},
};