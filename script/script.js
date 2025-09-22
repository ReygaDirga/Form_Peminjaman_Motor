document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pinjamForm");
  const scriptURL = "https://script.google.com/macros/s/AKfycbyAvxvG_6nNWmKMK5YMcO-trh8Km8dB_aOeK_qs_fuyqmiIA9G4N9ygm1WBlzl-j9Vw1A/exec";

  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");
  const submitBtn = form.querySelector('button[type="submit"]');

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
    let [h = 0, m = 0] = jam.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function setBtnLoading(loading, text = "Submitting...") {
    if (loading) {
      submitBtn.dataset.orig = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="spinner"></span>${text}`;
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    } else {
      if (submitBtn.dataset.orig) {
        submitBtn.innerHTML = submitBtn.dataset.orig;
        delete submitBtn.dataset.orig;
      }
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearErrors();
    
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    let nama = form.querySelector('input[name="nama"]');
    let tanggal = form.querySelector('input[name="tanggal"]');
    let jamMulai = form.querySelector('input[name="jam_mulai"]');
    let jamSelesai = form.querySelector('input[name="jam_selesai"]');
    let kelas = form.querySelector('select[name="kelas"]');

    let namaValue = nama.value.trim();
    let regexNama = /^[a-zA-Z0-9\s]+$/;
    if (!regexNama.test(namaValue)) {
      showError(nama, "Nama hanya boleh huruf, angka, dan spasi (tanpa simbol).");
      setBtnLoading(false);
      return;
    }

    if (!tanggal.value) {
      showError(tanggal, "Tanggal harus diisi.");
      setBtnLoading(false);
      return;
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let parts = tanggal.value.split("-");
    let pinjamDate = new Date(parts[0], parts[1] - 1, parts[2]);

    let d = pinjamDate.getDate();
    if (d === 26 || d === 27 || d === 28) {
      showError(tanggal, "Tanggal " + d + " Motor tidak tersedia untuk dipinjam.");
      setBtnLoading(false);
      return;
    }

    if (pinjamDate < today) {
      showError(tanggal, "Tanggal tidak boleh di masa lalu.");
      setBtnLoading(false);
      return;
    }

    if (!jamMulai.value || !jamSelesai.value) {
      showError(jamMulai, "Jam mulai dan jam selesai harus diisi.");
      setBtnLoading(false);
      return;
    }

    let mulai = toMinutes(jamMulai.value);
    let selesai = toMinutes(jamSelesai.value);
    if (selesai <= mulai) {
      showError(jamSelesai, "Jam selesai harus setelah jam mulai.");
      setBtnLoading(false);
      return;
    }

    let durasi = selesai - mulai;
    let maxDurasi = (kelas.value === "PPTI 21") ? 5 * 60 : 3 * 60;
    if (durasi > maxDurasi) {
      showError(jamSelesai, `Kelas ${kelas.value} hanya boleh maksimal ${maxDurasi / 60} jam.`);
      setBtnLoading(false);
      return;
    }

    try {
      const res = await fetch(`${scriptURL}?date=${tanggal.value}`);
      const data = await res.json();
      let bentrok = false;

      if (data.rows && Array.isArray(data.rows)) {
        bentrok = data.rows.some(row => {
          let mulaiAda = toMinutes(row.jam_mulai);
          let selesaiAda = toMinutes(row.jam_selesai);

          return (mulai < selesaiAda) && (selesai > mulaiAda);
        });
      }

      if (bentrok) {
        setBtnLoading(false);
        errorModal.style.display = "block";
        document.body.style.overflow = "hidden";
        return;
      }
    } catch (err) {
      console.error("Cek bentrok gagal:", err);
    }

    const formData = new FormData(form);
    setBtnLoading(true);

    try {
      const postRes = await fetch(scriptURL, { method: "POST", body: formData });
      const postJson = await postRes.json();

      if (postJson.result === "error") {
        setBtnLoading(false);
        errorModal.style.display = "block";
        document.body.style.overflow = "hidden";
        return;
      }

      if (postJson.result === "success") {
        setBtnLoading(false);
        successModal.style.display = "block";
        document.body.style.overflow = "hidden";
        form.reset();
        return;
      }

      setBtnLoading(false);
      alert("Respons tidak terduga dari server.");
    } catch (err) {
      setBtnLoading(false);
      alert("Gagal submit: " + err.message);
    }
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