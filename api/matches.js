import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://www.tarafdari.com/fixtures", {
      headers: { "user-agent": "Mozilla/5.0" }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const games = [];

    $(".fixture-item, article.fixture, .match, .fixture").each((i, el) => {
      const time =
        $(el).find(".fixture-time, time, .time").first().text().trim() ||
        ($(el).text().match(/\d{1,2}[:٫.]\d{2}/)?.[0] ?? "");

      const teams = $(el)
        .find(".team-name, .home, .away, .team")
        .map((_, e) => $(e).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean);

      let home = teams[0];
      let away = teams[1];

      if (home && away && time) {
        games.push({ home, away, time: time.replace("٫", ":").replace(".", ":") });
      }
    });

    if (!games.length) {
      const lines = html.split("\n").filter(l => /(vs|VS|🆚)/.test(l) && /\d{1,2}[:٫.]\d{2}/.test(l));
      for (const l of lines) {
        const t = (l.match(/\d{1,2}[:٫.]\d{2}/) || [""])[0].replace("٫", ":");
        const parts = l.replace(/<[^>]+>/g, " ").split(/vs|VS|🆚/);
        if (parts.length === 2) {
          games.push({ home: parts[0].trim(), away: parts[1].trim(), time: t });
        }
      }
    }

    const seen = new Set();
    const matches = games.filter(m => {
      const key = `${m.home}|${m.away}|${m.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.status(200).json({ matches });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
