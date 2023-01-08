const Discord = require("discord.js");
const { awaitInteraction } = require("../functions/js/cmds");

// to do:
// show off where you won
// stop button

class Puissance4 {
	/**
	 * Create a game of Puissance4
	 * @param {Discord.TextChannel} channel The channel the game will occur
	 * @param {Discord.GuildMember} player1 The first player
	 * @param {Discord.GuildMember} player2 The second player
	 * @param {Discord.EmojiResolvable} emoji The default emoji (blank ones)
	 * @param {Discord.Message} message Message the game will occur
	 * @param {Boolean} instantPlay If set to true, the Puissance4 will start directly
	 */
	constructor(
		channel,
		player1,
		player2,
		emoji,
		message = undefined,
		instantPlay = true
	) {
		const gameData = this.GameObject(player1, player2, channel, emoji);

		if (typeof message == "undefined") {
			gameData.gameMessage = channel.send({ content: "Chargement..." });
		} else {
			gameData.gameMessage = message;
		}

		if (instantPlay === true) this.NewTurn(gameData);
	}

	/**
	 * Creates an object for stocking data
	 * @param {Discord.GuildMember} player1 First player
	 * @param {Discord.GuildMember} player2 Second player
	 * @param {Discord.TextChannel} channel Text Channel the game happens in
	 * @param {Discord.EmojiResolvable} emoji Default Emoji (blank ones)
	 * @returns {GameObject} Game Object
	 */
	GameObject(player1, player2, channel, emoji) {
		return {
			player1: player1,
			player2: player2,
			channel: channel,
			blankEmoji: emoji,
			player1emoji: "🔵",
			player2emoji: "🔴",
			winningEmoji: "🟢",
			gameMessage: null,
			rows: this.createRows(emoji),
			stringRows: null,
			turn: 1,
			winner: null,
			isGameObject() {
				return true;
			},
		};
	}

	/**
	 * Switches turns between player 1 and 2
	 * @param {Puissance4.GameObject} gameData
	 */
	async NewTurn(gameData) {
		if (gameData.isGameObject() !== true) return null;

		if (gameData.turn === 1) {
			gameData.turn = 2;
		} else {
			gameData.turn = 1;
		}

		const playerTurn = this._identifyPlayers(
			gameData.turn,
			gameData.player1,
			gameData.player2
		);

		gameData.stringRows = this.rowsToString(gameData.rows);
		gameData.gameMessage.edit({
			content: `C'est au tour de <@${playerTurn.user.id}>.\n${gameData.stringRows}`,
			components: this._playableButtons(gameData.rows, gameData.blankEmoji),
		});

		await awaitInteraction(
			gameData.gameMessage,
			playerTurn.user,
			"BUTTON",
			async (_interaction) => {
				const rowPlaying = Number(_interaction.customId.split("_")[1]);
				for (let i = 5; i > 0; i--) {
					if (gameData.rows[i][rowPlaying] == gameData.blankEmoji) {
						gameData.rows[i][rowPlaying] = this._identifyColors(
							gameData.player1,
							gameData.player2,
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.blankEmoji,
							playerTurn
						);

						await _interaction.deferReply({ ephemeral: false });

						const winner = this.FindWin(gameData);

						await _interaction.deleteReply();
						if (winner === null) {
							// await _interaction.editReply({
							// 	content: "Votre tour à été comptabilisé",
							// 	ephemeral: true,
							// });

							await this.NewTurn(gameData);
						} else {
							gameData.stringRows = this.rowsToString(gameData.rows);
							gameData.gameMessage.edit({
								content: `Bravo ${this._identifyColors(
									gameData.player1,
									gameData.player2,
									gameData.player1emoji,
									gameData.player2emoji,
									gameData.blankEmoji,
									winner
								)} <@${winner.user.id}> d'avoir gagné !\n${
									gameData.stringRows
								}`,
								components: [],
							});
						}
					}
				}
			}
		);
	}

	/**
	 * It checks if there's a winner in the game
	 * @param {Puissance4.GameObject} gameData - The gameData object
	 * @param {Boolean} [changeOnWin=true] - If true, it will change the winning rows and columns to the winner emoji.
	 * @returns {Discord.GuildMember|null} The winner of the game if there is one.
	 */
	FindWin(gameData, changeOnWin = true) {
		if (gameData.isGameObject() !== true) return null;
		var winner = null;

		for (let i = 0; i < gameData.rows.length; i++) {
			for (let x = 0; x < gameData.rows[i].length; x++) {
				try {
					if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i][x + 1] &&
						gameData.rows[i][x + 1] == gameData.rows[i][x + 2] &&
						gameData.rows[i][x + 2] == gameData.rows[i][x + 3]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i][x + 1] = gameData.winningEmoji;
							gameData.rows[i][x + 1] = gameData.winningEmoji;
							gameData.rows[i][x + 3] = gameData.winningEmoji;
						}
					} else if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i][x - 1] &&
						gameData.rows[i][x - 1] == gameData.rows[i][x - 2] &&
						gameData.rows[i][x - 2] == gameData.rows[i][x - 3]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i][x - 1] = gameData.winningEmoji;
							gameData.rows[i][x - 1] = gameData.winningEmoji;
							gameData.rows[i][x - 3] = gameData.winningEmoji;
						}
					} else if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i - 1][x] &&
						gameData.rows[i - 1][x] == gameData.rows[i - 2][x] &&
						gameData.rows[i - 2][x] == gameData.rows[i - 3][x]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i - 1][x] = gameData.winningEmoji;
							gameData.rows[i - 2][x] = gameData.winningEmoji;
							gameData.rows[i - 3][x] = gameData.winningEmoji;
						}
					} else if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i + 1][x] &&
						gameData.rows[i + 1][x] == gameData.rows[i + 2][x] &&
						gameData.rows[i + 2][x] == gameData.rows[i + 3][x]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i + 1][x] = gameData.winningEmoji;
							gameData.rows[i + 2][x] = gameData.winningEmoji;
							gameData.rows[i + 3][x] = gameData.winningEmoji;
						}
					} else if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i - 1][x - 1] &&
						gameData.rows[i - 1][x - 1] == gameData.rows[i - 2][x - 2] &&
						gameData.rows[i - 2][x - 2] == gameData.rows[i - 3][x - 3]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i - 1][x - 1] = gameData.winningEmoji;
							gameData.rows[i - 2][x - 2] = gameData.winningEmoji;
							gameData.rows[i - 3][x - 3] = gameData.winningEmoji;
						}
					} else if (
						gameData.rows[i][x] !== gameData.blankEmoji &&
						gameData.rows[i][x] == gameData.rows[i + 1][x + 1] &&
						gameData.rows[i + 1][x + 1] == gameData.rows[i + 2][x + 2] &&
						gameData.rows[i + 2][x + 2] == gameData.rows[i + 3][x + 3]
					) {
						winner = this._identifyWinner(
							gameData.rows[i][x],
							gameData.player1emoji,
							gameData.player2emoji,
							gameData.player1,
							gameData.player2
						);

						if (changeOnWin) {
							gameData.rows[i][x] = gameData.winningEmoji;
							gameData.rows[i + 1][x + 1] = gameData.winningEmoji;
							gameData.rows[i + 2][x + 2] = gameData.winningEmoji;
							gameData.rows[i + 3][x + 3] = gameData.winningEmoji;
						}
					}
				} catch (e) {
					console.log("unexisting grid position, that's normal though");
				}
			}
		}
		return winner;
	}

	/**
	 * @param {Number} turn 1 or 2
	 * @param {Discord.GuildMember} player1
	 * @param {Discord.GuildMember} player2
	 * @returns {Discord.GuildMember} player1 or player2
	 */
	_identifyPlayers(turn, player1, player2) {
		if (turn === 1) return player1;
		if (turn === 2) return player2;
		if (turn > 2 && turn < 1) throw Error("Turn is not 1 or 2");
	}

	/**
	 * @param {Discord.GuildMember} player1
	 * @param {Discord.GuildMember} player2
	 * @param {Discord.EmojiResolvable} player1emoji
	 * @param {Discord.EmojiResolvable} player2emoji
	 * @param {Discord.GuildMember} playing Player that played/is playing
	 * @returns {Discord.EmojiResolvable} The player's emoji
	 */
	_identifyColors(
		player1,
		player2,
		player1emoji,
		player2emoji,
		blankEmoji,
		playing
	) {
		if (playing === player1) return player1emoji;
		if (playing === player2) return player2emoji;
		if (playing !== player1 && playing !== player2) return blankEmoji;
	}

	/**
	 * @param {Discord.EmojiResolvable} winnerEmoji The potential emoji that won
	 * @param {Discord.EmojiResolvable} player1emoji
	 * @param {Discord.EmojiResolvable} player2emoji
	 * @param {Discord.GuildMember} player1
	 * @param {Discord.GuildMember} player2
	 * @returns The winner
	 */
	_identifyWinner(winnerEmoji, player1emoji, player2emoji, player1, player2) {
		if (winnerEmoji == player1emoji) return player1;
		if (winnerEmoji == player2emoji) return player2;
		if (winnerEmoji !== player1emoji && winnerEmoji !== player2emoji)
			throw Error("Winner Emoji doesn't match with any emojis");
	}

	/**
	 * It creates a 6x7 array of the given emoji.
	 * @param {Discord.EmojiResolvable} emoji - The emoji to fill the board with.
	 * @returns {Array<Discord.EmojiResolvable>} An array of arrays.
	 */
	createRows(emoji) {
		var rows = new Array(6);

		for (var i = 0; i < rows.length; i++) {
			rows[i] = new Array(7).fill(emoji);
		}

		return rows;
	}

	/**
	 * It takes an array of arrays and returns a string that can be used in Discord
	 * @param rows - The variable "rows" in Puissance4.
	 * @returns A string representing Puissance4's "rows" variable
	 */
	rowsToString(rows) {
		if (!Array.isArray(rows)) throw Error("Rows isn't an Array");

		var string = "";
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];

			if (!Array.isArray(row)) throw Error(`Row[${i}] isn't an Array`);

			row.forEach((element) => {
				string += element;
			});

			string += "\n";
		}

		return `\`\`\`${string}\`\`\``;
	}

	_playableButtons(rows, blankEmoji) {
		if (!Array.isArray(rows)) throw Error("Rows isn't an Array");

		var rowsDisabled = [];

		for (let i = 0; i < rows[0].length; i++) {
			if (
				rows[0][i] !== blankEmoji &&
				rows[1][i] !== blankEmoji &&
				rows[2][i] !== blankEmoji &&
				rows[3][i] !== blankEmoji &&
				rows[4][i] !== blankEmoji &&
				rows[5][i] !== blankEmoji
			) {
				rowsDisabled.push(i);
			}
		}

		var components1 = [];

		for (let i = 0; i < rows[0].length; i++) {
			if (rowsDisabled.find((x) => x == i)) {
				var disabled = true;
			}

			const btn = new Discord.MessageButton()
				.setCustomId(`p4_${i}`)
				.setDisabled(disabled ?? false)
				.setEmoji(numberEmojis(i + 1))
				.setStyle("SECONDARY");

			components1.push(btn);
		}

		const components2 = components1.splice(5);

		return [
			new Discord.MessageActionRow().addComponents(components1),
			new Discord.MessageActionRow().addComponents(components2),
		];
	}
}

module.exports = Puissance4;

/**
 * Given a number, return the corresponding emoji
 * @param {Number|String} [number=1] - The number to convert to emoji.
 * @returns {String} A string of emojis.
 */
function numberEmojis(number = 1) {
	if (isNaN(Number(number)) || (number > 9 && number < 0)) return null;
	if (number === 0) return "0️⃣";
	if (number === 1) return "1️⃣";
	if (number === 2) return "2️⃣";
	if (number === 3) return "3️⃣";
	if (number === 4) return "4️⃣";
	if (number === 5) return "5️⃣";
	if (number === 6) return "6️⃣";
	if (number === 7) return "7️⃣";
	if (number === 8) return "8️⃣";
	if (number === 9) return "9️⃣";
}
