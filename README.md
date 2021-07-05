# Welcome to discord-button-pagination 👋
[![Version](https://img.shields.io/npm/v/discord-button-pagination.svg)](https://www.npmjs.com/package/discord-button-pagination)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> Button Pagination

### 🏠 [Homepage](https://github.com/BUGO07/discord-button-pagination#readme)

## Install

```sh
npm install discord-button-pagination
```

## Example

```js
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { BP, ButtonPagination } = require("discord-button-pagination")
const bP = new BP(client)

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
	if (message.content === "pagination") {
		new ButtonPagination(
			message,
			[
				embed1,
				embed2
			],
			"leftButtonEmoji",
			"rightButtonEmoji",
			"trashButtonEmoji",
			60e3
		)
	}
});

client.login('token');
```

## Example

``www.bugodev.cf
* Github: [@BUGO07](https://github.com/BUGO07)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/BUGO07/discord-button-pagination/issues). 

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2021 [bugo07](https://github.com/BUGO07).

This project is [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/) licensed.