import type { RequestHandler } from "express";
import type { NextApiRequest, NextApiResponse } from "next";

export const runExpressHandler = (
  handler: RequestHandler,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req == null || res == null) {
    throw new Error("Next API request or response object is null or undefined");
  }

  if (typeof res.status !== "function" || typeof res.json !== "function") {
    throw new Error("Next API response is missing required methods: status() and/or json()");
  }

  const expressReq = req as unknown as Parameters<RequestHandler>[0];
  const expressRes = res as unknown as Parameters<RequestHandler>[1];

  const next: Parameters<RequestHandler>[2] = (err?: unknown) => {
    if (!err) {
      return;
    }

    if (err instanceof Error) {
      console.error("Express handler forwarded error", err);
    } else {
      console.error("Express handler forwarded a non-Error object", err);
    }

    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal server error";
      res.status(500).json({ error: message });
    }
  };

  return handler(expressReq, expressRes, next);
};
