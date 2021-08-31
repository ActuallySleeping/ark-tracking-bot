const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const { removeVersion } = require(`${__dirname}/toolbox.js`)
const config = require(`${__dirname}/../config.json`)

const separator = config.separator


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

const getPlayers = server => new Promise( async (resolve) => {
	setTimeout(() => { resolve("done"); }, 500);

	query.players(server.ip,server.port,350).then( (players) =>{
		let count=0;

		if(players.length==undefined){
			server.players = " Not Responding or Timed Out\n"; 
			resolve("done");
		}

		for (let player of players){

			if( player.name == '' ) {
				count++;
			}

			else {
				server.players += " [" + timesetter(player.duration) + "] " +
								  player.name + "\n";
			}
		}

	    if(players.length == 0 || count == players.length) { 
	    	server.players = " No Players\n"; 
	    }

	    resolve("done");

	}).catch(err=>{return;})

}) 

const generateNames = (container,servers,ips,ports,db) => new Promise( async (resolve) => { 
	setTimeout(() => resolve("done"), 500);

	const selectPlayers = (servers,ip,port,i) => {
		for (let server of servers){
			if(server != undefined && server.ip == ip && server.port == port){
				return server.players;
			}
		}
	}

	for await (let port of ports){
		let ip = ips[ports.indexOf(port)]
		db.get(`SELECT * FROM Servers WHERE ip=? AND port=?`,ip, port, async (err,row)=>{

			if(row!=undefined){
				//console.log("infoDB")

				container.push({
					map     : row.map,
					name    : row.name,
					game    : row.game,
					players : selectPlayers(servers,ip,port)
				});

				if(port == ports[ports.length-1]){
					resolve("done")
				}

			}
			else{
				query.info(ip,port,100).then(async info=>{
					
					if(info.map==null && info.game==null){
						//console.log("infoNULL")

						container.push({
							map     : "Map unknow",
							name    : ip+":"+port+" - "+info,
							game    : "No games",
							players : selectPlayers(servers,ip,port)
						});	

						if(port == ports[ports.length-1]){
							resolve("done")
						}
					}
					else{
						//console.log("infoQUERY")

						const _ = removeVersion(info.name)

						container.push({
							map     : info.map,
							name    : _,
							game    : info.game,
							players : selectPlayers(servers,ip,port)
						});

						await db.run(`INSERT OR REPLACE INTO Servers (ip,port,name,map,game) VALUES (?,?,?,?,?)`,
							ip, port, _, info.map, info.game)

						if(port == ports[ports.length-1]){
							resolve("done")
						}
					}
				}).catch(err=>{return})
			}
		});	
	}
})


const createEmbed = (client,ips,ports,db) => new Promise ( (resolve) => {

	let container = [];
	let servers = [];



	
})

const generateEmbed = (begin,client,db,servers,ips,ports) => new Promise ( (resolve) => {

	let container = [];

	const createServer = servers => new Promise ((resolve) => {
		if(servers.length == 0){
			for (let i in ips){

				let server = {
					ip      : ips[i],
					port    : ports[i],
					players : ""
				}
				getPlayers(server).then(() => {
					servers.push(server);
					if(servers.length == ips.length){
						resolve("done")
					}
				})
			}
		} else {
			resolve("done")
		}
	}) 
	
	createServer(servers).then(() => {
		for (let server of servers){

			if(server.players == ''){
				server.players = " Not Responding or Tismed Out\n"; 
			}
			//console.log(server.ip+":"+server.port+"\n"+server.players)
		}

		generateNames(container,servers,ips,ports,db).then(() => {
			console.log("editMessage : " + Math.abs(Date.now() - begin))
			resolve({embed:{
						color: 15105570,
						title: "Ark Player List",
						footer: {text: "Made by Leo#4265 with source-server-query"},
						timestamp: Date.now(),
						fields: createFields(container)
					}})
		})
	})
})

async function generateMessage(begin,client,db,channel,messageid,ips,ports,servers){
	channel.messages.fetch(messageid)
	  .catch(err =>{return})
	  .then(async (msg) =>{
		if(msg!=undefined && msg.deleted!=true){
			try {
				msg.edit(" ‎", await generateEmbed(begin,client,db,servers,ips,ports)).catch(err=>{return})
			} catch {
				return;
			}
	  	}
	  	else{
			channel.send("‎The message logged as been deleted, a new one will be generated")
			  .catch(err=>{return})
			  .then(async msg => {
				db.run(`UPDATE Tracked SET messageid=? WHERE messageid=?`,[msg.id,messageid])
				console.log("newMessage : " + Math.abs(Date.now() - begin))
			})
		}
	})
}

module.exports = { generateMessage, generateEmbed, timesetter, createEmbed, getPlayers }