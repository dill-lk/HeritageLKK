import type { NextApiRequest, NextApiResponse } from "next";
import { handleDemo } from "../../server/routes/demo";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleDemo(req as any, res as any, () => undefined);
}
