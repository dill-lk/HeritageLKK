import type { NextApiRequest, NextApiResponse } from "next";
import { handleShingoChat } from "../../server/routes/shingoChat";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleShingoChat(req as any, res as any, undefined as any);
}
