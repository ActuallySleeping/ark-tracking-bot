const tools = require(`${__dirname}/../tools/embedGenerator.js`)
const sqlite3 = require('sqlite3').verbose();

const config = require(`${__dirname}/../config.json`)

function toString(array){
	let message=""
	for(let i=0;i<array.length-1;i++){message+=array[i]+"#"}
	message+=array[array.length-1]
	return message
}

module.exports = {
	name: 'serverstart',
	args: true,
	cooldown: 10,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	guildOnly: true,
	aliases: ['ss','sstart','servers'],
	async execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})

		let ipSave=[]
		let portSave=[]

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
		tools.generateEmbed(client,ips,ports).then(embed => {
			message.channel.send("‎ ‎",embed )
			  .then(msg => {
				let db = new sqlite3.Database(baselocation)
				db.run(`INSERT INTO InformationMessage (guildid,channelid,messageid,ipsave,portSave) VALUES(?,?,?,?,?)`,[msg.guild.id,msg.channel.id,msg.id,toString(ipSave),toString(portSave)])
				db.close()

				let ips = ipSave;
				let ports = portSave;

				let timer = setInterval(function() {
					tools.generateMessage(timer,client,msg,msg.channel,msg.id,ips,ports)
				}, 30000)

			})
		})
	},
};