const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const config = require(`${__dirname}/../config.json`)
const { checkIp } = require(`${__dirname}/../tools/toolbox.js`)
const { generateEmbed } = require(`${__dirname}/../tools/embedGenerator.js`)

module.exports = {
	name: 'start',
	args: true,
	cooldown: config.cooldown.start,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['sa'],
	async execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return;})


		db.get(`SELECT * FROM Guilds WHERE id=?`, 
		  message.guild.id , (err,rowGuild) => {
			db.get(`SELECT * FROM Users WHERE id=?`, 
			  message.author.id , async (err,rowUser) => {

				if(args.length>=config.limits.commandLimit 
                    || (rowUser  && rowUser .servers+args.length >= config.limits.userLimit )
                    || (rowGuild && rowGuild.servers+args.length >= config.limits.guildLimit)){

					message.channel.send("You will follow too many servers (limit is " + config.userLimit + " by user and " + config.guildLimit + "by discord server)!").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return});
					return;
				}
				if(args.every(checkIp)){
					message.channel.send("Please insert ip with the correct format (x.x.x.x:port)!").then(msg=>{msg.delete({timeout:3500})}).catch(err=>{return});
					return;
				}

				let ips = [];
				let ports = [];

				for (const arg of args){
				  const [ip, port] = arg.split(":");

				  ips.push(ip);
				  ports.push(port);
				}

				ips = ips.join("#");
				ports = ports.join("#");

				let count = (rowUser ? rowUser.servers : 0) + args.length;
				db.run("INSERT OR REPLACE INTO Users(id, servers) VALUES(?, ?)", message.author.id, count);
				
				count = (rowGuild ? rowGuild.servers : 0) + args.length;
				db.run("INSERT OR REPLACE INTO Guilds(id, servers) VALUES(?, ?)", message.guild.id, count);

				message.channel.send(" ‎",await generateEmbed(Date.now(),client,db,[],ips.split('#'),ports.split('#').map(Number)))
				  .catch(err=>{return;})
				  .then(msg => {
					db.run(`INSERT INTO Tracked (guildid,channelid,messageid,ips,ports,authorid) VALUES(?,?,?,?,?,?)`,
					  msg.guild.id,msg.channel.id,msg.id,ips,ports,message.author.id,err=>{return;});
				})
			})
		})
	},
};