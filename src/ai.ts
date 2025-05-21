import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

export type Role = "system" | "user" | "assistant" | string;
export interface Message {
  role: Role;
  content: string;
}

export interface ExecuteAIOptions {
  engine?: "openai" | "gemini";
  model?: string;
  prompt?: string;
  schema?: any;
  data?: any;
}

export async function executeAI(options: ExecuteAIOptions): Promise<any> {
  const engine =
    options.engine ?? !!process.env.GEMINI_API_KEY ? "gemini" : "openai";

  // 1) Load the prompt
  const rawPrompt = options.prompt;
  if (!rawPrompt) throw new Error("No prompt provided");

  // 2) Merge in optional JSON schema
  const schema = options.schema ?? {};

  // 3) Append data (if any) to the prompt
  const data = options.data;
  let prompt = rawPrompt;
  if (data !== undefined) {
    // you can tweak this formatting as you like
    prompt += "\n\n### INPUT DATA ###\n" + JSON.stringify(data, null, 2);
  }

  // 4) Build the message
  const messages: Message[] = [{ role: "user", content: prompt }];

  let model;

  try {
    let aiResponseText = '';

    if (engine === "openai") {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      model = options.model || "gpt-4o-mini-2024-07-18";
      const req: any = {
        model,
        messages,
      };
      if (schema) {
        req.response_format = zodResponseFormat(schema, "response");
      }
      const completion = await openai.beta.chat.completions.parse(req);
      aiResponseText = completion.choices[0].message.content || "";
    } else if (engine === "gemini") {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      model = options.model || "gemini-2.0-flash"
      const req: any = {
        model,
        contents: prompt,
      };
      if (schema) {
        req.config = {
          responseMimeType: "application/json",
          responseSchema: schema,
        };
      }
      const res = await ai.models.generateContent(req);
      aiResponseText = res.text || "";
    }

    // 5) Try to parse the JSON from the model
    let dataUpdated: any;
    try {
      dataUpdated = JSON.parse(aiResponseText);
    } catch {
      return {
        engine,
        model,
        data,
        prompt,
        dataUpdated: null,
        error: "Invalid JSON from AI",
        raw: aiResponseText,
      };
    }

    // 6) Success
    return {
      engine,
      model,
      data,
      prompt,
      dataUpdated,
    };
  } catch (err: any) {
    // request or other error
    return {
      engine,
      model,
      data,
      prompt,
      dataUpdated: null,
      error: err.message || String(err),
    };
  }
}
