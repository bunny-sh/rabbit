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
}

export default Wrapper;
