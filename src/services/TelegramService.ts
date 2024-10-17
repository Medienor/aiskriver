const TELEGRAM_BOT_TOKEN = '7338775518:AAGp6QRL4zMAg9UWX7OYMZGWEwDYk5Z-Pv4';
const TELEGRAM_CHAT_ID = '1540061272'; // Updated with your provided chat ID

export async function sendTelegramMessage(message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Message sent successfully:', data);
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}