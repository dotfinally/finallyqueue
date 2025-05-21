import { Type } from "@google/genai";

export default {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      bookName: {
        type: Type.STRING,
      },
      bookSeries: {
        type: Type.STRING,
      },
      bookDescription: {
        type: Type.STRING,
      },
    },
    propertyOrdering: ["bookName", "bookSeries", "bookDescription"],
  },
};

/**
  // Example for OpenAI:

  import { z } from "zod";

  const Book = z.object({
    bookName: z.string(),
    bookSeries: z.string(),
    bookDescription: z.string()
  });

  export default z.object({
    books: z.array(Book),
    final_answer: z.string(),
  });
**/
