import { config } from "dotenv";
import { executeAI } from "./ai.js";
import { logJobData } from "./logger.js";
import { promises as fs } from "fs";
import { Queue, Worker, Job } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import schema from './prompts/output-schema.js';

config();

const QUEUE_NAME = "finallyqueue";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const PARALLEL_PROCESSING_LIMIT = parseInt(
  process.env.PARALLEL_PROCESSING_LIMIT || "1"
);

// Create a BullMQ Queue instance for adding jobs
export const queue = new Queue(QUEUE_NAME, {
  connection: { host: REDIS_HOST, port: REDIS_PORT },
});

async function processJob(job: Job) {
  console.log(`Processing job ${job.id} with data`);

  const id = job.id || uuidv4();
  const prompt = await fs.readFile(path.resolve("../prompts/input-prompt.txt"), "utf-8")

  const aiResult = await executeAI({
    prompt,
    schema,
    data: job.data.message,
  });

  // Log the result in the database
  // And do anything else you want with that data here

  console.log('aiResult', aiResult);

  await logJobData({
    id,
    ...(aiResult || {}),
  });
}

const worker = new Worker(QUEUE_NAME, processJob, {
  concurrency: PARALLEL_PROCESSING_LIMIT,
  connection: { host: REDIS_HOST, port: REDIS_PORT },
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id}, error: ${err}`);
});

console.log("Consumer worker started…");
