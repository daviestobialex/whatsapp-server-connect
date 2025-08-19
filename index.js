const express = require("express");
const bodyParser = require("body-parser");

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

    if(msg.fromMe){
      return;
    }
    
    // console.debug(msg);
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
  
  // Retrieve contact object and formatted number
  const contact = await msg.getContact();
  const chat = await msg.getChat();

  console.log('Contact is group: ', chat.isGroup);
  console.log('Message Author Group: ', msg.author);
  console.log('Mobile Number:', contact.number);

  try {
    const payload = {
      isGroup: chat.isGroup,
      rawFrom: msg.from,
      from: contact.number,
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


const app = express();             // ✅ define express app
app.use(bodyParser.json());        // ✅ middleware for parsing JSON

// POST /send-whatsapp
app.post("/send-whatsapp", async (req, res) => {
  console.log('Outgoing Msg: ', req.body);
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message' field" });
    }

    // 'to' must be in WhatsApp ID format → "<phone>@c.us"
    const chatId = to.includes("@c.us") ? to : `${to}@c.us`;

    await client.sendMessage(chatId, message);

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending WhatsApp message:", err);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

const PORT = process.env.PORT || 223;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


module.exports = { forwardMessageToWebhook };
