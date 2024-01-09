import WebSocket from 'ws';
import axios from 'axios';
import express from 'express';
import { MongoClient } from 'mongodb';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { db_insert } from './database';
import { insert_user } from './functions';
const uri = process.env.DB_URL;
const app = express();

const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});

const jsonParser = bodyParser.json();

const wss = new WebSocket.Server({
  port: 7071,
});

require('events').EventEmitter.defaultMaxListeners = 15;

app.use(
  express.json({
    limit: '100mb',
  })
);

const server = app.listen(8082, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('express server started at: http://%s:%s', host, port);
});

const clients = new Map();

wss.on('connection', (ws, request, client) => {
  clients.set(ws);

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (typeof message === 'object') {
      db_insert('messages', message);

      const user = message.user_info;

      if (user) {
        insert_user(user);
      }
    }
  });
});
