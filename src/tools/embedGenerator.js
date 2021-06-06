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

const generateEmbed = async (begin,client,msg,db,servers,ips,ports) => {

	const getPlayers = (servers,ip,port,i) => {
		for (let server of servers){
			if(server != undefined && server.ip == ip && server.port == port){
				return server.players;
			}
		}
	}

	let container = [];
	const promise = (container,servers,ips,ports) => new Promise( async (resolve) => { 
		setTimeout(() => resolve("done"), 500);


		for await (let port of ports){
			let ip = ips[ports.indexOf(port)]
			db.get(`SELECT * FROM Servers WHERE ip=? AND port=?`,ip, port, async (err,row)=>{
				if(row!=undefined){
					//console.log("infoDB")
					container.push({
						map     : row.map,
						name    : row.name,
						game    : row.game,
						players : getPlayers(servers,ip,port)
					});

					if(port == ports[ports.length-1]){
						resolve("done")
					}

				}
				else{
					query.info(ips,ports,100).then(async info=>{
						
						if(info.map==null && info.game==null){
							//console.log("infoNULL")

							container.push({
								map     : "Map unknow",
								name    : ips[i]+":"+ports[i]+" - Not Responding",
								game    : "No games",
								players : getPlayers(servers,ips[i],ports[i])
							});	

							if(i+1 == ports.length){
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
								players : getPlayers(servers,ips[i],ports[i])
							});

							db.run(`INSERT OR REPLACE INTO Servers (ip,port,name,map,game) VALUES (?,?,?,?,?)`,
								ips, ports, _, info.map, info.game)

							if(i+1 == ports.length){
								resolve("done")
							}
						}
					}).catch(err=>{return})
				}
			});	
		}
		return
	})

	promise(container,servers,ips,ports).then(() => {
		try {
			msg.edit(" ‎",{embed:{
				color: 15105570,
				title: "Ark Player List",
				footer: {text: "Made by Leo#4265 with source-server-query"},
				timestamp: Date.now(),
				fields: createFields(container)
			}}).catch(err=>{return})
			console.log("editMessage : " + Math.abs(Date.now() - begin))
		} catch {
			return;
		}
	})

}

async function generateMessage(begin,client,db,channel,messageid,ips,ports,servers){
	channel.messages.fetch(messageid)
	  .catch(err =>{return})
	  .then(async (msg) =>{
		if(msg!=undefined && msg.deleted!=true){
			await generateEmbed(begin,client,msg,db,servers,ips,ports)
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

module.exports = { generateMessage, generateEmbed, timesetter }