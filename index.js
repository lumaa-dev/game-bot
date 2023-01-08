const { createClient } = require("./functions/js/client");
const Func = require("./functions/all");
const config = require("./functions/config.json");
const fs = require("fs");
const Discord = require("discord.js");

const client = createClient([
	Discord.IntentsBitField.Flags.Guilds,
	Discord.IntentsBitField.Flags.GuildMessages,
	Discord.IntentsBitField.Flags.MessageContent,
]);

client.once("ready", async () => {
	//util.setPlaying(client, `${config.prefix}help`, "online")
	console.log(`${client.user.tag} is online`);
});

client.on("messageCreate", async (/**@type {Discord.Message} */message) => {
	console.log(message)
	if (
		message.author.id === config.ownerId &&
		message.content === `${config.devPrefix}deploy`
	) {
		var a = [];
		const files = await fs.readdirSync(__dirname + "/commands");
		const cmds = onlyJs(files);

		cmds.forEach((cmd) => {
			a.push(require("./commands/" + cmd.replace(".js", "")).data);
		});

		await client.guilds.cache.get(message.guild.id)?.commands.set(a);
		// await client.guilds.cache
		// 	.get(message.guild.id)
		// 	?.commands?.cache.each(async (cmd) => {
		// 		if (cmd.description === "Dev") {
		// 			// const all = {
		// 			// 	id: message.guild.roles.everyone.id,
		// 			// 	type: "ROLE",
		// 			// 	permission: false,
		// 			// };
		// 			// const owner = {
		// 			// 	id: config.ownerId,
		// 			// 	type: "USER",
		// 			// 	permission: true,
		// 			// };

		// 			// await cmd.permissions.set({
		// 			// 	command: cmd.id,
		// 			// 	permissions: [owner, all],
		// 			// });
		// 			console.log("dev command");
		// 		} else {
		// 			console.log("global command");
		// 		}
		// 	});
		console.log("Initialized all commands");
		message.react("✅");
	} else if (
		message.author.id === config.ownerId &&
		message.content === `${config.devPrefix}gdeploy`
	) {
		var a = [];
		const files = await fs.readdirSync(__dirname + "/commands");
		const cmds = onlyJs(files);

		cmds.forEach((cmd) => {
			if (a.description === "Dev") return;
			a.push(require("./commands/" + cmd.replace(".js", "")).data);
		});

		await client.application?.commands.set(a);
		await client.guilds.cache.get(message.guild.id)?.commands.set([]);
		console.log("Initialized everywhere default commands");
		message.react("✅");
	}
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		let { commandName: name } = interaction;

		require("./commands/" + name).execute(interaction);
	}
});

/**
 * It takes an array of file names, and returns an array of only the file names that end with ".js"
 * @param {Array<String>} files - An array of file names.
 * @returns {Array<String>} An array of file names with .js at the end.
 */
function onlyJs(files) {
	var output = [];
	files.forEach((file) => {
		if (file.endsWith(".js")) {
			output.push(file);
		} else {
			console.log(file + " isn't .js");
		}
	});

	return output;
}

client.login(require("./functions/token.json").token);
