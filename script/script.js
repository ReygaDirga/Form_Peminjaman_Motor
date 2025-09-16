document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pinjamForm");
  const scriptURL = 'https://script.google.com/macros/s/AKfycbyAvxvG_6nNWmKMK5YMcO-trh8Km8dB_aOeK_qs_fuyqmiIA9G4N9ygm1WBlzl-j9Vw1A/exec';

  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");

  function showError(input, message) {
    let errorEl = input.parentElement.querySelector(".error-msg");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "error-msg";
      input.parentElement.appendChild(errorEl);
    }
    errorEl.innerText = message;
    errorEl.style.display = "block";
  }

  function clearErrors() {
    document.querySelectorAll(".error-msg").forEach(e => e.style.display = "none");
  }

  function toMinutes(jam) {
    let [h, m] = jam.split(":").map(Number);
    return h * 60 + m;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearErrors();

    let nama = form.querySelector('input[name="nama"]');
    let tanggal = form.querySelector('input[name="tanggal"]');
    let jamMulai = form.querySelector('input[name="jam_mulai"]');
    let jamSelesai = form.querySelector('input[name="jam_selesai"]');
    let kelas = form.querySelector('select[name="kelas"]');

    let namaValue = nama.value.trim();
    let regexNama = /^[a-zA-Z0-9\s]+$/;
    if (!regexNama.test(namaValue)) {
      showError(nama, "Nama hanya boleh huruf, angka, dan spasi (tanpa simbol).");
      return;
    }

    if (!tanggal.value) {
      showError(tanggal, "Tanggal harus diisi.");
      return;
    }

    let today = new Date(); 
    today.setHours(0,0,0,0);
    let parts = tanggal.value.split("-");
    let pinjamDate = new Date(parts[0], parts[1]-1, parts[2]);

    if (pinjamDate < today) {
      showError(tanggal, "Tanggal tidak boleh di masa lalu.");
      return;
    }

    if (!jamMulai.value || !jamSelesai.value) {
      showError(jamMulai, "Jam mulai dan jam selesai harus diisi.");
      return;
    }

    let mulai = toMinutes(jamMulai.value);
    let selesai = toMinutes(jamSelesai.value);

    if (selesai <= mulai) {
      showError(jamSelesai, "Jam selesai harus setelah jam mulai.");
      return;
    }

    let durasi = selesai - mulai;
    let maxDurasi = (kelas.value === "PPTI 21") ? 5*60 : 3*60;

    if (durasi > maxDurasi) {
      showError(jamSelesai, `Kelas ${kelas.value} hanya boleh maksimal ${maxDurasi/60} jam.`);
      return;
    }

    // 🔥 Cek bentrok via doGet
    const apiUrl = scriptURL + "?date=" + tanggal.value;  
    try {
      let res = await fetch(apiUrl);
      let data = await res.json();

      let bentrok = data.rows.some(row => {
        let mulaiAda = toMinutes(row.jam_mulai);
        let selesaiAda = toMinutes(row.jam_selesai);
        return (mulai < selesaiAda) && (selesai > mulaiAda);
      });

      if (bentrok) {
        errorModal.style.display = "block";
        document.body.style.overflow = "hidden";
        return;
      }
    } catch (err) {
      alert("Gagal cek jadwal: " + err.message);
      return;
    }

    // ✅ Kalau aman, baru kirim
    const formData = new FormData(form);
    successModal.style.display = "block";
    document.body.style.overflow = "hidden";

    fetch(scriptURL, { method: 'POST', body: formData })
      .catch(error => {
        alert("Error: " + error.message);
      });

    form.reset();
  });
});

function closeModal() {
  document.getElementById("successModal").style.display = "none";
  document.body.style.overflow = "auto";
  window.location.href = "index.html";
}

function closeErrorModal() {
  document.getElementById("errorModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function ceks() {
  document.getElementById("errorModal").style.display = "none";
  document.body.style.overflow = "auto";
  window.location.href = "index.html";
}
