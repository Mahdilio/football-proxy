export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // فقط برای وبهوک تلگرام
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const update = await request.json();

        // پیام کاربر
        const chatId = update.message?.chat?.id;
        const text = update.message?.text || "";

        // پاسخ ساده
        let reply = "سلام 👋\n";
        if (text === "/start") {
          reply += "به ربات خوش اومدی! 🎉";
        } else {
          reply += `شما نوشتی: ${text}`;
        }

        // ارسال پاسخ به تلگرام
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

    return new Response("Worker is running ✅");
  },
};
