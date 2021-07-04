  
const { Client } = require("discord.js");

var version = require('discord.js').version.split('');
version = parseInt(version[0] + version[1]);

module.exports = (client) => {

    const { Events } = require('discord.js').Constants;

    Events.CLICK_BUTTON = 'clickButton';

    if (!client || !client instanceof Client) throw new Error("INVALID_CLIENT_PROVIDED: The discord.js client is not provided or is invalid...")

    client.ws.on('INTERACTION_CREATE', (data) => {

        if (!data.message) return;

        if (data.data.component_type) {
            const MessageComponent = require('./clickButton');
            const button = new MessageComponent(client, data);

            client.emit('clickButton', button);
        }
    });

    return;
}