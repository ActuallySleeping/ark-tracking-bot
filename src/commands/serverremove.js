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
					for (let row in rows){
						for (let i=0;i<row.ipSave.split("#").length;i++){
							console.log(args[1].split(':')[1],row.portSave.split("#")[i])
							if(args[1].split(':')[0] === row.ipSave.split("#")[i] && args[1].split(':')[1] === row.portSave.split("#")[i]){
								let ipSave="",portSave=""
								for (let j=0;j<i;j++){
									ipSave += row.ipSave.split('#')[j]
									portSave += row.portSave.split('#')[j]
								}
								for (let j=i+1;j<row.ipSave.split("#").length;j++){
									ipSave += row.ipSave.split('#')[j]
									portSave += row.portSave.split('#')[j]
								}
								db.run('UPDATE InformationMessage SET ipSave=?,portSave=? WHERE messageid=? AND channelid=?',[ipSave,portSave,args[0],message.channel.id])
							}
						}
					}
				}
				else{
					db.all(`SELECT * FROM InformationServer WHERE name=?`,args[1],(err,rows2)=>{
						if(rows2!=undefined && rows2.length>0){
							let ipSave ="",portSave=""
							for (let i=0;i<rows[0].ipSave.split("#").length;i++){
								if(rows[0].ipSave.split("#")[i]===rows2[0].ip && rows[0].portSave.split("#").map(Number)[i]!=rows2[0].port){
									ipSave+=rows[0].ipSave.split("#")[i]+"#"
									portSave+=rows[0].portSave.split("#")[i]+"#"
								}
							}
							ipSave=ipSave.split("#")
							portSave=portSave.split("#")
							let j=ipSave.length-3,fIpSave="",fPortSave=""
							for(let i=0;i<j;i++){
								fIpSave+=ipSave[i]+"#"
								fPortSave+=portSave[i]+'#'
							}
							fIpSave+=ipSave[ipSave.length-2]
							fPortSave+=portSave[ipSave.length-2]
							db.run('UPDATE InformationMessage SET ipSave=?,portSave=? WHERE messageid=? AND channelid=?',[fIpSave,fPortSave,rows[0].messageid,message.channel.id])
						}
					})
				}
			}
		})
		db.close()
	},
};