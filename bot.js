const Discord = require('discord.js')
const query = require("source-server-query");
const sqlite3 = require('sqlite3').verbose()

const seperator = "@#>£"
const baselocation = './db/base.db'
const client = new Discord.Client()
client.login("ODE1NzIyNTI2NDk0ODE4MzY0.YDwizQ.bkaLkD8EWEDQQ-WxHtcvUuHu1Eo")

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
	@return field 2DArray, contain a name for the name before a field as well as the value of the field for each server
*/
function createFields(embedMessage){
	let splitmessage = embedMessage.split(seperator)
	let field = []
	for(let i=0;i<(splitmessage.length-1)/4;i++){
		let  j=0, supersplitmessage = splitmessage[i*4+3].split("\n")
		while(j<supersplitmessage.length-1){
			let buffer=""
			while(buffer.length < 800 && !(j==supersplitmessage.length)){
				buffer += supersplitmessage[j]+"\n"
				j++
			}
			field.push({
			name:splitmessage[i*4]+" - "+splitmessage[i*4+1],
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
	title="Player List"
	splitmessage = embedMessage.split(seperator)

	game = []
	for(let i=0;i<((splitmessage.length-1)/4);i++){
		game.push(splitmessage[(i*4)+2])
	}
	let j=0
	for(let i=0;i<((splitmessage.length-1)/4)-1;i++){
		if(game[i]===game[i+1]){j++}
	}
	if(j==((splitmessage.length-1)/4)-1){title=game[0]+" - Player List"}
	
	return title
}

/*Edit a message with an embed with a list of servers and the players online on those server
	@param msg Object, message to edit
	@param ips Array of String, contain the different ips of the servers to request 
	@param ports Array of Int, contain the different ports of the servers to request
	@use timesetter function, Change the display of the time 
	@use createFields function, Generate the fields of each server with the player online
*/
async function createQuery(msg,ips,ports){
	let embedMessage =""
	for (let i in ports){

		await query.info(ips[i],ports[i],1000).then(info=>{
			if(info.map==null && info.game==null){embedMessage += "Not Responding"+seperator+ips[i]+":"+ports[i]+seperator+"No Games"+seperator}
			else{								  embedMessage += info.map +seperator+    info.name   +seperator+ info.game+seperator}
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
	msg.edit(" ‎",{embed:{
		color: 15105570,
		author: {name : client.username,icon_url: client.user.avatarURL},
		title: checkGame(embedMessage),
		footer: {text: "Made by Leo#4265 with source-server-query"},
		timestamp: Date.now(),
		fields: createFields(embedMessage)
	}}).catch(err =>{return})
}

/*
*/
function generateMessage(msg,channel,messageid,ipSave,portSave){
	channel.messages.fetch(messageid)
	  .catch(err=>{return})
	  .then(msg => {
		if(!(msg==undefined || msg.deleted==true)){
				let timer = setInterval(function() {
					if(!(msg==undefined || msg.deleted==true)){
				    	ips=ipSave
						ports=portSave
				    	createQuery(msg,ips,ports)
					}
					else{clearInterval(timer);
						let db = new sqlite3.Database(baselocation)
						db.all(`SELECT * FROM InformationMessage WHERE messageid=?`,messageid, (err,rows)=>{
						  	if(rows.length>0 && rows.length!=undefined){generateMessage(msg,channel,messageid,ipSave,portSave)}
						  })
						db.close()
					}
				}, 2500)
		}
		else{
		channel.send("‎The message logged as been deleted, a new one will be generated")
		  .then(msg => {
		  	let db = new 
		  	sqlite3.Database(baselocation)
			db.run(`UPDATE InformationMessage SET messageid=? WHERE messageid=?`,[msg.id,messageid])
			db.close()
			generateMessage(msg,channel,msg.id,ipSave,portSave)
		  })
		}
	})
}

client.once('ready' , async () => {
	console.log("Ready to go!")	

	client.user.setActivity('&help', { type: 'WATCHING' })
	  .catch(err=>{return});

	let db = new sqlite3.Database(baselocation)
	await db.each(`SELECT * FROM InformationMessage`,[], (err,row) =>{
		/*const guild = client.guilds.cache.get(row.guildid)*/
		const channel = client.channels.cache.get(row.channelid)
		generateMessage(undefined,channel,row.messageid,row.ipSave.split("#"),row.portSave.split("#").map(Number))
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

client.on('message', message => {
	if(message.content.startsWith("&")){
		let command = message.content.substr(1).split(" ")[0].toLowerCase()
		let args = message.content.split(" ").slice(1)
		message.delete({timeout:10}).catch(console.log)
	
		if(command==="clear" || command==="c"){
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
				message.channel.send("‎ ‎")
				  .then(msg => {
					let db = new sqlite3.Database(baselocation)
					db.run(`INSERT INTO InformationMessage (guildid,channelid,messageid,ipsave,portSave) VALUES(?,?,?,?,?)`,[msg.guild.id,msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
					db.close()
					generateMessage(msg,message.channel,msg.id,ipSave,portSave)
				  })
				
			}
			else{
				message.channel.send("Missing argument or Invalid argument(s)").then(msg=>{msg.delete({timeout:2500})})
			}
		}
		else if(command==="stop"){
			if(args.length>0){
				let db = new sqlite3.Database(baselocation)
				db.all(`SELECT * FROM InformationMessage WHERE messageid=?`,args[0], (err,rows)=>{
				  	for(let i in rows){
				  		message.channel.messages.fetch(rows[i].messageid).then(
				  			msg=>{msg.delete()})
				  	}
				  	db.run(`DELETE FROM InformationMessage WHERE channelid=?`,message.channel.id)
				  })
				db.close()
				return
			}
			let db = new sqlite3.Database(baselocation)
			db.all(`SELECT * FROM InformationMessage WHERE channelid=?`,message.channel.id, (err,rows)=>{
			  	for(let i in rows){
			  		message.channel.messages.fetch(rows[i].messageid).then(
			  			msg=>{msg.delete()})
			  	}
			  	db.run(`DELETE FROM InformationMessage WHERE channelid=?`,message.channel.id)
			  })
			db.close()
		}
		else if(command=="help"){
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

	}
});