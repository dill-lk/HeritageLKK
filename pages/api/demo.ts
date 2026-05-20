import type { NextApiRequest, NextApiResponse } from "next";
import { handleDemo } from "../../server/routes/demo";
import { runExpressHandler } from "../../server/lib/nextApiAdapter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return runExpressHandler(handleDemo, req, res);
}
