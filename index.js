require("dotenv").config();

const express = require("express");
const { initWhatsapp, sendText } = require("./whatsapp");
const app = express();
const PORT = process.env.PORT;
const normalizePhone = require("./utils/phone");

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "WhatsApp API",
  });
});

app.post("/send", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: "phone dan message wajib diisi",
    });
  }

  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return res.status(400).json({
      success: false,
      error: "phone tidak valid",
    });
  }

  try {
    await sendText(normalizedPhone, message);

    res.json({
      success: true,
      message: "Pesan berhasil dikirim",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  await initWhatsapp();
});
