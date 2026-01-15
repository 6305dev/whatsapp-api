function normalizePhone(phone) {
  if (!phone) return null;

  // hapus spasi, strip, dll
  phone = phone
    .toString()
    .trim()
    .replace(/[^0-9+]/g, "");

  // +628xxxx → 628xxxx
  if (phone.startsWith("+")) {
    phone = phone.substring(1);
  }

  // 08xxxx → 628xxxx
  if (phone.startsWith("08")) {
    phone = "62" + phone.substring(1);
  }

  // 8xxxx (user lupa 0) → 628xxxx
  if (phone.startsWith("8")) {
    phone = "62" + phone;
  }

  // validasi dasar Indonesia
  if (!phone.startsWith("62")) {
    return null;
  }

  if (phone.length < 10 || phone.length > 15) {
    return null;
  }

  return phone;
}

module.exports = normalizePhone;
