const {
  version,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Message,
  Collection,
} = require("discord.js");

let initialized = false;

/**
 * Initialize ButtonPagination to then extend other MessageButton class
 */
class Client {
  /**
   * @param  {Client} [client] DiscordJS Client
   */
  constructor(client) {
    var version = require("discord.js").version.split("");
    version = parseInt(version[0] + version[1]);
    if (!version =="13") {
      throw new Error("discord.js version must be <= 13");
    }
    require("./buttons/ExtendedButton")(client);
    initialized = true;
  }
}

async function buttonPagination(message, pages, left, right, trash, time) {
  if (!initialized) {
    throw new Error("[BP] ButtonPagination client is not initialized");
  }
  if (!message instanceof Message) {
    throw new TypeError("[BP] You must provide a valid message");
  }
  const ButtonCollector = require("./buttons/ButtonCollector");
  if (!pages || !Array.isArray(pages) || !pages.length) {
    throw new TypeError("[BP] You must provide an array of pages");
  }
  if (!left || typeof left != "string") {
    throw new TypeError("[BP] You must provide left button emoji as a string!");
  }
  if (!right || typeof right != "string") {
    throw new TypeError(
      "[BP] You must provide right button emoji as a string!"
    );
  }
  if (!trash || typeof trash != "string") {
    throw new TypeError("[BP] You must provide cancel button emoji as string!");
  }
  if (!time || typeof time != "number") {
    throw new TypeError("[BP] You must provide expiration time as number!");
  }
  const l = new MessageButton()
    .setStyle("PRIMARY")
    .setCustomID("left")
    .setEmoji(left);
  const r = new MessageButton()
    .setStyle("PRIMARY")
    .setCustomID("right")
    .setEmoji(right);
  const t = new MessageButton()
    .setStyle("DANGER")
    .setCustomID("trash")
    .setEmoji(trash);
  const ar = new MessageActionRow({
    components: [l.setDisabled(true), r, t],
  });
  var currentPage = 0;
  let msg = await message.channel.send({
    embeds: [pages[0].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
    components: [ar],
  });
  let msgId = msg.id;
  const collector = new ButtonCollector(
    msg,
    (button) => button.clicker.user.id !== "0",
    { time: time }
  );
  let timer = setTimeout(async () => {
    try {
      collector.stop();
      message.channel.messages.edit(msgId, {
        content: "Time has expired",
        components: [],
        embeds: [
          pages[currentPage].setFooter(
            `Page ${currentPage + 1}/${pages.length}`
          ),
        ],
      });
    } catch (error) {
      if (error.code == 10008) {
        return;
      }
    }
  }, time);
  const cooldowns = new Map();
  const cooldowns1 = new Map();
  collector.on("collect", async (b) => {
    if (b.clicker.user.id !== message.author.id) {
      if (!cooldowns.has(b.emoji)) {
        cooldowns.set(b.emoji, new Collection());
      }
      const current_time = Date.now();
      const time_stamps = cooldowns.get(b.emoji);
      const cooldown_amount = 3500;
      if (time_stamps.has(b.clicker.user.id)) {
        const expiration_time =
          time_stamps.get(b.clicker.user.id) + cooldown_amount;
        if (current_time < expiration_time) {
          return await b.defer();
        }
      }
      time_stamps.set(b.clicker.user.id, current_time);
      setTimeout(() => time_stamps.delete(b.clicker.user.id), cooldown_amount);
      let warnEmbed = new MessageEmbed()
        .setDescription("Only the command executor can navigate")
        .setColor("RED");
      return await b.reply.send({
        embeds: [warnEmbed],
        ephermal: true,
      });
    }
    if (!cooldowns1.has(b.emoji)) {
      cooldowns1.set(b.emoji, new Collection());
    }
    const current_time = Date.now();
    const time_stamps = cooldowns1.get(b.emoji);
    const cooldown_amount = 1100;
    if (time_stamps.has(b.clicker.user.id)) {
      const expiration_time =
        time_stamps.get(b.clicker.user.id) + cooldown_amount;
      if (current_time < expiration_time) {
        return await b.defer();
      }
    }
    time_stamps.set(b.clicker.user.id, current_time);
    setTimeout(() => time_stamps.delete(b.clicker.user.id), cooldown_amount);
    await b.defer();
    if (b.id == "left") {
      r.setDisabled(false);
      if (currentPage !== 0) {
        --currentPage;
        if (currentPage == 0) {
          l.setDisabled(true);
        }
        msg.edit({
          embeds: [
            pages[currentPage].setFooter(
              `Page ${currentPage + 1}/${pages.length}`
            ),
          ],
          components: [
            new MessageActionRow({
              components: [l, r, t],
            }),
          ],
        });
      } else {
        l.setDisabled(false);
        currentPage = pages.length - 1;
        msg.edit({
          embeds: [
            pages[currentPage].setFooter(
              `Page ${currentPage + 1}/${pages.length}`
            ),
          ],
          components: [
            new MessageActionRow({
              components: [l, r, t],
            }),
          ],
        });
      }
    } else if (b.id == "right") {
      l.setDisabled(false);
      if (currentPage < pages.length - 1) {
        currentPage++;
        if (currentPage == pages.length - 1) {
          r.setDisabled(true);
        }
        msg.edit({
          embeds: [
            pages[currentPage].setFooter(
              `Page ${currentPage + 1}/${pages.length}`
            ),
          ],
          components: [
            new MessageActionRow({
              components: [l, r, t],
            }),
          ],
        });
      } else {
        r.setDisabled(false);
        currentPage = 0;
        msg.edit({
          embeds: [
            pages[currentPage].setFooter(
              `Page ${currentPage + 1}/${pages.length}`
            ),
          ],
          components: [
            new MessageActionRow({
              components: [l, r, t],
            }),
          ],
        });
      }
    } else if (b.id == "trash") {
      try {
        collector.stop();
        message.channel.messages.edit(msgId, {
          content: "Cancelled by user",
          components: [],
          embeds: [
            pages[currentPage].setFooter(
              `Page ${currentPage + 1}/${pages.length}`
            ),
          ],
          allowedMentions: { repliedUser: false },
        });
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
      } catch (error) {
        if (error.code == 10008) {
          return;
        }
      }
    }
  });
}

/**
 * Sends a message with paginated embeds & buttons
 */
class ButtonPagination {
  /**
   * @param  {Message} [message] Message to get channel of
   * @param  {Array} [pages] Array of embeds to paginate
   * @param  {String} [left] Left button emoji
   * @param  {String} [right] Right button emoji
   * @param  {String} [cancel] Cancel button emoji
   * @param  {Number} [time] Time until pagination expires
   */
  constructor(message, pages, left, right, trash, time) {
    buttonPagination(message, pages, left, right, trash, time);
  }
}

module.exports.ButtonPagination = ButtonPagination;
module.exports.Client = Client;
module.exports.APIMessage = require("./buttons/APIMessage");
module.exports.ButtonCollector = require("./buttons/ButtonCollector");
module.exports.MessageComponent = require("./buttons/MessageComponent");
module.exports.Util = require("./buttons/Util");
module.exports.WebhookClient = require("./buttons/WebhookClient");
