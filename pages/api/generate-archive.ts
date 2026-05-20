import type { NextApiRequest, NextApiResponse } from "next";
import { handleGenerateArchive } from "../../server/routes/generateArchive";
import { runExpressHandler } from "../../server/lib/nextApiAdapter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return runExpressHandler(handleGenerateArchive, req, res);
}
