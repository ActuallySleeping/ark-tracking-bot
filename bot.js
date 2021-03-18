const Discord = require('discord.js')
const query = require("source-server-query");
const sqlite3 = require('sqlite3').verbose()
const { DiscordSnowflake } = require('@sapphire/snowflake');

const seperator = "@#>£"
const baselocation = './db/base.db'
const client = new Discord.Client()
client.login(require(`${__dirname}/token.json`))
const discordSnowflake = new DiscordSnowflake();

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
	let splitmessage = embedMessage.split(seperator)
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
			name:splitmessage[i*5]+" - "+removeVersion(splitmessage[i*5+1])+splitmessage[i*5+2],
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
	let splitmessage = embedMessage.split(seperator)

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

const generateEmbed = async (ips,ports) =>{
	let embedMessage =""
	for (let i in ports){

		await query.info(ips[i],ports[i],1000).then(info=>{
			let db = new sqlite3.Database(baselocation)
			if(info.map==null && info.game==null){
				db.all(`SELECT * FROM InformationServer WHERE ip=? AND port=?`,[ips[i],ports[i]], (err,rows)=>{
					if(rows.length>0){
						embedMessage += rows[0].map + seperator + rows[0].name       + seperator +" - Not Responding" + seperator + rows[0].game + seperator
					}
					else{
						embedMessage += "Map unknow"+ seperator + ips[i]+":"+ports[i]+ seperator +" - Not Responding" + seperator + "No games"   + seperator
					}
				})	
			}
			else{
				db.run(`REPLACE INTO InformationServer (ip,port,name,map,game) VALUES (?,?,?,?,?)`,[ips[i],ports[i],info.name,info.map,info.game])
				embedMessage += info.map + seperator + info.name + seperator+ "" + seperator + info.game + seperator
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
			}embedMessage+=seperator
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
async function generateMessage(timer,msg,channel,messageid,ipSave,portSave){
	let db = new sqlite3.Database(baselocation)
	await db.all(`SELECT * FROM InformationMessage WHERE messageid=?`,messageid, (err,rows)=>{
		if(rows.length>0 && rows.length!=undefined){
			channel.messages.fetch(messageid)
			  .catch(err =>{console.log})
			  .then(async msg =>{
				if(!(msg==undefined || msg.deleted==true)){
			    	let ips=ipSave
					let ports=portSave
					msg.edit(" ‎",await generateEmbed(ips,ports))
			  	}
			  	else{
					channel.send("‎The message logged as been deleted, a new one will be generated")
					  .then(msg => {
						db.run(`UPDATE InformationMessage SET messageid=? WHERE messageid=?`,[msg.id,messageid])
						generateMessage(timer,msg,channel,msg.id,ipSave,portSave)
					})
				}
			})
		}
		else{
			channel.messages.fetch(messageid)
			  .catch(err=>{console.log})
			  .then(msg =>{
			  	msg.delete()
			  })
			clearInterval(timer);
		}
	})
	db.close()
}



client.once('ready' , async () => {
	console.log("Ready to go!")	

	client.user.setActivity('🔧 maintenance', { type: 'PLAYING' })
	  .catch(err=>{return});

	let db = new sqlite3.Database(baselocation)
	await db.each(`SELECT * FROM InformationMessage`,[], (err,row) =>{
		/*const guild = client.guilds.cache.get(row.guildid)*/
		const channel = client.channels.cache.get(row.channelid)
		let timer = setInterval(function() {
			generateMessage(timer,undefined,channel,row.messageid,row.ipSave.split("#"),row.portSave.split("#").map(Number))
		}, 30000)
	})	
	db.close()
	console.log("Finised querying")
})

function toString(array){
	let message=""
	for(let i=0;i<array.length-1;i++){message+=array[i]+"#"}
	message+=array[array.length-1]
	return message
}

client.on('message', async (message) => {
	if(message.content.startsWith("&")){
		let db = new sqlite3.Database(baselocation)
		db.all(`SELECT * FROM MessageLogs WHERE author=? AND authorid=?`,[message.author,message.author.id],(err,rows)=>{
			if(rows.length>0 && rows!=undefined){
				if(discordSnowflake.deconstruct(message.id).timestamp-discordSnowflake.deconstruct(rows[0].messageid).timestamp<7000){
					return
				}
			}
			let command = message.content.substr(1).split(" ")[0].toLowerCase()
			let args = message.content.split(" ").slice(1)
			
			if(command==="clear" || command==="c"){
				message.delete({timeout:10}).catch(err=>{return})
				if(!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")){
					message.channel.send("You must have the Manage Messages permission")
					  .then(msg => {msg.delete({timeout:2500})})
					return
				}
				let j=0,amountleft=args[0]
				if(args[0]==0 || args[0]==undefined){amountleft=100}
				if(args[0]>100){
					for(let i=0;i<Math.floor(args[0]/100);i++){message.channel.bulkDelete(100)}
					amountleft=args[0]-(Math.floor(args[0]/100)*100)
				}
				
				message.channel.bulkDelete(amountleft)
				message.channel.send("Clear Request Performed")
				  .then(msg => {msg.delete({timeout:2500})})
			}
			else if(command==="start" || command==="s"){
				message.delete({timeout:10}).catch(err=>{return})
				if(!(message.channel.permissionsFor(message.member).has("MANAGE_GUILD") || message.author.id=="224142905537855489")){
					message.channel.send("You must have the Manage Server permission")
					  .then(msg => {msg.delete({timeout:2500})})
					return
				}

				let ipSave=[]
				let portSave=[]

				if(args.length>0){
					if(args.length>20){
						message.channel.send("Too many arguments").then(msg=>{msg.delete({timeout:2500})})
						return 
					}
					for(let i=0;i<args.length;i++){
						ipSave.push(args[i].split(":")[0])
						portSave.push(parseInt(args[i].split(":")[1]))
					}
					let ips = ipSave;
					let ports = portSave;
					message.channel.send("‎ ‎",generateEmbed(ips,ports))
					  .then(msg => {
						let db = new sqlite3.Database(baselocation)
						db.run(`INSERT INTO InformationMessage (guildid,channelid,messageid,ipsave,portSave) VALUES(?,?,?,?,?)`,[msg.guild.id,msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
						db.close()

						let ips = ipSave;
						let ports = portSave;

						let timer = setInterval(function() {
							generateMessage(timer,msg,msg.channel,msg.id,ips,ports)
						}, 30000)

					  })
					
				}
				else{
					message.channel.send("Missing argument or Invalid argument(s)").then(msg=>{msg.delete({timeout:2500})})
				}
			}
			else if(command==="stop"){
				message.delete({timeout:10}).catch(err=>{return})
				if(args.length>0){
					let db = new sqlite3.Database(baselocation)
					db.run(`DELETE FROM InformationMessage WHERE messageid=?`,args[0])
					db.close()
					return
				}
				let db = new sqlite3.Database(baselocation)
				db.run(`DELETE FROM InformationMessage WHERE channelid=?`,message.channel.id)
				db.close()
			}
			else if(command=="help"){
				message.delete({timeout:10}).catch(err=>{return})
				message.channel.send(" ‎",{embed:{
					color: 15105570,
					author: {name : client.username,icon_url: client.user.avatarURL},
					fields:[{
						name:"List of commands",
						value:' ‎\n**&start** x.x.x.x:p ... / **&s** x.x.x.x:p ... \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎start a new player list of a server, maximum of 20 servers\n\n'
							+'**&clear** <amount> / **&c** <amount> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎delete message \n\n'
							+'**&stop** <message id> / **&s** <message id> \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎remove all the active list in the channel/with the message id given\n\n'
							+'**&defaultcluster** / **&dc** \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎give you a list of all the ips of different cluster\n\n'
							+'**Invite the bot** \n ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎Follow the link: https://bit.ly/30LMOoe\n\n'
					}]
				}})
				  .then(msg=>{msg.delete({timeout:20000}).catch(err=>{return})}).catch(err=>{return})
			}
			else if(command=="defaultcluster" || command==="dc"){
				message.delete({timeout:10}).catch(err=>{return})
				message.channel.send(" ‎",{embed:{
					color: 15105570,
					author: {name : client.username,icon_url: client.user.avatarURL},
					fields:[{
						name:"List of Servers",
						value:' ‎\n**ARKLIFE** - PvP\n\`145.239.205.193:27015 145.239.205.193:27025 145.239.205.193:27035 145.239.205.193:27045 145.239.205.193:27055 145.239.205.193:27065 145.239.205.193:27075 145.239.205.193:27095 145.239.205.193:27105\` \n\n'
						+ '**ARKLIFE** - PvEvP\n\`145.239.205.193:27085 145.239.205.193:27115\` \n\n'
					}]
				}})
				  .then(msg=>{msg.delete({timeout:20000}).catch(err=>{return})}).catch(err=>{return})
			}
			db.run(`REPLACE INTO MessageLogs (author,authorid,messageid) VALUES (?,?,?)`,[message.author,message.author.id,message.id])
		})
		db.close()
	}
});