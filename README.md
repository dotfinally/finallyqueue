# FinallyQueue

## A containerized NodeJS-TypeScript queue system with AI processing for all messages.

- A queue system using BullMQ (which uses Redis)
- Analyze every queue message with an AI LLM (e.g. with Gemini or OpenAI)
- Log all requests including the AI output
- Custom logic for the processed message
- Database integration (MongoDB by default)
- Dockerfile and Compose files for easy deployments
- Modular and reusable framework so you can deploy multiple AI queue microservices

## Setup
- Copy the `.env.example` file to `.env` and fill in the necessary variables
- Populate either the Gemini or OpenAI API keys
- Find all and replace the word "finallyqueue" with your project name
- Update ./src/prompts/input-prompt.txt
- Update ./src/prompts/output-schema.ts

## Docker

- `npm run docker` to run the network in docker
- `npm run test` to send a test message
- view logs in the queue container or the logs collection in the db (port 27042 by default)
