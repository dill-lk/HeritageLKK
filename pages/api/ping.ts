import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.status(200).json({ message: ping });
}
