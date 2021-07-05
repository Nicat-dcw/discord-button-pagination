const { sendAPICallback } = require("./APIMessage");
const WebhookClient = require("./WebhookClient.js");
const Message = require("discord.js").Message;

/**
 * Message component.
 */
class MessageComponent {
  /**
   * @param  {Client} [client] DiscordJS Client
   * @param  {Object} [data] Component Data
   */
  constructor(client, data) {
    /**
     * DiscordJS Client
     * @type {Client}
     * @readonly
     */
    this.client = client;

    /**
     * Button custom ID
     * @type {String}
     */
    this.id = data.data.custom_id;

    /**
     * MessageComponent version
     * @type {String}
     */
    this.version = data.version;

    /**
     * MessageComponent token
     * @type {String}
     * <warn>This should be kept private at all times.</warn>
     */
    this.token = data.token;

    /**
     * Discord ID
     * @type {Snowflake}
     */
    this.discordID = data.id;

    /**
     * Application ID
     * @type {Snowflake}
     */
    this.applicationID = data.application_id;

    /**
     * The guild where the message component is.
     * @type {Guild}
     */
    this.guild = data.guild_id
      ? client.guilds.cache.get(data.guild_id)
      : undefined;

    /**
     * The channel where the message component is.
     * @type {Channel}
     */
    this.channel = client.channels.cache.get(data.channel_id);

    /**
     * The clicker that clicked on the button
     * @type {Object}
     */
    this.clicker = {
      user: this.client.users.resolve(
        data.guild_id ? data.member.user.id : data.user.id
      ),
      member: this.guild
        ? this.guild.members.resolve(data.member.user.id)
        : undefined,
      fetch: async () => {
        this.clicker.user = await this.client.users.fetch(
          data.guild_id ? data.member.user.id : data.user.id
        );
        if (this.guild) {
          this.clicker.member = await this.guild.members.fetch(
            data.member.user.id
          );
        }
        return true;
      },
    };

    /**
     * The message of the component
     * @type {Message}
     */
    this.message = new Message(client, data.message, this.channel);

    /**
     * The webhook of the component
     * @type {WebhookClient}
     */
    this.webhook = new WebhookClient(
      data.application_id,
      data.token,
      client.options
    );

    /**
     * Replied to the button clicker or not
     * @type {Boolean}
     */
    this.replied = false;

    /**
     * Deferred the button or not
     * @type {Boolean}
     */
    this.deferred = false;
  }

  /**
   * Defer the button
   * @param {Boolean} [ephemeral] Make the defer ephermal or not
   * @returns {reply}
   */
  async defer(ephemeral = false) {
    if (this.deferred === true || this.replied === true)
      throw new Error(
        "BUTTON_ALREADY_REPLIED: This button already has a reply"
      );
    await this.client.api
      .interactions(this.discordID, this.token)
      .callback.post({
        data: {
          type: 6,
          data: {
            flags: ephemeral ? 1 << 6 : null,
          },
        },
      });
    this.deferred = true;
    return this.reply;
  }
  /**
   * Reply with "Thinking..."
   * @param {Boolean} [ephemeral] Make the reply ephermal or not
   * @returns {reply}
   */
  async think(ephemeral = false) {
    if (this.deferred === true || this.replied === true)
      throw new Error(
        "BUTTON_ALREADY_REPLIED: This button already has a reply"
      );
    await this.client.api
      .interactions(this.discordID, this.token)
      .callback.post({
        data: {
          type: 5,
          data: {
            flags: ephemeral ? 1 << 6 : null,
          },
        },
      });
    this.replied = true;
    return this.reply;
  }
  /**
   * Follow up
   * @param {String} [content] Content
   * @param {MessageOptions|ReplyOptions} [options] Options
   * @private
   */
  async followUp(content, options) {
    await this.webhook.send(content, options);
  }
  
  get reply() {
    let _send = async (content, options) => {
      if (this.deferred === true || this.replied === true)
        throw new Error(
          "BUTTON_ALREADY_REPLIED: This button already has a reply"
        );

      if (typeof options === "boolean" && options === true) {
        options = { flags: 1 << 6 };
      }

      let apiMessage;

      if (content instanceof sendAPICallback) {
        apiMessage = content.resolveData();
      } else {
        apiMessage = sendAPICallback
          .create(this.channel, content, options)
          .resolveData();
      }

      if (Array.isArray(apiMessage.data.content)) {
        apiMessage.data.content = apiMessage.data.content[0];
      }

      const { data: info, files } = await apiMessage.resolveFiles();
      await this.client.api
        .interactions(this.discordID, this.token)
        .callback.post({
          data: {
            data: info,
            type: options
              ? options.type
                ? [4, 5, 6, 7].includes(parseInt(options.type))
                  ? parseInt(options.type)
                  : 4
                : 4
              : 4,
          },
          files,
        });
      this.replied = true;
      return this.reply;
    };
    let _fetch = async () => {
      const raw = await this.webhook.fetchMessage("@original");
      return this.channel ? this.channel.messages.add(raw) : raw;
    };
    let _edit = async (content, options) => {
      if (this.replied === false)
        throw new Error("BUTTON_HAS_NO_REPLY: This button has no reply");
      const raw = await this.webhook.editMessage("@original", content, options);
      return this.channel ? this.channel.messages.add(raw) : raw;
    };
    let _delete = async () => {
      if (this.replied === false)
        throw new Error("BUTTON_HAS_NO_REPLY: This button has no reply");
      return await this.webhook.deleteMessage("@original");
    };

    return {
      send: _send,
      fetch: _fetch,
      edit: _edit,
      delete: _delete,
    };
  }
}

module.exports = MessageComponent;
