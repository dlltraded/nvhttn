export default async function handler(req, res) {
  // Allow OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing Telegram credentials in environment variables');
    return res.status(500).json({ error: 'Missing Telegram credentials' });
  }

  try {
    const payload = req.body;
    
    // Format the message
    let sourceText = payload.source === 'webapp-tu-van' ? '📱 Ứng dụng tư vấn viên' : '🌐 Website Landing Page';
    
    let message = `🎉 <b>CÓ HÀNG MỚI NÈ MẤY SẾP ƠI!!!</b> 🥳🔥\n\n`;
    message += `👤 <b>Phụ huynh:</b> ${payload.parent_name || 'Không rõ'}\n`;
    message += `📞 <b>SĐT:</b> <code>${payload.phone || 'Không rõ'}</code>\n`;
    message += `👦 <b>Học sinh:</b> ${payload.child_name || 'Không rõ'}\n`;
    if (payload.child_age) message += `🎂 <b>Tuổi:</b> ${payload.child_age}\n`;
    if (payload.child_school) message += `🏫 <b>Trường:</b> ${payload.child_school}\n`;
    
    if (payload.package_selected) {
      message += `\n📦 <b>Gói học:</b> ${payload.package_selected}\n`;
    }
    
    if (payload.programs && Array.isArray(payload.programs)) {
      // Filter out the main program name if it's too long, just show subjects
      const subjects = payload.programs.filter(p => !p.includes('Rèn luyện Kỹ năng'));
      if (subjects.length > 0) {
        message += `🎨 <b>Môn năng khiếu:</b> ${subjects.join(', ')}\n`;
      }
    }
    
    if (payload.wants_after_1630) {
      message += `⏱️ <b>Yêu cầu thêm:</b> Cần đón sau 16:30\n`;
    }
    
    if (payload.note) {
      message += `📝 <b>Ghi chú:</b> <i>${payload.note}</i>\n`;
    }
    
    if (payload.referral_code || payload.referralCode) {
      const code = payload.referral_code || payload.referralCode;
      message += `🎁 <b>Mã giới thiệu:</b> ${code}\n`;
    }

    message += `\n📍 <b>Nguồn:</b> ${sourceText}`;

    // Call Telegram API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Telegram API error:', errorData);
      return res.status(500).json({ error: 'Failed to send telegram message', details: errorData });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
