const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const qrcode = require("qrcode-terminal");
const db = require("./db");

let sock;

async function initWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR code WhatsApp");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ WA disconnected");
      if (shouldReconnect) initWhatsapp();
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

async function sendText(phone, message) {
  if (!sock) {
    throw new Error("WhatsApp belum terkoneksi");
  }

  const jid = phone + "@s.whatsapp.net";

  try {
    await sock.sendMessage(jid, { text: message });

    await db.execute(
      `INSERT INTO whatsapp_logs (phone, message, status)
             VALUES (?, ?, 'SENT')`,
      [phone, message]
    );

    return { success: true };
  } catch (err) {
    await db.execute(
      `INSERT INTO whatsapp_logs (phone, message, status, error_message)
             VALUES (?, ?, 'FAILED', ?)`,
      [phone, message, err.message]
    );

    throw err;
  }
}

module.exports = {
  initWhatsapp,
  sendText,
};
