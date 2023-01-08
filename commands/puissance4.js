const Discord = require("discord.js");
const { awaitInteraction } = require("../functions/js/cmds");
const Puissance4 = require("../games/puissance4");

module.exports = {
	data: {
		name: "puissance4",
		description: "Commande en lien avec le Puissance 4",
		options: [
			{
				name: "jouer",
				description: "Jouez au Puissance 4 contre quelqu'un",
				type: 1,
				options: [
					{
						name: "adversaire",
						description: "Séléctionnez votre adversaire !",
						type: 6,
						required: true,
					},
				],
			},
		],
	},
	dev: false,
	async execute(interaction) {
		let subName = interaction.options.getSubcommand();

		if (subName === "jouer") {
			var playData = {
				accepted: null,
				loadingMsg: null,
				acceptMsg: null,
			};

			let opponent = interaction.options.getMember("adversaire");

			if (
				(opponent == interaction.member || opponent.user.bot === true) &&
				this.dev !== true
			)
				return interaction.reply({
					content: "Vous ne pouvez pas jouer contre ce membre.",
					ephemeral: true,
				});

			await interaction.deferReply();
			await interaction.deleteReply();

			const yesBtn = new Discord.MessageButton()
				.setCustomId("p4_yes")
				.setLabel("Oui")
				.setStyle("SUCCESS")
				.setDisabled(false);

			const noBtn = new Discord.MessageButton()
				.setCustomId("p4_no")
				.setLabel("Non")
				.setStyle("DANGER")
				.setDisabled(false);

			playData.acceptMsg = await interaction.channel.send({
				content: `<@${opponent.user.id}>, Voulez-vous jouer au **Puissance 4** contre **${interaction.member.user.tag}** ?`,
				components: [
					new Discord.MessageActionRow().addComponents([yesBtn, noBtn]),
				],
			});

			await awaitInteraction(
				playData.acceptMsg,
				opponent.user,
				"BUTTON",
				async (_interaction) => {
					const accepted = _interaction.customId;

					await _interaction.deferReply();

					// acceptMsg.edit({
					// 	components: [
					// 		new Discord.MessageActionRow().addComponents([
					// 			yesBtn.setDisabled(true),
					// 			noBtn.setDisabled(true),
					// 		]),
					// 	],
					// });

					await _interaction.deleteReply();

					if (accepted === "p4_yes") {
						playData.loadingMsg = await _interaction.channel.send({
							content: "Chargement...",
						});
						return (playData.accepted = true);
					} else if (accepted === "p4_no") {
						return (playData.accepted = false);
					}
				}
			);

			if (playData.accepted === true) {
				await playData.acceptMsg.delete();

				const p4 = new Puissance4(
					interaction.channel,
					interaction.member,
					opponent,
					"⚫",
					playData.loadingMsg
				);
			} else {
				playData.acceptMsg.edit({
					content: "Le Puissance 4 a été refusé par l'adversaire.",
					components: [
						new Discord.MessageActionRow().addComponents([
							yesBtn.setDisabled(true),
							noBtn.setDisabled(true),
						]),
					],
				});
			}
		}
	},
};
