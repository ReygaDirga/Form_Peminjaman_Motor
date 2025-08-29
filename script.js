document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pinjamForm");
  const scriptURL = 'https://script.google.com/macros/s/AKfycbwJtBZ0WBwNi409TQWBboeEWq5rpjf03bNDrD28nOM6dEBwTr5UKN1AaeIMMmepQhmR/exec';

  const loader = document.getElementById("loader");
  const modal = document.getElementById("successModal");

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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    let tanggal = form.querySelector('input[name="tanggal"]');
    let jamMulai = form.querySelector('input[name="jam_mulai"]');
    let jamSelesai = form.querySelector('input[name="jam_selesai"]');
    let kelas = form.querySelector('select[name="kelas"]');

    // --- Validasi tanggal kosong
    if (!tanggal.value) {
      showError(tanggal, "Tanggal harus diisi.");
      return;
    }

    // --- Validasi tanggal tidak di masa lalu
    let today = new Date(); today.setHours(0,0,0,0);
    let parts = tanggal.value.split("-");
    let pinjamDate = new Date(parts[0], parts[1]-1, parts[2]);

    if (pinjamDate < today) {
      showError(tanggal, "Tanggal tidak boleh di masa lalu.");
      return;
    }

    // --- Validasi jam kosong
    if (!jamMulai.value || !jamSelesai.value) {
      showError(jamMulai, "Jam mulai dan jam selesai harus diisi.");
      return;
    }

    // --- Validasi jam berurutan
    function toMinutes(jam) {
      let [h, m] = jam.split(":").map(Number);
      return h * 60 + m;
    }
    let mulai = toMinutes(jamMulai.value);
    let selesai = toMinutes(jamSelesai.value);

    if (selesai <= mulai) {
      showError(jamSelesai, "Jam selesai harus setelah jam mulai.");
      return;
    }

    // --- Validasi sesuai aturan kelas
    let durasi = selesai - mulai;
    let maxDurasi = (kelas.value === "PPTI 21") ? 5*60 : 3*60;

    if (durasi > maxDurasi) {
      showError(jamSelesai, `Kelas ${kelas.value} hanya boleh maksimal ${maxDurasi/60} jam.`);
      return;
    }

    // ✅ Semua valid → submit
    loader.style.display = "block"; // tampilkan loader

    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
      .then(() => {
        loader.style.display = "none";
        modal.style.display = "block"; // tampilkan modal sukses
        form.reset();
      })
      .catch(error => {
        loader.style.display = "none";
        alert("Error: " + error.message);
      });
  });
});

function closeModal() {
  document.getElementById("successModal").style.display = "none";
}
