document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pinjamForm");
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzRvnJyGolsSv2vt9WZlFLYzdDfWNMD4cjUFOslJ3Uf_mUDWCpTkg16FfHRr_Dni2qU8w/exec';

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

    if (!tanggal.value) {
      showError(tanggal, "Tanggal harus diisi.");
      return;
    }

    let today = new Date(); today.setHours(0,0,0,0);
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

    let durasi = selesai - mulai;
    let maxDurasi = (kelas.value === "PPTI 21") ? 5*60 : 3*60;

    if (durasi > maxDurasi) {
      showError(jamSelesai, `Kelas ${kelas.value} hanya boleh maksimal ${maxDurasi/60} jam.`);
      return;
    }

    const formData = new FormData(form);
    modal.style.display = "block";
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
}
