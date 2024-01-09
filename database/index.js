import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.DB_URL;
const client = new MongoClient(uri);

const connect = client.connect();

const dbo = client.db('discord');

export function db_insert(collection, data) {
  connect.then(() => {
    dbo.collection(collection).insertOne(data, (err, res) => {
      if (err) throw err;
    });
  });
}

export async function db_findone(collection, data) {
  let result;
  await connect.then(async () => {
    result = await dbo.collection(collection).findOne(data);
  });
  if (result === undefined) {
    result = false;
  }
  if (result === null) {
    result = false;
  }
  return result;
}
