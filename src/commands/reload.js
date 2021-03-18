const fs = require('fs');
module.exports = {
	name: 'reload',
	args: true,
	cooldown: 0.5,
	description: 'Reloads a command',
	aliases: ['r'],
	execute(message, args, client, baselocation, command) {
		message.delete({timeout:10}).catch(err=>{return})
		if(message.author.id!=224142905537855489){return}

		const commandFiles = fs.readdirSync(`${__dirname}`).filter(file => file.endsWith('.js'));

		delete require.cache[require.resolve(`${__dirname}/${command.name}.js`)];
		try {
			const newCommand = require(`${__dirname}/${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send('The restart went well').then(msg=>{msg.delete({timeout:2500})})
		} catch (error) {
			message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``).then(msg=>{msg.delete({timeout:2500})});
		}
	},
};
