import type { NextApiRequest, NextApiResponse } from "next";

const endpoint = process.env["PUBLIC_API_ENDPOINT"] as string;

export default async function proxy(req: NextApiRequest, res: NextApiResponse) {
  const proxy = (() => {
    const path = (req.query.proxy ?? []).slice(1);
    const asArray = Array.isArray(path) ? path : [path];
    return asArray.join("/");
  })();

  try {
    const response = await fetch(`${endpoint}/api/v1/${proxy}`, {
      method: req.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...(req.body ? { body: JSON.stringify(req.body) } : {}),
    });

    res.status(response.status).json(await response.json());
  } catch (error: any) {
    // Sends error to the client side
    console.error(error);
    res.status(500).send(error.message || "Internal Server Error.");
  }
}
