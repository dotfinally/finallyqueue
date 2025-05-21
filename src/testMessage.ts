import { config } from "dotenv";
import { Queue } from "bullmq";

config();

const QUEUE_NAME = "finallyqueue";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

// Create a BullMQ queue instance
const queue = new Queue(QUEUE_NAME, {
  connection: { host: REDIS_HOST, port: REDIS_PORT },
});

async function addJob(message: string) {
  try {
    // Add a new job to the queue. You can extend this payload as needed.
    const job = await queue.add("process", { message });
    console.log(`Job added with ID: ${job.id}`);
  } catch (error) {
    console.error("Error adding job to queue:", error);
  } finally {
    // Properly close the queue connection after adding the job
    await queue.close();
  }
}

// Example: Add a job when the script is executed
(async () => {
  const sampleMessage = JSON.stringify({
    age: 20,
    genres: ["fantasy", "sci-fi", "tech"],
    personality: "introvert",
    hobbies: ["video games", "movies", "programming"],
  });
  await addJob(sampleMessage);
})();
