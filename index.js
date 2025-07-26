const { Client } = require('whatsapp-web.js');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
require('dotenv').config();


// Externalize the URL
const WEBHOOK_URL = process.env.WEBHOOK_URL;// http://socialbot:222/chatbot/whatsapp/message

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.debug('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true }); // Pretty QR code in terminal
});

client.on('ready', () => {
    console.log('✅ Client is ready!');
});

client.on('message', async (msg) => {
   
    // Example command
    if (msg.body === '!ping') {
        msg.reply('pong');
    }else{
      try {
        const response = await forwardMessageToWebhook(msg); // ✅ Await the response
        msg.reply(response);
    } catch (error) {
        console.error('Failed to forward message:', error.message);
    }
    }   
});

/**
 * Forwards a WhatsApp message to a webhook
 * @param {object} msg - The WhatsApp message object
 * @returns {Promise<object>} - Axios response data
 */
async function forwardMessageToWebhook(msg) {
  try {
    const payload = {
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp,
      id: msg.id._serialized,
    };

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[Webhook Response]', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('[Webhook Error]', error.response?.status, error.message);
    throw error;
  }
}

client.initialize();


module.exports = { forwardMessageToWebhook };
