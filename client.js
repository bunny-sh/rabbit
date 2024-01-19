import WebSocket from 'ws';
import axios from 'axios';

class Wrapper {
  /**
   * @class
   * @param {string} token
   * @param {object} settings
   * @argument {string} [settings.os.name]
   * @argument {string} [settings.os.version]
   * @argument {boolean} [settings.device]
   * @argument {string} [settings.afk]
   * @argument {Array<object>} [settings.activities]
   * @argument {string} [settings.status]
   */

  constructor(token, settings) {
    this.settings = settings;
    if (!this.settings.guild_id) this.settings.guild_id = null;
    if (!this.settings.devide) this.settings.device = '';
    if (!this.settings.status) this.settings.status = 'dnd';
    if (!this.settings.afk) this.settings.afk = false;
    if (!this.settings.game) this.settings.game = [];
    if (!this.settings.os)
      this.settings.os = { name: 'Windows', version: '10' };
    if (!this.settings.browser)
      this.settings.browser = {
        name: 'Chrome',
        user_agent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
        version: '76.0.3809.132',
      };
    this.token = token;
    axios.defaults.headers.common['authorization'] = this.token;
    this.s = 0;
    this.self;
    this.events = {};

    this.init = function () {
      this.socket = new WebSocket(
        'wss://gateway.discord.gg/?encoding=json&v=9'
      );
      this.socket.onopen = this._onopen.bind(this);
      this.socket.onmessage = this._onmessage.bind(this);
      this.socket.onerror = this.socket.onclose = this._onerror.bind(this);
    };
    this.init();
  }

  /**
   * Executes the callback when event is received.
   * @param {string} name
   * @param {function callback(event) {}} callback
   */
  on(name, callback) {
    this.events[name] = callback;
  }
  /**
   * @private
   * @param {object} message
   */
  _heartbeat(s) {
    this.socket.send(
      JSON.stringify({
        op: 1,
        d: s,
      })
    );
  }
  /**
   * @private
   * @param {object} message
   */
  _onopen() {
    if (this.events['open']) this.events['open']();
  }

  /**
   * @private
   * @param {object} message
   */
  _onmessage(message) {
    const m = JSON.parse(message.data);
    if (m.op === 10) {
      setInterval(() => this._heartbeat(this.s), m.d.heartbeat_interval);
      this.socket.send(
        JSON.stringify({
          op: 2,
          d: {
            token: this.token,
            properties: {
              os: this.settings.os.name,
              device: this.settings.device,
              os_version: this.settings.os.version,
              browser: this.settings.browser.name,
              browser_user_agent: this.settings.browser.browser_user_agent,
              browser_version: this.settings.browser.version,
              release_channel: 'stable',
            },
            presence: {
              game: this.settings.game,
              status: this.settings.status,
              afk: this.settings.afk,
            },
            compress: false,
            large_treshold: 200,
          },
        })
      );
    } else if (m.op === 0) {
      this.s = m.s;
      if (m.t === 'READY') {
        this.client = m.d;
      } else if (m.t === 'GUILD_MEMBER_LIST_UPDATE') {
        console.log(m);
      }
      if (this.events[m.t.toLowerCase()]) this.events[m.t.toLowerCase()](m.d);
    }
  }
  /**
   * @private
   * @param {object} message
   */
  _onerror(message) {
    if (message.code !== 4004) this.init();
    else if (this.events['error']) this.events['error']();
  }

  async typing(channel) {
    const res = await axios.post(
      `https://discordapp.com/api/v6/channels/${channel}/typing`
    );
    return res.data;
  }

  /**
   * Sends a message in the specified text-channel.
   * @param {string} channel
   * @param {string | object} message
   * @argument {string} [message.content]
   * @argument {string} [message.embed.title]
   * @argument {string} [message.embed.description]
   * @argument {string} [message.embed.url]
   * @argument {string} [message.embed.color]
   * @argument {string} [message.embed.timestamp]
   * @argument {string} [message.embed.footer]
   * @argument {string} [message.embed.footer.icon_url]
   * @argument {string} [message.embed.footer.text]
   * @argument {Object} [message.embed.thumbnail]
   * @argument {string} [message.embed.thumbnail.url]
   * @argument {Object} [message.embed.image]
   * @argument {string} [message.embed.image.url]
   * @argument {Object} [message.embed.author]
   * @argument {string} [message.embed.author.name]
   * @argument {string} [message.embed.author.url]
   * @argument {string} [message.embed.author.icon_url]
   * @argument {Array<object>} [message.embed.fields]
   */
  async message(channel, message) {
    let data;
    typeof message === 'object'
      ? (data = message)
      : (data = {
          content: message,
        });
    const res = await axios.post(
      `https://discordapp.com/api/v6/channels/${channel}/messages`,
      data
    );
    return res.data;
  }
  /**
   * Removes a message from the specified text-channel.
   * @param {object} message
   * @argument {string} [message.channel_id]
   * @argument {string} [message.id]
   */
  async delete(message) {
    const res = axios.delete(
      `https://discordapp.com/api/v6/channels/${message.channel_id}/messages/${message.id}`
    );
    return res.data;
  }
  /**
   * Edits a message in the specified text-channel.
   * @param {object} message
   * @argument {string} [message.channel_id]
   * @argument {string} [message.id]
   * @param {(string | object)} newData
   * @argument {string} [newData.content]
   * @argument {string} [newData.embed.title]
   * @argument {string} [newData.embed.description]
   * @argument {string} [newData.embed.url]
   * @argument {string} [newData.embed.color]
   * @argument {string} [newData.embed.timestamp]
   * @argument {string} [newData.embed.footer]
   * @argument {string} [newData.embed.footer.icon_url]
   * @argument {string} [newData.embed.footer.text]
   * @argument {Object} [newData.embed.thumbnail]
   * @argument {string} [newData.embed.thumbnail.url]
   * @argument {Object} [newData.embed.image]
   * @argument {string}[newData.embed.image.url]
   * @argument {Object} [newData.embed.author]
   * @argument {string} [newData.embed.author.name]
   * @argument {string} [newData.embed.author.url]
   * @argument {string} [newData.embed.author.icon_url]
   * @argument {Array<object>} [newData.embed.fields]
   */
  async edit(message, newData) {
    typeof newData === 'object'
      ? (data = {
          embed: newData,
        })
      : (data = {
          content: newData,
        });
    const res = await axios.patch(
      `https://discordapp.com/api/v6/channels/${channel.channel_id}/messages/${message.id}`,
      data
    );
    return res.data;
  }
  /**
   * Sets the client's current status.
   * @param {number} status
   */
  async setStatus(status) {
    const list = ['invisible', 'dnd', 'idle', 'online'];
    const res = await axios.patch(
      'https://discordapp.com/api/v6/users/@me/settings',
      { status: list[status] }
    );
    return res.data;
  }
  /**
   * Joins a specific invite.
   * @param {string} invite
   */
  async join(invite) {
    const res = await axios.post(
      `https://discordapp.com/api/v6/invite/${invite}`,
      {
        headers: {
          Authorization: this.token,
          'Alt-Used': 'discord.com',
          Referer: 'https://discord.com/channels/@me',
        },
      }
    );
    return res.data;
  }
  /**
   * Changes the client's nick within a guild.
   * @param {string} guild
   * @param {string} nick
   */
  async nick(guild, nick) {
    const res = await axios.patch(
      `https://discordapp.com/api/v6/guilds/${guild}/members/@me/nick`,
      { nick: nick }
    );
    return res.data;
  }
  /**
   * Reacts to a message inside the specified channel.
   * @param {object} message
   * @param {string} [message.id]
   * @param {string} [message.channel_id]
   * @param {string} emoji
   */
  async react(message, emoji) {
    const res = await axios.put(
      `https://discordapp.com/api/v6/channels/${message.channel_id}/messages/${
        message.id
      }/reactions/${encodeURIComponent(emoji)}/@me`
    );
    return res.data;
  }
  /**
   * Creates a DM channel with the specified user(s).
   * @param {(string | object)} user
   */
  async createDM(user) {
    let data;
    typeof user !== 'object' ? (data = [user]) : (data = user);
    const res = await axios.post(
      'https://discordapp.com/api/v6/users/@me/channels',
      { recipients: data }
    );
    return res.data;
  }
  /**
   * Sends a friend request to the specified user.
   * @param {string} user
   */
  async friend(user) {
    const data = user.split('#');
    const res = await axios.post(
      'https://discordapp.com/api/v6/users/@me/relationships',
      { username: data[0], discriminator: data[1] }
    );
    return res.data;
  }
  /**
   * Gets the last 50 messages in a channel. Starting from [before] if defined.
   * @param {string} channel_id
   * @param {string | undefined} before
   */
  async getMessages(channel_id, before) {
    let data = `https://discordapp.com/api/v6/channels/${channel_id}/messages?limit=50`;
    if (!typeof before === 'undefined') {
      data += `&before=${before}`;
    }
    const res = await axios.get(data);
    return res.data;
  }
  /**
   * Gets the members of a guild.
   * @param {string} guild_id
   */
  async getMembers(guild_id) {
    const res = await axios.get(
      `https://discordapp.com/api/v6/guilds/${guild_id}/members?limit=1000`
    );
    return res.data;
  }
  /**
   * Finds all messages sent by a user on a guild.
   * @param {string} guild_id
   * @param {string} member_id
   * @param {number} offset
   */
  async findGuildMessages(guild_id, member_id, offset) {
    var url = `https://discordapp.com/api/v6/guilds/${guild_id}/messages/search?author_id=${member_id}&include_nsfw=true`;
    if (offset) url += `&offset=${offset}`;
    const res = await axios.get(url);
    return res.data;
  }
  /**
   * Finds all messages sent by a user on a channel.
   * @param {string} channel_id
   * @param {string} member_id
   * @param {number} offset
   */
  async findChannelMessages(channel_id, user_id, offset) {
    var url = `https://discordapp.com/api/v6/channels/${channel_id}/messages/search?author_id=${user_id}`;
    if (offset) url += `&offset=${offset}`;
    const res = await axios.get(url);
    return res.data;
  }
  /**
   * Leaves a guild.
   * @param {string} id
   */
  async leave(id) {
    const res = await axios.delete(
      `https://discordapp.com/api/v6/users/@me/guilds/${id}`
    );
    return res;
  }

  /**
   * Deletes a channel.
   * @param {string} id
   */
  async deleteChannel(id) {
    const res = await axios.delete(
      `https://discordapp.com/api/v6/channels/${id}`
    );
    return res;
  }

  /**
   * Redeems a gift code.
   * @param {string} code
   */
  async redeem(code) {
    const res = await axios.post(
      `https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`,
      { channel_id: null, payment_source_id: null }
    );
    return res.data;
  }
}

export default Wrapper;
