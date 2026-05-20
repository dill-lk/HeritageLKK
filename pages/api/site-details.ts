import type { NextApiRequest, NextApiResponse } from "next";
import { handleSiteDetails } from "../../server/routes/siteDetails";
import { runExpressHandler } from "../../server/lib/nextApiAdapter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return runExpressHandler(handleSiteDetails, req, res);
}
