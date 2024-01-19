import 'dotenv/config';
import Wrapper from './client.js';
import WebSocket from 'ws';
import fs from 'fs';
import { settings } from './config/config.json' assert { type: 'json' };
import { format_message } from './utils/format.js';
import { nitrocheck } from './functions/index.js';
const { token } = process.env;
const self = new Wrapper(token, settings);

self.on('ready', () => {
  fs.readFileSync('./ascii.txt')
    .toString()
    .split('\n')
    .forEach((line) => {
      console.log(line);
    });
  console.log('MADE BY GIOVANNI');
  console.log(
    `Logged in as ${self.client.user.username}#${self.client.user.discriminator}`
  );

  console.info('scraping started');
});

// const ws = new WebSocket(process.env.ws);
const ws = new WebSocket(process.env.ws);
self.on('message_create', (m) => {
  nitrocheck(self, m);
  if (m.webhook_id) return;
  const message = format_message(m);
  if (message.message === 'invalid') {
    return;
  }

  if (message && message.user_info) {
    ws.send(JSON.stringify(message));
  }
});

console.log('booting up...');
