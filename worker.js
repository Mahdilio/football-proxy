export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // مسیر وبهوک تلگرام
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const update = await request.json();
        const chatId = update.message?.chat?.id;
        const text = update.message?.text || "";

        let reply = "";

        if (text === "/start") {
          reply = "👋 سلام! من برنامه بازی‌های امروز رو برات می‌فرستم.\nدستور /today رو بزن.";
        } else if (text === "/today") {
          reply = await getTodayMatches();
        } else {
          reply = "دستور ناشناس ⚠️\nبرای دریافت برنامه امروز دستور /today رو بزن.";
        }

        // ارسال پاسخ
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
          }),
        });

        return new Response("OK");
      } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
      }
    }

    return new Response("Worker running ✅");
  },
};

// --- تابع گرفتن برنامه بازی‌ها ---
async function getTodayMatches() {
  try {
    const res = await fetch("https://www.tarafdari.com/برنامه-بازی‌ها");
    const html = await res.text();

    // پیدا کردن خطوط مربوط به مسابقات
    const matches = [...html.matchAll(/class="match.+?">(.*?)<\/div>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);

    if (matches.length === 0) {
      return "📅 فعلاً برنامه‌ای پیدا نشد!";
    }

    return "📅 برنامه بازی‌های امروز:\n\n" + matches.join("\n");
  } catch (e) {
    return "⚠️ خطا در دریافت اطلاعات";
  }
}
