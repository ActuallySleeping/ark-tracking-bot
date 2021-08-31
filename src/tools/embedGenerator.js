const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const { removeVersion } = require(`${__dirname}/toolbox.js`)
const config = require(`${__dirname}/../config.json`)


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

/*Generate the fields of each server with the players online on that server
	@param servers Object, all the informations about the servers (name, game, players, ...)
	@return 2DArray, array of Objects with the title and the content of each field
*/
const createFields = servers => {
	let field = []
	for(let server of servers){
		let  i=0, splitcontainer = server.players.split("\n")

		while(i<splitcontainer.length-1){
			let buffer=""

			while(buffer.length < 800 && !(i==splitcontainer.length)){
				buffer += splitcontainer[i]+"\n"
				i++
			}

			field.push({
			name:server.map + ' - ' + server.name,
			value:"```ini\n\n"+buffer+"```"})
		}

	}
	return field
}

const getPlayers = server => new Promise( async (resolve) => {
	setTimeout(() => { resolve("done"); }, config.timers.queryPlayers * 1000 + 50);

	query.players(server.ip,server.port,config.timers.queryPlayers * 1000).then( (players) =>{
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
	setTimeout(() => resolve("done"), config.timers.queryName * 1000 + 100);

	const selectPlayers = (servers,ip,port) => {
		for (let server of servers){
			if(server != undefined && server.ip == ip && server.port == port){
				return server.players;
			}
		}
	}

	let i = 0;

	for await (let port of ports){
		let ip = ips[ports.indexOf(port)]
		db.get(`SELECT * FROM Servers WHERE ip=? AND port=?`,ip, port, async (err,row)=>{

			if(row!=undefined){
				container.push({
					map     : row.map,
					name    : row.name,
					game    : row.game,
					players : selectPlayers(servers,ip,port)
				});

				i++;
				if(i == ports.length){ resolve("done") }
			}
			else{
				query.info(ip,port,config.timers.queryName * 1000).then(async info=>{
					
					if(info.map==null && info.game==null){
						container.push({
							map     : "Map unknow",
							name    : ip+":"+port+" - "+info,
							game    : "No games",
							players : selectPlayers(servers,ip,port)
						});	

						i++;
						if(i == ports.length){ resolve("done") }
					}
					else{
						const _ = removeVersion(info.name)

						container.push({
							map     : info.map,
							name    : _,
							game    : info.game,
							players : selectPlayers(servers,ip,port)
						});

						await db.run(`INSERT OR REPLACE INTO Servers (ip,port,name,map,game) VALUES (?,?,?,?,?)`,
							ip, port, _, info.map, info.game);

						i++;
						if(i == ports.length){ resolve("done") }
					}
				}).catch(err=>{return})
			}
		});	
	}
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
				};

				getPlayers(server).then(() => {
					servers.push(server);
					if(servers.length == ips.length){
						resolve("done");
					}
				});
			}
		} else { resolve("done"); }
	}) 
	
	createServer(servers).then(() => {
		for (let server of servers){
			if(server.players == ''){
				server.players = " Not Responding or Tismed Out\n"; 
			}
		}

		generateNames(container,servers,ips,ports,db).then(() => {
			console.log("editMessage : " + Math.abs(Date.now() - begin));
			resolve({embed:{
						color: 15105570,
						title: "Ark Player List",
						footer: {text: "Made by Leo#4265 with source-server-query"},
						timestamp: Date.now(),
						fields: createFields(container)
					}});
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

module.exports = { generateMessage, generateEmbed, timesetter, getPlayers }