const Discord = require("discord.js");
const { awaitInteraction } = require("../functions/js/cmds");
const HangMan = require("../games/hangman");

module.exports = {
	data: {
		name: "hangman",
		description: "Commande en lien avec le Pendu",
		options: [
			{
				name: "jouer",
				description: "Jouez au Pendu contre quelqu'un",
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
	dev: true,
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
				(opponent == interaction.member || opponent.user.bot) &&
				this.dev !== true
			)
				return interaction.reply({
					content: "Vous ne pouvez pas jouer contre ce membre.",
					ephemeral: true,
				});

			await interaction.deferReply();
			await interaction.deleteReply();

			const yesBtn = new Discord.MessageButton()
				.setCustomId("hm_yes")
				.setLabel("Oui")
				.setStyle("SUCCESS")
				.setDisabled(false);

			const noBtn = new Discord.MessageButton()
				.setCustomId("hm_no")
				.setLabel("Non")
				.setStyle("DANGER")
				.setDisabled(false);

			playData.acceptMsg = await interaction.channel.send({
				content: `<@${opponent.user.id}>, Voulez-vous jouer au **Pendu** contre **${interaction.member.user.tag}** ?`,
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
					await _interaction.deleteReply();

					if (accepted === "hm_yes") {
						playData.loadingMsg = await _interaction.channel.send({
							content: "Chargement...",
						});
						return (playData.accepted = true);
					} else if (accepted === "hm_no") {
						return (playData.accepted = false);
					}
				}
			);

			if (playData.accepted === true) {
				await playData.acceptMsg.delete();

				const hm = new HangMan(
					interaction.member,
					opponent,
					interaction.channel
				);
			} else {
				playData.acceptMsg.edit({
					content: "Le Pendu a été refusé par l'adversaire.",
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
