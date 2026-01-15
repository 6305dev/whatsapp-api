require("dotenv").config();
const express = require("express");
const { initWhatsapp, sendText } = require("./whatsapp");
const app = express();
const normalizePhone = require("./utils/phone");
const port = process.env.PORT;
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      error: "phone and message required.",
    });
  }

  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return res.status(400).json({
      success: false,
      error: "phone number invalid.",
    });
  }

  try {
    await sendText(normalizedPhone, message);

    res.json({
      success: true,
      message: "message sent.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(port, async () => {
  console.log(`🚀 API running on port: ${port}`);
  await initWhatsapp();
});
