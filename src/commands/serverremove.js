const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'serverremove',
	guildOnly: true,
	cooldown: 10,
	args : true,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['sr','sremove','serverr'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(args.length<2){message.channel.send('Require at least the id of the message and the name of the server or the ip:port').then(msg=>{msg.delete({timeout:2500})})}
		
		for(let i=2;i<args.length;i++){
			if(!(args[i]=='' || args[i]==' ' || args[i]==undefined)){
				args[1]+=" "+args[i]
			}
		}
		args[1]+=" "

		let db = new sqlite3.Database(baselocation)
		db.all(`SELECT * FROM InformationMessage WHERE messageid=? AND channelid=?`,[args[0],message.channel.id], (err,rows) => {
			if(rows!=undefined && rows.length>0){
				if(args[1].includes(':')){
					for (let k=0;k<rows[0].ipSave.split("#").length;k++){
						if(args[1].split(':')[0] == rows[0].ipSave.split("#")[k] && Number(rows[0].portSave.split("#")[k])==Number(args[1].split(':')[1])){
							let ipSave="",portSave=""
							for (let j=0;j<k;j++){
								ipSave += rows[0].ipSave.split('#')[j] + '#'
								portSave += rows[0].portSave.split('#')[j] + '#'
							}
							for (let j=k+1;j<rows[0].ipSave.split("#").length;j++){
								ipSave += rows[0].ipSave.split('#')[j] + '#'
								portSave += rows[0].portSave.split('#')[j] + '#'
							}
							let fIpSave = "", fPortSave = "", j=rows[0].ipSave.split("#").length-2
							for (let i=0;i<j;i++){
								fIpSave+=ipSave.split('#')[i]+'#'
								fPortSave+=portSave.split('#')[i]+'#'
							}
							fIpSave+=ipSave.split('#')[j]
							fPortSave+=portSave.split('#')[j]
							db.all(`SELECT * FROM InformationUsers WHERE authorid=?`,message.author.id,(err,rows)=>{
								if(rows!=undefined && rows.length>0){
									db.run(`REPLACE INTO InformationUsers(authorid,nbServerTracking,nbPlayerTracking) VALUES(?,?,?)`,[message.author.id,rows[0].nbServerTracking-1,0])
								}
							})
							db.run('UPDATE InformationMessage SET ipSave=?,portSave=? WHERE messageid=? AND channelid=?',[fIpSave,fPortSave,args[0],message.channel.id])
						}
					}
				}
			}
		})
		db.close()
	},
};