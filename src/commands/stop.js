const sqlite3 = require('sqlite3').verbose();
const config = require(`${__dirname}/../config.json`)

module.exports = {
	name: 'stop',
	cooldown: 1,
	permissions: ['MANAGE_MESSAGES','MANAGE_SERVER'],
	aliases: ['so'],
	async execute(message, args, client, db) {
		message.delete({timeout:10}).catch(err=>{return})

        db.all(`SELECT * FROM Tracked WHERE guildid=? AND channelid=?`,
          [message.guild.id,message.channel.id],async (err,rows)=>{

          	if(rows==undefined || rows.length==0){

          		message.channel
          		  .send(`You dont have any server traked in this channel`)
          		   .then(m=>{m.delete({timeout:2500})
          		    .catch(e=>{return;});
          		   });
          		return;
          	}

          	for await (let row of rows){

	          	const _ = (args.length>0 ? args.findIndex(_ => _ === row.messageid) : 0);

	          	if(_ != -1){

		  			message.channel.messages
		  			 .fetch(row.messageid)
					  .catch(err=>{return})
					  .then(msg => {
					  	msg.delete({timeout:10})
					  	 .catch(err=>{return});
					  });

		          	db.run(`DELETE FROM Tracked WHERE guildid=? AND channelid=? AND messageid=?`,
		              row.guildid, row.channelid, row.messageid);

		          	db.run(`UPDATE Users SET servers = (SELECT servers from Users WHERE id=?) - ? WHERE id=?`,
          			  row.authorid, row.ips.split('#').length, row.authorid);

		          	db.run(`UPDATE Guilds SET servers = (SELECT servers from Guilds WHERE id=?) - ? WHERE id=?`,
          			  row.guildid, row.ips.split('#').length, row.guildid);
	          	}
          	}
        })
	},
};
