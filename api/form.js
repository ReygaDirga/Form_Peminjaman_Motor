export const config = {
  api: {
    bodyParser: false, // jangan auto-parse body
  },
};

export default async function handler(req, res) {
  const scriptURL = process.env.GSHEET_SCRIPT_URL;

  try {
    let targetURL = scriptURL;
    if (req.method === "GET" && req.url.includes("?")) {
      targetURL += req.url.substring(req.url.indexOf("?"));
    }

    let fetchOptions = { method: req.method };

    if (req.method === "POST") {
      // ambil body mentah dari request
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();

      fetchOptions.headers = {
        "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded",
      };
      fetchOptions.body = rawBody;
    }

    const response = await fetch(targetURL, fetchOptions);
    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(200).json({ raw: text });
    }

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ result: "error", message: err.message });
  }
}
