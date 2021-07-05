const { Collector, Message, Channel, User, MessageButton } = require("discord.js");
const Collection = require('discord.js').Collection;
const { Events } = require('discord.js').Constants;

/**
 * Collects Buttons
 * @extends {Collector}
 */
class ButtonCollector extends Collector {
  /**
   * @param  {Object} [object] The data for the collector
   * @param  {CollectorFilter} [filter] The collector filter
   * @param  {CollectorOptions} [options] The collector options
   */
  constructor(data, filter, options = {}) {
    super(data.client, filter, options);

    /**
     * Message provided in data argument
     * @type {Message}
     * @returns {Message|null}
     */
    this.message = data instanceof Message ? data : null;

    /**
     * Channel of the message
     * @type {Channel}
     * @returns {Channel|null}
     */
    this.channel = this.message ? this.message.channel : data;

    /**
     * Collected users
     * @type {Collection}
     * @returns {Collection<User>}
     */
    this.users = new Collection();
    
    /**
     * Total users collected
     * @type {Number}
     * @returns {Number}
     */
    this.total = 0;

    this.empty = this.empty.bind(this);
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this);

    this.client.incrementMaxListeners();
    this.client.on('clickButton', this.handleCollect);

    if (this.message) this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);

    this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);

    this.once('end', () => {
      this.client.removeListener('clickButton', this.handleCollect);

      if (this.message) this.client.removeListener(Events.MESSAGE_DELETE, this._handleMessageDeletion);

      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });

    this.on('collect', async (button) => {
      this.total++;
      if (!button.clicker.user) await button.clicker.fetch();
      this.users.set(button.clicker.user.id, button.clicker.user);
    });
  }
  /**
   * Collect button clicks
   * @param  {MessageButton} [button] The message button
   * @type {Function}
   * @returns {Snowflake}
   */
  collect(button) {
    if (this.message) {
      return button.message.id === this.message.id ? button.discordID : null;
    }
    return button.channel.id === this.channel.id ? button.discordID : null;
  }
  /**
   * Dispose button
   * @param  {MessageButton} [button] The message button
   * @type {Function}
   * @returns {Snowflake}
   */
  dispose(button) {
    if (this.message) {
      return button.message.id === this.message.id ? button.discordID : null;
    }
    return button.channel.id === this.channel.id ? button.discordID : null;
  }
  /**
   * Empty the collector
   * @type {Function}
   */
  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  get endReason() {
    if (this.options.max && this.total >= this.options.max) return 'limit';
    if (this.options.maxButtons && this.collected.size >= this.options.maxButtons) return 'buttonLimit';
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return 'userLimit';
    return null;
  }

  _handleMessageDeletion(message) {
    if (this.message && message.id === this.message.id) {
      this.stop('messageDelete');
    }
  }

  _handleChannelDeletion(channel) {
    if (channel.id === this.channel.id) {
      this.stop('channelDelete');
    }
  }

  _handleGuildDeletion(guild) {
    if (this.channel.guild && guild.id === this.channel.guild.id) {
      this.stop('guildDelete');
    }
  }
}

module.exports = ButtonCollector;