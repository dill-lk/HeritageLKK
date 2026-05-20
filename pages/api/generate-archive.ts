import type { NextApiRequest, NextApiResponse } from "next";
import { handleGenerateArchive } from "../../server/routes/generateArchive";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleGenerateArchive(req as any, res as any, () => undefined);
}
