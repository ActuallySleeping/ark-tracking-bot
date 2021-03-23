const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const rv = require(`${__dirname}/removeVersion.js`)
const baselocation = `${__dirname}/../../../base.db`

const getServerName = async (ip,port)=>{
	let result=""
	let db = new sqlite3.Database(baselocation)
	await query.info(ip,port,500).then(info=>{
		if(info.map==null && info.game==null){
			db.all(`SELECT * FROM SavedServers WHERE ip=? AND port=?`,[ip,port], (err,rows)=>{
				if(rows==undefined || rows.length==0){
					result=ip+":"+port+' (Not Responding)'
				}
				else{
					result=rows[0].name+' (Not Responding)'
				}
			})	
		}
		else{
			db.run(`REPLACE INTO SavedServers (ip,port,name,map,game) VALUES (?,?,?,?,?)`,[ip,port,rv.removeVersion(info.name),info.map,info.game])
			result=rv.removeVersion(info.name)
		}
	}).catch(console.log)
	db.close()
	return result
}

const checkPlayerOnServer = async (ip,port,name) =>{
	let result=0
	await query.players(ip,port,5000).then(players=>{
		const j=players.length; let l=0
		if(j==undefined){result=-1}
		else if(!(j==0)){
			for (let i=0;i<j;i++){
				const u = players.pop()
				if(u.name==name){
					result=1
				}
			}
		}
	}).catch(console.log)
	return result
}

/*
*/
const generateTracked = async (timer,client,guildid,channelid) =>{
	let db = new sqlite3.Database(baselocation)
	await db.all(`SELECT * FROM TrackedPlayers WHERE guildid=? and channelid=?`,[guildid,channelid], async (err,rows)=>{
		if(rows.length>0 && rows.length!=undefined){
			for (let i in rows){
				const channel = client.guilds.cache.get(rows[i].guildid).channels.cache.get(rows[i].channelid)
				const online = await checkPlayerOnServer(rows[i].ip,rows[i].port,rows[i].name)
				if(online==1){
					if(rows[i].laststate==0){
					channel.send(`${rows[i].name} is currently connected on ${await getServerName(rows[i].ip,rows[i].port)}`)
					db.run(`REPLACE INTO TrackedPlayers (guildid,channelid,name,ip,port,laststate) VALUES(?,?,?,?,?,?)`,[rows[i].guildid,rows[i].channelid,rows[i].name,rows[i].ip,rows[i].port,1])
					}
				}
				else if(online==0){
					if(rows[i].laststate==1){
					channel.send(`${rows[i].name} disconnect from ${await getServerName(rows[i].ip,rows[i].port)}`)
					db.run(`REPLACE INTO TrackedPlayers (guildid,channelid,name,ip,port,laststate) VALUES(?,?,?,?,?,?)`,[rows[i].guildid,rows[i].channelid,rows[i].name,rows[i].ip,rows[i].port,0],(err)=>{return})
					}
				}
			}
		}
	})
}

module.exports = { generateTracked }