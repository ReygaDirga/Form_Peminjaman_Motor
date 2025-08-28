document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pinjamForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let tanggal = form.querySelector('input[name="tanggal"]').value;
    let jamMulai = form.querySelector('input[name="jam_mulai"]').value;
    let jamSelesai = form.querySelector('input[name="jam_selesai"]').value;

    // --- 1. Validasi Tanggal kosong
    if (!tanggal) {
      alert("Tanggal harus diisi.");
      return;
    }

    // --- 2. Validasi Tanggal tidak di masa lalu
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let parts = tanggal.split("-"); // YYYY-MM-DD
    let pinjamDate = new Date(parts[0], parts[1] - 1, parts[2]);

    if (pinjamDate < today) {
      alert("Tanggal tidak boleh di masa lalu.");
      return;
    }

    // --- 3. Validasi Jam kosong
    if (!jamMulai || !jamSelesai) {
      alert("Jam mulai dan jam selesai harus diisi.");
      return;
    }

    // --- 4. Validasi Jam berurutan
    function toMinutes(jam) {
      let [h, m] = jam.split(":").map(Number);
      return h * 60 + m;
    }

    if (toMinutes(jamSelesai) <= toMinutes(jamMulai)) {
      alert("Jam selesai harus setelah jam mulai.");
      return;
    }

    // ✅ Kalau semua valid
    alert("Form berhasil dikirim 🚀");
    form.reset();
  });
});
