import { Db, Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { out } from '@a2r/telemetry';

import { mongoUrlParam, mongoDbNameParam } from '../settings';

const url = process.env[mongoUrlParam]!;
const dbName = process.env[mongoDbNameParam];

let mongoClient: MongoClient | null = null;
const options: MongoClientOptions = {
  ignoreUndefined: true,
};

const getPromise = (): Promise<Db> =>
  new Promise<Db>((resolve, reject): void => {
    MongoClient.connect(url, options, (err, client): void => {
      if (err || !client) {
        reject(err);
      } else {
        out.info(`Connecting to database ${dbName}`);
        mongoClient = client;
        const db = client.db(dbName);
        client.on('close', (): void => out.warn('Db was closed'));
        client.on('timeout', (): void => out.warn('Db timed out'));
        client.on('error', (error): void =>
          out.error(`Db produced an error: ${error.stack}`),
        );
        client.on('parseError', (error): void =>
          out.error(`Db produced an error: ${error.stack}`),
        );
        client.on('reconnect', (): void => out.info('Db reconnected'));
        resolve(db);
      }
    });
  });

let clientPromise = getPromise();

export default async function getConnection(): Promise<Db> {
  try {
    const db = await clientPromise;
    return db;
  } catch (ex) {
    clientPromise = getPromise();
    return clientPromise;
  }
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
