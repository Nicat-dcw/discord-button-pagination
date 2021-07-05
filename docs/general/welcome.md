<div align="center">
  <br />
  <p>
    <a href="https://discord.js.org"><img src="/static/logo.svg" width="546" alt="discord.js" id="djs-logo" /></a>
  </p>
  <br />
  <p>
    <a href="https://discord.com/invite/VjT65u4w2D"><img src="https://img.shields.io/discord/222078108977594368?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/discord-button-pagination"><img src="https://img.shields.io/npm/v/discord-button-pagination.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord-button-pagination"><img src="https://img.shields.io/npm/dt/discord-button-pagination.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://travis-ci.org/BUGO07/discord-button-pagination"><img src="https://travis-ci.org/BUGO07/discord-button-pagination.svg" alt="Build status" /></a>
    <a href="https://david-dm.org/BUGO07/discord-button-pagination"><img src="https://img.shields.io/david/BUGO07/discord-button-pagination?maxAge=3600" alt="Dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discord-button-pagination/"><img src="https://nodei.co/npm/discord-button-pagination.png?downloads=true&stars=true" alt="NPM info" /></a>
  </p>
</div>

# Welcome!

Welcome to the discord.js v12 documentation.

## About

discord-button-pagination is a powerful [Node.js](https://nodejs.org) module that allows you to paginate embeds with
newly added buttons in the [Discord API](https://discord.com/developers/docs/intro) very easily.

## Installation

**Node.js 14.0.0 or newer is required.**  
Ignore any warnings about unmet peer dependencies, as they're all optional.

Without voice support: `npm install discord-button-pagination`

## Example usage

```js
const {	Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES
	]
});
const BP = require("./src/index")
const bP = new BP.Client(client)

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
	if (message.content === "btnpagination") {
		new BP.ButtonPagination(
			message,
			[
				new MessageEmbed().setDescription("page 1"),
				new MessageEmbed().setDescription("page 2")
			],
			"leftButtonEmoji",
			"rightButtonEmoji",
			"cancelButtonEmoji",
			60e3
		)
	}
});

client.login('token');
```

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Discord.js Server](https://discord.com/invite/VjT65u4w2D).