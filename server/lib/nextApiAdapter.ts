import type { RequestHandler } from "express";
import type { NextApiRequest, NextApiResponse } from "next";

export const runExpressHandler = (
  handler: RequestHandler,
  req: NextApiRequest,
  res: NextApiResponse,
) =>
  handler(
    req as unknown as Parameters<RequestHandler>[0],
    res as unknown as Parameters<RequestHandler>[1],
    (() => undefined) as Parameters<RequestHandler>[2],
  );
