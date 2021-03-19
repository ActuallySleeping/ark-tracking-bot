const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const config = require(`${__dirname}/../config.json`)

const separator = config.separator
const baselocation = `${__dirname}/../../../base.db`

/*Change the display of the time 
	@param time Int, contain the time in seconds, to transform 
	@return String, time transformed in the best possible way
*/
function timesetter(time){
	if(time<180){return "now"}
	if(time<60*60){return Math.floor(time/60)+"m"}
	if(time<60*60*24){return Math.floor(time/(60*60))+"h "+Math.floor(time/60-(Math.floor(time/(60*60))*60))+"m"}
	else{return	Math.floor(time/(60*60*24))+"d "+Math.floor(time/(60*60)-(Math.floor(time/(60*60*24))*24))+"h "+Math.floor(time/60-(Math.floor(time/(60*60))*60))+"m"}
}

function removeVersion(message){
	let splitmessage = message.split("-")
	r=""
	for(let i=0;i<splitmessage.length-2;i++){
		r+=splitmessage[i]+"-"
	}
	r+=splitmessage[splitmessage.length-2]
	return r
}

/*Generate the fields of each server with the player online
	@param embedMessage String, buffer containing the result of the query to the different ip:port
	@param nbServ Int, set as the value of the number of server that the query performed
	@return field 2DArray, contain a name for the name before a field as well as the value of the field for each server
*/
function createFields(embedMessage){
	let splitmessage = embedMessage.split(separator)
	let field = []
	for(let i=0;i<(splitmessage.length-1)/5;i++){
		let  j=0, supersplitmessage = splitmessage[i*5+4].split("\n")
		while(j<supersplitmessage.length-1){
			let buffer=""
			while(buffer.length < 800 && !(j==supersplitmessage.length)){
				buffer += supersplitmessage[j]+"\n"
				j++
			}
			field.push({
			name:splitmessage[i*5]+" - "+splitmessage[i*5+1]+splitmessage[i*5+2],
			value:"```ini\n\n"+buffer+"```"})
		}
	}
	return field
}
/*Add the name of the game if all the server performed are from the same game and if the value is a default or a predefined
	@param embedMessage String, buffer containing the result of the query to the different ip:port
	@param title String, the current title can be predefined or can the default (default is "Player List")
	@return title String, title which is going to be used in the embed
*/
function checkGame(embedMessage){
	let title="Player List"
	let splitmessage = embedMessage.split(separator)

	let game = []
	for(let i=0;i<((splitmessage.length-1)/5);i++){
		game.push(splitmessage[(i*5)+3])
	}
	let j=0
	for(let i=0;i<((splitmessage.length-1)/5)-1;i++){
		if(game[i]===game[i+1]){j++}
	}
	if(j==((splitmessage.length-1)/5)-1){title=game[0]+" - Player List"}
	
	return title
}

const generateEmbed = async (client,ips,ports) =>{
	let embedMessage =""
	for (let i in ports){

		await query.info(ips[i],ports[i],1000).then(info=>{
			let db = new sqlite3.Database(baselocation)
			if(info.map==null && info.game==null){
				db.all(`SELECT * FROM InformationServer WHERE ip=? AND port=?`,[ips[i],ports[i]], (err,rows)=>{
					if(rows.length>0){
						embedMessage += rows[0].map + separator + rows[0].name       + separator +" - Not Responding" + separator + rows[0].game + separator
					}
					else{
						embedMessage += "Map unknow"+ separator + ips[i]+":"+ports[i]+ separator +" - Not Responding" + separator + "No games"   + separator
					}
				})	
			}
			else{
				db.run(`REPLACE INTO InformationServer (ip,port,name,map,game) VALUES (?,?,?,?,?)`,[ips[i],ports[i],removeVersion(info.name),info.map,info.game])
				embedMessage += info.map + separator + removeVersion(info.name) + separator+ "" + separator + info.game + separator
			}
			db.close()
		}).catch(console.log)

		await query.players(ips[i],ports[i],5000).then(players=>{
			const j=players.length; let l=0

			if(j==undefined){embedMessage += " Not Responding or Timed Out\n"}
			else if(j==0){embedMessage += " No Players\n"}
			else{for (let i=0;i<j;i++){
					const u = players.pop()
					if(!(u.name=='')){embedMessage += " ["+timesetter(u.duration)+"] "+u.name+"\n"}
					else{l++}
				}
				if(l==j && l!=0){embedMessage += " No Players\n"}
			}embedMessage+=separator
		}).catch(console.log)

	}
	return {embed:{
		color: 15105570,
		author: {name : client.username,icon_url: client.user.avatarURL},
		title: checkGame(embedMessage),
		footer: {text: "Made by Leo#4265 with source-server-query"},
		timestamp: Date.now(),
		fields: createFields(embedMessage)
	}}
}

/*
*/
async function generateMessage(timer,client,msg,channel,messageid){
	let db = new sqlite3.Database(baselocation)
	await db.all(`SELECT * FROM InformationMessage WHERE messageid=? and channelid=?`,[messageid,channel.id], (err,rows)=>{
		if(rows.length>0 && rows.length!=undefined){
			channel.messages.fetch(messageid)
			  .catch(err =>{return})
			  .then(async msg =>{
				if(!(msg==undefined || msg.deleted==true)){
			    	let ips=rows[0].ipSave.split("#")
					let ports=rows[0].portSave.split("#").map(Number)
					msg.edit(" ‎",await generateEmbed(client,ips,ports))
			  	}
			  	else{
					channel.send("‎The message logged as been deleted, a new one will be generated")
					  .then(msg => {
						db.run(`UPDATE InformationMessage SET messageid=? WHERE messageid=?`,[msg.id,messageid])
						generateMessage(timer,client,msg,channel,msg.id)
					})
				}
			})
		}
		else{
			channel.messages.fetch(messageid)
			  .catch(err=>{return})
			  .then(msg =>{
			  	msg.delete().catch(err=>{return})
			  })
			clearInterval(timer);
		}
	})
	db.close()
}

module.exports = { generateMessage, generateEmbed, removeVersion }