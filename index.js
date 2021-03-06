const fs = require('fs');
const Discord = require('discord.js')
const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const { generateMessage, timesetter, getPlayers, timeoutServers }  = require(`${__dirname}/src/tools/embedGenerator.js`)
const config = require(`${__dirname}/src/config.json`)

let db;
const baselocation = `${__dirname}/src/base.db`;
if(fs.existsSync(baselocation)){
	db = new sqlite3.Database(baselocation);
} else {
	db = new sqlite3.Database(baselocation);
	db.run('CREATE TABLE Guilds ('+
		'id			TEXT,'+
		'servers 	INTEGER,'+
		'PRIMARY KEY(id)'+
		')');
	db.run('CREATE TABLE Players ('+
		'ip 		INTEGER, '+
		'port 		INTEGER, '+
		'players 	TEXT, '+
		'PRIMARY KEY(ip,port)'+
		')');
	db.run('CREATE TABLE Servers ('+
		'ip 		TEXT,'+
		'port		INTEGER,'+
		'name		TEXT,'+
		'map		TEXT,'+
		'game		TEXT,'+
		'PRIMARY KEY(port,ip)'+
		')');
	db.run('CREATE TABLE Tracked ('+
		'guildid	TEXT,'+
		'channelid	TEXT,'+
		'messageid	TEXT,'+
		'ips		TEXT,'+
		'ports		TEXT,'+
		'authorid	TEXT,'+
		'PRIMARY KEY(guildid,ips,ports)'+
		')');
	db.run('CREATE TABLE Users ('+
		'id			TEXT,'+
		'servers	INTEGER,'+
		'PRIMARY KEY(id)'+
		')');
}

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();


const commandFiles = fs.readdirSync(`${__dirname}/src/commands`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`${__dirname}/src/commands/${file}`);
	client.commands.set(command.name, command);
}
client.login(require(`${__dirname}/src/token.json`))



client.once('ready' , async () => {
	console.log("Ready to go!")

	let activity = config.maintenance

	client.user.setActivity(activity[0],activity[1])
	  .catch(err=>{console.log(err)});

	let activityreload = setInterval( () => {
		client.user.setActivity(activity[0],activity[1])
		  .catch(err=>{console.log(err)});
	}, 1 * 60 * 60 * 1000)
	
	let timer = setInterval(function() {
		timeoutServers().then( () => {
			console.log("\n\n\n");
			let begin = Date.now();

			db.all(`SELECT * FROM Tracked`,[], (err,rows) =>{
				if(rows!=undefined && rows.length>0){

					let servers = [];

					const updateInfos = rows => new Promise ( async (resolve) => {
						setTimeout(() => resolve("done"), config.timers.queryLoop * 1000);

						for await  (let row of rows){

							const ips    = row.ips.split('#');
							const ports  = row.ports.split('#');

							for (let i in ips){

								let check = false;

								for await (let server of servers){
									if(server.ip == ips[i] && server.port == ports[i]){
										check = true;
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
							
							getPlayers(server).then(() => {
								i++;
								if(i == servers.length){ resolve("done");}
							})
						}
					})
					
					updateInfos(rows).then(() => {

						console.log("\ngetPlayers : " + Math.abs(Date.now() - begin))
						for (let server of servers){

							if(server.players == ''){
								server.players = " Not Responding or Timed Out\n"; 
							}
							//console.log(server.ip+":"+server.port+"\n"+server.players)
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
		})
	}, config.timers.globalTimer * 1000)
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