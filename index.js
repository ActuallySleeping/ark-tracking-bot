const fs = require('fs');
const Discord = require('discord.js')
const sqlite3 = require('sqlite3').verbose();

const { generateMessage }  = require(`${__dirname}/src/tools/embedGenerator.js`)
const config = require(`${__dirname}/src/config.json`)
const baselocation = `${__dirname}/../base.db`

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
let db = new sqlite3.Database(baselocation)

const commandFiles = fs.readdirSync(`${__dirname}/src/commands`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`${__dirname}/src/commands/${file}`);
	client.commands.set(command.name, command);
}
client.login(require(`${__dirname}/../token.json`))



client.once('ready' , async () => {
	console.log("Ready to go!")

	client.user.setActivity('🔧 maintenance', { type: 'PLAYING' })
	  .catch(err=>{return});
	
	let timer = setInterval(function() {
		db.all(`SELECT * FROM Tracked`,[], async (err,rows) =>{
			if(rows!=undefined && rows.length>0){
				for await (let row of rows){
					const channel = client.guilds.cache.get(row.guildid).channels.cache.get(row.channelid)
					generateMessage(client,db,channel,row.messageid,row.ips.split("#"),row.ports.split("#").map(Number))
				}
			}
		})	
	}, 60000)
})
client.on('message', async (message) => {
	if(!(message.content.startsWith("&"))){return}
	let commandName = message.content.substr(1).split(" ")[0].toLowerCase()
	let args = message.content.split(" ").slice(1)
	
	const command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
	if (!command) return;

	const { cooldowns } = client;
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;
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
			message.channel.send('This command cannot be used inside DMs').then(msg=>{msg.delete({timeout:2500})})
			return
		}
		if (command.permissions) {
		 	const authorPerms = message.channel.permissionsFor(message.author);
		 	if (!authorPerms || !authorPerms.has(command.permissions)) {
		 		message.send('You are missing the permissions to do it').then(msg=>{msg.delete({timeout:2500})})
		 		return
		 	}
		}
		if(command.args && !args.length){
			message.channel.send('You need to provide one/or more argument(s)').then(msg=>{msg.delete({timeout:5000})})
			return 
		}
		
		command.execute(message, args.filter(n=>{return n!==''}), client, db)
	} catch (err) {
		return
	}
})