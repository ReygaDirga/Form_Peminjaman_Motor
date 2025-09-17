export default async function handler(req, res) {
  const scriptURL = process.env.GSHEET_SCRIPT_URL;

  try {
    let targetURL = scriptURL;
    if (req.method === "GET" && req.url.includes("?")) {
      targetURL += req.url.substring(req.url.indexOf("?"));
    }

    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded",
      },
      body: req.method === "POST" ? req.body : undefined,
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (e) {
      return res.status(200).json({ raw: text });
    }

  } catch (err) {
    return res.status(500).json({ result: "error", message: err.message });
  }
}
