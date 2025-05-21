/**
 * File: logger.ts
 * Description: Logs job data (raw input, prompt used, AI processed data) into MongoDB.
 */

import { MongoClient, Db, Collection, Document } from 'mongodb'
import { config } from 'dotenv'

config()

// ------------------------
// Config Variables
// ------------------------
const MONGO_HOST = process.env.MONGODB_HOST || 'localhost'
const MONGO_PORT = process.env.MONGODB_PORT || '27017'
const MONGO_DATABASE = process.env.MONGODB_DATABASE || 'finallyqueue'
const MONGO_USERNAME = process.env.MONGODB_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGODB_PASSWORD || ''
const LOG_COLLECTION = process.env.LOG_COLLECTION || 'logs'
const MONGO_CONNECTION_TYPE = process.env.MONGODB_CONNECTION_TYPE || 'mongodb'

// Build connection string
let mongoUri = ''
if (MONGO_USERNAME && MONGO_PASSWORD) {
  mongoUri = `${MONGO_CONNECTION_TYPE}://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`
} else {
  mongoUri = `${MONGO_CONNECTION_TYPE}://${MONGO_HOST}:${MONGO_PORT}`
}

let client: MongoClient
let db: Db
let collection: Collection<Document>

// Connect to MongoDB at module load time
(async () => {
  try {
    client = new MongoClient(mongoUri)
    await client.connect()
    db = client.db(MONGO_DATABASE)
    collection = db.collection(LOG_COLLECTION)
    console.log(`Connected to MongoDB at ${mongoUri}, database: ${MONGO_DATABASE}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
})()

export interface LogEntry {
  id: string;
  rawInput: string
  promptUsed: string
  aiTransformed?: string
  timestamp?: Date
  error?: string;
}

/**
 * Logs a job's data into MongoDB.
 * @param entry The log data including rawInput, promptUsed, and aiTransformed.
 */
export async function logJobData(entry: LogEntry): Promise<void> {
  if (!collection) {
    console.error('MongoDB collection not initialized.')
    return
  }
  const doc = { ...entry, timestamp: new Date() }
  try {
    await collection.insertOne(doc)
    console.log('Logged job data successfully.')
  } catch (error) {
    console.error('Error inserting log into MongoDB:', error)
    throw error
  }
}
