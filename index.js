const fs = require('fs');
const Discord = require('discord.js')
const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const { generateMessage,timesetter }  = require(`${__dirname}/src/tools/embedGenerator.js`)
const config = require(`${__dirname}/src/config.json`)
const baselocation = `${__dirname}/src/base.db`

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
let db = new sqlite3.Database(baselocation)

const commandFiles = fs.readdirSync(`${__dirname}/src/commands`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`${__dirname}/src/commands/${file}`);
	client.commands.set(command.name, command);
}
client.login(require(`${__dirname}/src/token.json`))



client.once('ready' , async () => {
	console.log("Ready to go!")

	client.user.setActivity('🔧 maintenance', { type: 'PLAYING' })
	  .catch(err=>{return});
	
	let timer = setInterval(function() {
	let begin = Date.now()

		db.all(`SELECT * FROM Tracked`,[], (err,rows) =>{
			if(rows!=undefined && rows.length>0){

				let servers = [];

				const updateInfos = rows => new Promise(async (resolve) => {
					setTimeout(() => resolve("done"), 40000);

					for await  (let row of rows){

						const ips    = row.ips.split('#')
						const ports  = row.ports.split('#')

						for (let i in ips){

							let check = false;

							for await (let server of servers){
								//console.log(row2.ip+" == "+ips[i]+" && "+row2.port+" == "+ports[i])
								if(server.ip == ips[i] && server.port == ports[i]){
									//console.log("found")
									check = true
								}
							}

							if(!check){
								servers.push({
									ip      : ips[i],
									port    : parseInt(ports[i]),
									players : ""
								});
							}
						}

					}

					let i = 0;

					for await (let server of servers){

						query.players(server.ip,server.port,500).then( players =>{
							let count=0;

							if(players.length==undefined){
								server.players = " Not Responding or Timed Out\n"; 
								return;
							}

							for (let player of players){

								if( player.name == '' ) {
									count++;
								}
				
								else {
									server.players += " [" + 
									timesetter(player.duration) + 
									"] " +
									player.name + 
									"\n";
								}
							}



						    if(players.length == 0 || count == players.length) { 
						    	server.players = " No Players\n"; 
						    }
							
							i++
							if(i == servers.length){
								resolve("done")
							}
						}).catch(err=>{return;})
	
					}
				})
				
				updateInfos(rows).then(() => {

					console.log("getPlayers : " + Math.abs(Date.now() - begin))
					for (let server of servers){
						console.log(server.ip+":"+server.port+"\n"+server.players)
					}

					for (let row of rows){
						const channel = client.guilds.cache.get(row.guildid)
					      .channels.cache.get(row.channelid);

						generateMessage(
							begin,
							client,
							db,
							channel,
							row.messageid,
							row.ips.split('#'),
							row.ports.split('#').map(Number),
							servers
						)
					}
				})
			}
		})	
	}, 60 * 1000)
})


client.on('message', async (message) => {

	if(!(message.content.startsWith("&"))){return}

	const commandName = message.content.substr(1).split(" ")[0].toLowerCase()
	const args = message.content.split(" ").slice(1)
	
	const command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
	if (!command) return;

	const { cooldowns } = client;
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 60) * 1000;
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return 
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		if(command.guildOnly && message.channel.type === 'dm'){
			message.channel.send('This command cannot be used inside DMs')
			  .then(msg=>{msg.delete({timeout:2500}).catch(err=>{return})})
			return
		}

		if (command.permissions) {
		 	const authorPerms = message.channel.permissionsFor(message.author);
		 	if (!authorPerms || !authorPerms.has(command.permissions)) {
		 		message.send('You are missing the permissions to do it')
		 		  .then(msg=>{msg.delete({timeout:2500}).catch(err=>{return})})
		 		return
		 	}
		}

		if(command.args && !args.length){
			message.channel.send('You need to provide one/or more argument(s)')
			  .then(msg=>{msg.delete({timeout:5000}).catch(err=>{return})})
			return 
		}

		command.execute(message, args.filter(n=>{return n!==''}), client, db)
	} catch (err) {
		console.log(err)
		return
	}
})