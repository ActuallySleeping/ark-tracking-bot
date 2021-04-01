const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const { removeVersion } = require(`${__dirname}/toolbox.js`)
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

/*Generate the fields of each server with the player online
	@param embedMessage String, buffer containing the result of the query to the different ip:port
	@param nbServ Int, set as the value of the number of server that the query performed
	@return 2DArray, contain a name for the name before a field as well as the value of the field for each server
*/
const createFields = container => {
	let field = []
	for(let i = 0; i < container.length; i++){
		let  j=0, splitcontainer = container[i].players.split("\n")

		while(j<splitcontainer.length-1){
			let buffer=""

			while(buffer.length < 800 && !(j==splitcontainer.length)){
				buffer += splitcontainer[j]+"\n"
				j++
			}

			field.push({
			name:container[i].map + ' - ' + container[i].name,
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
const generateEmbed = async (client,ips,ports,db) => {
	console.log(client,ips,ports,db)
	let container = [];
	for (let i in ports){
		console.log(i)
		await db.all(`SELECT * FROM Servers WHERE ip=? AND port=?`,[ips[i],ports[i]], async (err,row)=>{
			if(row!=undefined && row.length>0){
				await container.push({
					map     : row[0].map,
					name    : row[0].name,
					game    : row[0].game,
					players : ""
				});
			}
			else{
				await query.info(ips[i],ports[i],250).then(async info=>{
					if(info.map==null && info.game==null){
						await container.push({
							map     : "Map unknow",
							name    : ips[i]+":"+ports[i]+" - Not Responding",
							game    : "No games",
							players : ""
						});				
					}
					else{
						db.run(`REPLACE INTO Servers (ip,port,name,map,game) VALUES (?,?,?,?,?)`,[ips[i],ports[i],removeVersion(info.name),info.map,info.game])
						await container.push({
							map     : info.map,
							name    : removeVersion(info.name),
							game    : info.game,
							players : ""
						});
					}
				}).catch(err=>{return})
			}
		});	
		await query.players(ips[i],ports[i],750).then(players=>{
			let count=0;

			if(players.length==undefined){container[i].players = " Not Responding or Timed Out\n"; return}

			for (let player of players){
				if(player.name==''){count++}
				else{container[i].players += " ["+timesetter(player.duration)+"] "+player.name+"\n"}
			}

		    if(players.length==0 || count==0){container[i].players = " No Players\n"}
			
		}).catch(err=>{return})
	}
	console.log(container)
	return {embed:{
		color: 15105570,
		author: {name : client.username ,icon_url: client.user.avatarURL},
		title: "Ark Player List",
		footer: {text: "Made by Leo#4265 with source-server-query"},
		timestamp: Date.now(),
		fields: createFields(container)
	}}
}

/*
*/
async function generateMessage(client,db,channel,messageid,ips,ports){
	channel.messages.fetch(messageid)
	  .catch(err =>{return})
	  .then(async (msg) =>{
		if(!(msg==undefined || msg.deleted==true)){
			msg.edit(" ‎",await generateEmbed(client,ips,ports,db)).catch(err=>{return})
	  	}
	  	else{
			channel.send("‎The message logged as been deleted, a new one will be generated")
			  .catch(err=>{return})
			  .then(async msg => {
				db.run(`UPDATE TrackedServers SET messageid=? WHERE messageid=?`,[msg.id,messageid])
			})
		}
	})
}

module.exports = { generateMessage, generateEmbed }