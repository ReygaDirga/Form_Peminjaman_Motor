export default async function handler(req, res) {
  const scriptURL = process.env.GSHEET_SCRIPT_URL;

  try {
    let targetURL = scriptURL;
    if (req.method === "GET" && req.url.includes("?")) {
      targetURL += req.url.substring(req.url.indexOf("?"));
    }

    let fetchOptions = { method: req.method };

    if (req.method === "POST") {
      const contentType = req.headers["content-type"] || "";

      if (contentType.includes("application/json")) {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = JSON.stringify(req.body);
      } else {
        const params = new URLSearchParams(req.body).toString();
        fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
        fetchOptions.body = params;
      }
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
    return res.status(500).json({ result: "error", message: err.message });
  }
}
