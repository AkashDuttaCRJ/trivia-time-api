import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";

import categories from "./data/categories.json";
import trivia from "./data/trivia.json";

const BASE_URL = "https://trivia-time-api.onrender.com";

const sendError = (error: string, status: number = 500, code: string) => {
  return new Response(
    JSON.stringify({
      error_type: code,
      error,
      docs: `${BASE_URL}/docs`,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Trivia Time API",
          description: `Trivia Time API Documentation. Built with Bun, Elysia and ❤️\n\n[View on GitHub](
              https://github.com/AkashDuttaCRJ/trivia-time-api)\n\nBuilt by [Akash Dutta](https://github.com/AkashDuttaCRJ)\n\n**Base URL:** [${BASE_URL}](${BASE_URL})`,
          version: "1.0.0",
        },
      },
      exclude: ["/", "/docs", "/docs/json"],
      path: "/docs",
    })
  )
  .onError(({ code, error }) => {
    const statusCodes = {
      UNKNOWN: 500,
      NOT_FOUND: 404,
      PARSE: 400,
      VALIDATION: 400,
      INTERNAL_SERVER_ERROR: 500,
    };

    return sendError(error.message, statusCodes[code], code);
  })
  .get("/", () => {
    return new Response("Welcome to The Trivia Time API!✨🦄");
  })
  .group("/v1", (app) => {
    return app
      .get(
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
      )
      .get(
        "/trivia",
        ({ query, set }) => {
          const { category, difficulty = "any", limit = 10 } = query;
          console.log({ category, difficulty, limit });

          if (!categories.find((c) => c.id === Number(category))) {
            return sendError(
              "Invalid value for parameter 'category'.",
              404,
              "NOT_FOUND"
            );
          }

          if (Number(limit) < 1 || Number(limit) > 50) {
            return sendError(
              "Invalid value for parameter 'limit'. Must be between 1 and 50.",
              400,
              "VALIDATION"
            );
          }

          // filter trivia by category and difficulty (skip if difficulty is any)
          const filteredTrivia = trivia.filter((t) => {
            return (
              t.category === Number(category) &&
              (difficulty === "any" || t.difficulty === difficulty)
            );
          });

          // shuffle trivia
          const shuffledTrivia = filteredTrivia.sort(() => Math.random() - 0.5);

          // filter trivia by limit
          const limitedTrivia = shuffledTrivia.slice(0, Number(limit));

          return new Response(JSON.stringify(limitedTrivia), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        },
        {
          query: t.Object({
            category: t.String({
              description: "The category ID.",
              example: 9,
              error: "Missing or Invalid required parameter 'category'.",
              default: 0,
              pattern: "^[0-9]+$",
            }),
            difficulty: t.Optional(
              t.Enum(
                {
                  easy: "easy",
                  medium: "medium",
                  hard: "hard",
                  any: "any",
                },
                {
                  description:
                    "The difficulty of the trivia. Must be one of 'easy', 'medium', 'hard', or 'any'. Defaults to 'any'.",
                  example: "easy",
                  error: "Invalid value for parameter 'difficulty'.",
                }
              )
            ),
            limit: t.Optional(
              t.String({
                description:
                  "The number of trivia to return. Must be between 1 and 50. Defaults to 10.",
                example: 10,
                error: "Invalid value for parameter 'limit'.",
                pattern: "^[0-9]+$",
                default: 10,
              })
            ),
          }),
          detail: {
            description:
              "Retrieve a list of trivia questions along with answers for the Trivia App.",
            summary: "Get trivia questions along with answers",
            responses: {
              200: {
                description:
                  "Successful response with a list of trivia questions.",
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
                              "The unique identifier for the trivia.",
                            example: 1,
                          },
                          question: {
                            type: "string",
                            description: "The trivia question.",
                            example: "What is the capital of the USA?",
                          },
                          options: {
                            type: "array",
                            description: "The trivia options.",
                            example: [
                              { id: 1, text: "New York" },
                              { id: 2, text: "Washington D.C." },
                              { id: 3, text: "Los Angeles" },
                              { id: 4, text: "Chicago" },
                            ],
                            items: {
                              type: "object",
                              description: "The trivia option.",
                              example: { id: 1, text: "New York" },
                              properties: {
                                id: {
                                  type: "number",
                                  description:
                                    "The unique identifier for the trivia option.",
                                  example: 1,
                                },
                                text: {
                                  type: "string",
                                  description: "The trivia option text.",
                                  example: "New York",
                                },
                              },
                            },
                          },
                          answer: {
                            type: "number",
                            description:
                              "The unique identifier of the trivia answer.",
                            example: 2,
                          },
                          category: {
                            type: "number",
                            description:
                              "The unique identifier for the category.",
                            example: 1,
                          },
                          difficulty: {
                            type: "string",
                            description: "The difficulty of the trivia.",
                            example: "easy",
                          },
                        },
                      },
                    },
                  },
                },
              },
              400: {
                description: "Bad request.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error_type: {
                          type: "string",
                          description: "The error type.",
                          example: "VALIDATION",
                        },
                        error: {
                          type: "string",
                          description: "The error message.",
                          example:
                            "Invalid value for parameter 'limit'. Must be between 1 and 50.",
                        },
                        docs: {
                          type: "string",
                          description: "The documentation URL.",
                          example: `${BASE_URL}/docs`,
                        },
                      },
                    },
                  },
                },
              },
              404: {
                description: "Not found.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error_type: {
                          type: "string",
                          description: "The error type.",
                          example: "NOT_FOUND",
                        },
                        error: {
                          type: "string",
                          description: "The error message.",
                          example: "Invalid value for parameter 'category'.",
                        },
                        docs: {
                          type: "string",
                          description: "The documentation URL.",
                          example: `${BASE_URL}/docs`,
                        },
                      },
                    },
                  },
                },
              },
              500: {
                description: "Internal server error.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error_type: {
                          type: "string",
                          description: "The error type.",
                          example: "INTERNAL_SERVER_ERROR",
                        },
                        error: {
                          type: "string",
                          description: "The error message.",
                          example: "Internal server error.",
                        },
                        docs: {
                          type: "string",
                          description: "The documentation URL.",
                          example: `${BASE_URL}/docs`,
                        },
                      },
                    },
                  },
                },
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
