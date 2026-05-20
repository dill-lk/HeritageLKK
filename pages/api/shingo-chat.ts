import type { NextApiRequest, NextApiResponse } from "next";
import { handleShingoChat } from "../../server/routes/shingoChat";
import { runExpressHandler } from "../../server/lib/nextApiAdapter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return runExpressHandler(handleShingoChat, req, res);
}
