import { put } from "@vercel/blob";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(request, response) {
  if (request.method !== "PUT") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const filename = request.query.filename;
  if (!filename) {
    return response.status(400).json({ error: "filename query param required" });
  }

  const blob = await put(filename, request, {
    access: "public",
  });

  return response.status(200).json(blob);
}
