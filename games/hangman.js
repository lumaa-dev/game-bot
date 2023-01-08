const Discord = require("discord.js");
const Func = require("../functions/all");
const HangManConfig = require("../functions/config.json").hangman;
const { awaitMessage } = require("../functions/js/cmds");

/** It's a class that creates a game of hangman */
class HangMan {
	/**
	 * If the word is null, then if the randomWord option is true, then set the word to a random word from
	 * the HangManConfig.words array, otherwise if the randomWord option is false, then call the askWord
	 * function with the gameData, channel, playerWrite, and options parameters.
	 * @param {Discord.GuildMember} playerWrite - The player who is writing the word
	 * @param {Discord.GuildMember} playerGuess - The player who is guessing the word
	 * @param {Discord.TextBasedChannel} channel - The channel the game is being played in
	 * @param {String} [word=null] - The word that the player will guess.
	 * @param {Object} [options] - { randomWord: false, oneWord: true, caseSensitive: false, specialChars: false }
	 */
	constructor(
		playerWrite,
		playerGuess,
		channel,
		word = null,
		options = {
			randomWord: false,
			oneWord: true,
			caseSensitive: false,
			specialChars: false,
		}
	) {
		var gameData = this.GameObject(playerWrite, playerGuess, channel, word);

		if (word === null) {
			if (options.randomWord === true) {
				const words = HangManConfig.words;

				gameData.word = words[Math.round(Math.random() * words.length)];
			} else if (options.randomWord === false) {
				this.askWord(gameData, channel, playerWrite, options);
			}

			channel.send({ content: gameData.drawings[0] });
		}
	}

	/**
	 * It creates a game object
	 * @param {Discord.GuildMember} player1 - The player who will write the word
	 * @param {Discord.GuildMember} player2 - The player who will be guessing the word.
	 * @param {Discord.TextBasedChannel} channel - The channel where the game is being played.
	 * @param {String} [word=null] - The word to guess.
	 * @returns {HangMan.GameObject} A game object.
	 */
	GameObject(player1, player2, channel, word = null) {
		const gameObject = {
			channel: channel,
			playerWrite: player1,
			playerGuess: player2,
			word: word,
			maxTries: 10,
			tries: 0,
			drawings: [
				"```\n*Rien*```",
				"```\n\n\n\n\n\n\n\n  -------\n```",
				"```\n\n  |\n  |\n  |\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |\n  |\n  |\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |\n  |\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |    |\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |   /|\n  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |   /|  |\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |   /|  |   /\n  |\n  |\n  -------\n```",
				"```\n  -----|-\n  |    |\n  |    O\n  |   /|  |   /   |\n  |\n  -------\n```",
			],
			isGameObject() {
				return true;
			},
		};

		if (gameObject.maxTries + 1 !== gameObject.drawings.length)
			throw Error("Amount of max tries doesn't match with drawings amount");

		return gameObject;
	}

	/**
	 * It asks the user to write a word, and then it checks if the word is valid
	 * @param {HangMan.GameObject} gameData - The object that contains all the data of the game.
	 * @param {Discord.TextBasedChannel} channel - The channel where the game is played
	 * @param {Discord.GuildMember} playerWrite - The player who wrote the word
	 * @param {Object} options - { randomWord: false, oneWord: true, caseSensitive: false, specialChars: false }
	 */
	async askWord(gameData, channel, playerWrite, options) {
		channel.send(`<@${playerWrite.id}>, Écrivez le mot à faire deviner.`);
		await awaitMessage(channel, playerWrite, (collected) => {
			const message = collected.first();
			var userWord = null;

			if (options.oneWord === true)
				userWord = message.content.split(/ +/g, 1)[0];
			if (options.caseSensitive === false) userWord = userWord.toLowerCase();
			if (options.specialChars === false) {
				const matched = userWord.match(/(?![a-z]).?/g);
				if (matched[0] !== "") {
					console.log(matched);
					return message.reply({
						content:
							"Vous ne pouvez pas avoir les caractères suivants :\n`" +
							matched.toString().replace(/,/g, ", ") +
							"`",
					});
				}
			}
			gameData.word = userWord;
		});
	}
}

module.exports = HangMan;
