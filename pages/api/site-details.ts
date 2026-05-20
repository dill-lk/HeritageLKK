import type { NextApiRequest, NextApiResponse } from "next";
import { handleSiteDetails } from "../../server/routes/siteDetails";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleSiteDetails(req as any, res as any, () => undefined);
}
