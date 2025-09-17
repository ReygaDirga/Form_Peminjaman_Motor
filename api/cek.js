export default async function handler(req, res) {
  const { date } = req.query;
  const apiUrl = process.env.GSHEET_SCRIPT_URL + '?date=' + encodeURIComponent(date);

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal fetch data', detail: err.message });
  }
}
