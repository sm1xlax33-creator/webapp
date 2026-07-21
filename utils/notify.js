const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

function escapeMarkdown(text) {
  return String(text)
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`');
}

export async function notifyOrder(order) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // إذا ما في توكين أو معرف شات → نتخطى الإشعار بدون error
  if (!chatId || !botToken || botToken.length < 10 || botToken === 'YOUR_BOT_TOKEN_HERE') {
    console.log('⚠️ Telegram غير مُهيأ — تم تخطي الإشعار');
    return;
  }

  const itemsList = order.items
    .map((i) => `• ${escapeMarkdown(i.name)} × ${i.qty} — ${i.price * i.qty} د.م`)
    .join('\n');

  const message = [
    `🛍️ *طلب جديد — MH Shop*`,
    ``,
    `👤 *العميل:* ${escapeMarkdown(order.customerName)}`,
    `📞 *الهاتف:* ${escapeMarkdown(order.phone)}`,
    `🏙️ *المدينة:* ${escapeMarkdown(order.city || '—')}`,
    `📍 *العنوان:* ${escapeMarkdown(order.address)}`,
    `📝 *ملاحظات:* ${escapeMarkdown(order.notes || '—')}`,
    ``,
    `*الطلبات:*`,
    itemsList,
    ``,
    `💰 *الإجمالي:* ${order.total} د.م`,
    `🆔 *رقم الطلب:* \`${order.id}\``,
    `📅 *التاريخ:* ${new Date(order.createdAt).toLocaleString('ar-EG')}`,
  ].join('\n');

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ فشل إرسال إشعار تيليجرام:', errText);
    } else {
      console.log(`✅ تم إرسال إشعار تيليجرام للطلب ${order.id}`);
    }
  } catch (err) {
    console.error('❌ خطأ في إرسال تيليجرام:', err.message);
  }
}
