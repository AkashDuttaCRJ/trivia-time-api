import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import categories from "./data/categories.json";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Trivia Time API",
          description: "Trivia Time API Documentation",
          version: "1.0.0",
        },
      },
      exclude: ["/"],
    })
  )
  .get("/", () => {
    return new Response("Welcome to The Trivia Time API!✨🦄");
  })
  .group("/v1", (app) => {
    return app.get(
      "/categories",
      () => {
        return new Response(JSON.stringify(categories), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
      {
        detail: {
          description:
            "Retrieve a list of trivia categories for the Trivia App.",
          summary: "Get all categories",
          responses: {
            200: {
              description: "Successful response with a list of categories.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "number",
                          description:
                            "The unique identifier for the category.",
                          example: 1,
                        },
                        image: {
                          type: "string",
                          description: "URL or path to the category image.",
                          example: "",
                        },
                        name: {
                          type: "string",
                          description: "The name of the category.",
                          example: "General Knowledge",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
            },
          },
        },
      }
    );
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
