import { Db, Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { out } from '@a2r/telemetry';

import { mongoUrlParam, mongoDbNameParam } from '../settings';

const url = process.env[mongoUrlParam];
const dbName = process.env[mongoDbNameParam];

let mongoClient: MongoClient | null = null;
const options: MongoClientOptions = {
  ignoreUndefined: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const clientPromise = new Promise<Db>((resolve, reject): void => {
  if (!url) {
    out.error('No Mongo URL is defined at MONGO_URL environment variable');
    return reject('No Mongo URL is defined at MONGO_URL environment variable');
  }
  out.info(`Connecting to mongo server at ${url}`);
  MongoClient.connect(url, options, (err, client): void => {
    if (err) {
      reject(err);
    } else {
      out.info(`Connecting to database ${dbName}`);
      mongoClient = client;
      const db = client.db(dbName);
      db.on('close', (): void => out.warn('Db was closed'));
      db.on('timeout', (): void => out.warn('Db timed out'));
      db.on('error', (error): void =>
        out.error(`Db produced an error: ${error.stack}`),
      );
      db.on('parseError', (error): void =>
        out.error(`Db produced an error: ${error.stack}`),
      );
      db.on('reconnect', (): void => out.info('Db reconnected'));
      resolve(db);
    }
  });
});

export default function getConnection(): Promise<Db> {
  return clientPromise;
}

export async function getCollection<T>(
  collectionName: string,
): Promise<Collection<T>> {
  const db = await getConnection();
  return db.collection<T>(collectionName);
}

export async function clean(): Promise<void> {
  if (mongoClient) {
    out.verbose(`DbPool: Cleaning mongo client`);
    await mongoClient.close();
  }
}
