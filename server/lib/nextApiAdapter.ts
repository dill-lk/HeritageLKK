import type { RequestHandler } from "express";
import type { NextApiRequest, NextApiResponse } from "next";

export const runExpressHandler = (
  handler: RequestHandler,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const expressReq = req as unknown as Parameters<RequestHandler>[0];
  const expressRes = res as unknown as Parameters<RequestHandler>[1];

  const next: Parameters<RequestHandler>[2] = (err?: unknown) => {
    if (!err) {
      return;
    }

    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal server error";
      res.status(500).json({ error: message });
    }
  };

  return handler(expressReq, expressRes, next);
};
