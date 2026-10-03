/* =========================================================
   KONFIGURASI — cukup edit bagian ini untuk mengganti data
   ========================================================= */

const weddingConfig = {
  // Nama mempelai
  groom: "TIRMIDZI",
  bride: "AISYAH",

  // Orang tua (isi nama saja, tulisan "Bapak" / "Ibu" otomatis)
  groomFather: "........",
  groomMother: "........",
  brideFather: "........",
  brideMother: "........",

  // Tanggal: format TAHUN-BULAN-TANGGAL (contoh: 2026-12-12)
  date: "2026-12-12",
  timezone: "+07:00",          // WIB = +07:00, WITA = +08:00, WIT = +09:00
  akadTime: "08:00 WIB",       // countdown menghitung mundur menuju jam akad
  receptionTime: "19:00 WIB",

  // Lokasi
  venue: "Grand Ballroom Example",
  address: "Jl. Example No. 123",
  mapsUrl: "GOOGLE_MAPS_URL", // tempel link Google Maps; jika belum diganti, tombol mencari lokasi dari nama + alamat

  // Musik YouTube (mulai diputar setelah tombol BUKA UNDANGAN ditekan)
  musicVideoUrl: "https://www.youtube.com/watch?v=smGZNdTDs-o",

  // Kalimat pembuka & penutup
  introText: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk hadir dan memberikan doa restu pada hari bahagia kami.",
  closingText: "Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",

  // Digital gift
  gift: {
    qrisImage: "assets/qris.jpe",
    qrisName: "MAISON_MALL",
    recipient: "Tirmidzi & Aisyah",
    address: "Jl. Example No. 123, Kota Example"
  },

  // Love story (photo = nomor urutan foto di galleryImages, dimulai dari 0, atau path file sendiri)
  stories: [
    { year: "2019", title: "FIRST MEET",  photo: 0, text: "Pertemuan sederhana yang tak pernah kami rencanakan. Satu sapaan singkat, dan tanpa sadar cerita kami dimulai." },
    { year: "2021", title: "FIRST DATE",  photo: 1, text: "Secangkir kopi dan obrolan yang terasa terlalu singkat. Dari hari itu kami tahu ingin saling menemani lebih lama." },
    { year: "2024", title: "ENGAGEMENT",  photo: 2, text: "Dengan restu keluarga, kami mengikat janji untuk melangkah bersama menuju hari yang lebih bermakna." },
    { year: "2026", title: "THE WEDDING", photo: 3, text: "Dan kini, kami mengundang Anda menjadi saksi awal perjalanan baru kami." }
  ],

  // Contoh ucapan yang tampil di awal
  wishes: [
    { name: "Keluarga Besar", text: "Selamat menempuh hidup baru. Semoga sakinah, mawaddah, warahmah." },
    { name: "Sahabat Kuliah", text: "Akhirnya hari ini tiba! Bahagia selalu untuk kalian berdua." },
    { name: "Rekan Kerja",    text: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair." }
  ],

  // Kirim RSVP ke server sendiri (Google Apps Script / Formspree, dsb). Kosong = mode demo (simpan di browser).
  rsvpEndpoint: ""
};

// Daftar foto pengantin. Cukup ganti nama file di sini.
const galleryImages = [
  "assets/pengantin-1.jpg",
  "assets/pengantin-2.jpg",
  "assets/pengantin-3.jpg",
  "assets/pengantin-4.jpg"
];

// Foto mana yang dipakai di tiap bagian (angka = urutan di galleryImages mulai dari 0, atau path file sendiri).
// groom & bride memakai foto sendiri-sendiri (assets/tirmidzi.jpg dan assets/aisyah.jpg)
const photoMap = {
  cover: 0,
  hero: 1,
  groom: "assets/tirmidzi.jpg",
  bride: "assets/aisyah.jpg",
  countdown: 2,
  video: 3,
  closing: 0
};

// Posisi fokus foto (object-position) supaya wajah tidak terpotong. Format: "X% Y%"
const photoPosition = {
  cover: "50% 25%",
  hero: "50% 25%",
  groom: "50% 25%",
  bride: "50% 25%",
  countdown: "50% 30%",
  video: "50% 30%",
  closing: "50% 25%",
  gallery: "50% 25%",
  story: "50% 25%"
};


/* =========================================================
   APLIKASI — tidak perlu diubah
   ========================================================= */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = weddingConfig;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const pad = n => String(n).padStart(2, "0");

  const store = {
    get(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage tidak tersedia */ } }
  };

  /* ---------- Data turunan untuk ditampilkan ---------- */
  const [Y, M, D] = cfg.date.split("-").map(Number);
  const dateLong = `${D} ${MONTHS[M - 1]} ${Y}`;
  const timeMatch = cfg.akadTime.match(/(\d{1,2})[:.](\d{2})/);
  const akadHH = timeMatch ? pad(timeMatch[1]) : "08";
  const akadMM = timeMatch ? timeMatch[2] : "00";
  const target = new Date(`${cfg.date}T${akadHH}:${akadMM}:00${cfg.timezone}`).getTime();
  const initials = `${cfg.groom.charAt(0)} & ${cfg.bride.charAt(0)}`;

  const view = {
    groom: cfg.groom, bride: cfg.bride,
    groomFather: `Bapak ${cfg.groomFather}`, groomMother: `& Ibu ${cfg.groomMother}`,
    brideFather: `Bapak ${cfg.brideFather}`, brideMother: `& Ibu ${cfg.brideMother}`,
    dateLong, dateUpper: dateLong.toUpperCase(), dateDots: `${D} • ${M} • ${Y}`,
    akadTime: cfg.akadTime, receptionTime: cfg.receptionTime,
    venue: cfg.venue, address: cfg.address,
    introText: cfg.introText, closingText: cfg.closingText,
    giftQrisName: cfg.gift.qrisName,
    giftRecipient: cfg.gift.recipient, giftAddress: cfg.gift.address
  };

  const toTitle = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  document.title = `The Wedding of ${toTitle(cfg.groom)} & ${toTitle(cfg.bride)}`;
  $$("[data-bind]").forEach(el => { const v = view[el.dataset.bind]; if (v != null) el.textContent = v; });
  $("#qris-image").src = cfg.gift.qrisImage;
  $("#qris-image").alt = `Kode QRIS ${cfg.gift.qrisName}`;

  /* ---------- Foto: otomatis memakai file, fallback elegan bila belum ada ---------- */
  function photoSrc(ref) {
    if (typeof ref === "string") return ref;
    const n = galleryImages.length;
    return n ? galleryImages[((ref % n) + n) % n] : "";
  }

  function attachPhoto(wrapper, ref, position) {
    const img = wrapper.querySelector("img") || wrapper.appendChild(document.createElement("img"));
    img.style.objectPosition = position || "50% 30%";
    img.decoding = "async";
    const fail = () => {
      wrapper.classList.add("no-photo");
      if (!wrapper.querySelector(".monogram")) {
        const m = document.createElement("span");
        m.className = "monogram";
        m.textContent = initials;
        wrapper.appendChild(m);
      }
    };
    img.addEventListener("error", fail, { once: true });
    const src = photoSrc(ref);
    if (!src) { fail(); return; }
    img.src = src;
  }

  $$("[data-photo]").forEach(el => {
    const key = el.dataset.photo;
    attachPhoto(el, photoMap[key], photoPosition[key]);
  });

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------- Tamu: ?to=Nama ---------- */
  const guest = new URLSearchParams(location.search).get("to");
  const guestEditor = $("#guest-editor");
  const guestNameInput = $("#guest-name-input");
  if (guest) {
    const guestName = guest.slice(0, 60);
    $("#guest-name").textContent = guestName;
    $("#guest").hidden = false;
    guestEditor.hidden = true;
    $("#rsvp-name").value = guestName;
    $("#wish-name").value = guestName.slice(0, 40);
  }
  $("#copy-invite-link").addEventListener("click", async () => {
    const name = guestNameInput.value.trim();
    if (!name) {
      toast("Isi nama tamu terlebih dahulu.");
      guestNameInput.focus();
      return;
    }
    const inviteUrl = new URL(location.href);
    inviteUrl.searchParams.set("to", name.slice(0, 60));
    const copied = await copyText(inviteUrl.href);
    toast(copied ? "Link undangan personal berhasil disalin" : "Gagal menyalin link. Periksa izin clipboard browser.");
  });

  /* ---------- Google Maps ---------- */
  const mapsBtn = $("#maps-btn");
  const hasMapsUrl = /^https?:\/\//i.test(cfg.mapsUrl || "");
  mapsBtn.href = hasMapsUrl
    ? cfg.mapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cfg.venue} ${cfg.address}`)}`;

  /* ---------- Love story ---------- */
  (function renderStory() {
    const wrap = $("#timeline");
    cfg.stories.forEach((s, i) => {
      const item = document.createElement("article");
      item.className = "t-item";
      item.innerHTML =
        '<figure class="polaroid img-reveal"><div class="photo"><img alt=""></div></figure>' +
        '<div class="t-text reveal"><p class="t-year"></p><h3></h3><p class="t-copy"></p></div>';
      $(".t-year", item).textContent = s.year;
      $("h3", item).textContent = s.title;
      $(".t-copy", item).textContent = s.text;
      $("img", item).alt = s.title;
      attachPhoto($(".photo", item), s.photo != null ? s.photo : i, s.position || photoPosition.story);
      wrap.appendChild(item);
    });
  })();

  /* ---------- Gallery + Lightbox ---------- */
  const lb = {
    root: $("#lightbox"), stage: $("#lb-stage"), img: $("#lb-img"),
    i: $("#lb-i"), n: $("#lb-n"), mono: $("#lb-mono"), index: 0, lastFocus: null
  };
  const gallerySources = galleryImages.slice();

  (function renderGallery() {
    const grid = $("#gallery-grid");
    if (!gallerySources.length) return;
    const cols = document.createElement("div");
    cols.className = "g-cols";
    gallerySources.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "photo g-item reveal" + (i === 0 ? " g-wide" : "");
      b.setAttribute("aria-label", `Buka foto ${i + 1} dari ${gallerySources.length}`);
      b.innerHTML = "<img alt=\"\">";
      $("img", b).alt = `Foto pengantin ${i + 1}`;
      attachPhoto(b, src, photoPosition.gallery);
      b.addEventListener("click", () => openLightbox(i));
      (i === 0 ? grid : cols).appendChild(b);
    });
    if (cols.children.length) grid.appendChild(cols);
  })();

  function showSlide(i, animate) {
    const n = gallerySources.length;
    lb.index = (i + n) % n;
    const apply = () => {
      lb.stage.classList.remove("failed", "zoomed");
      lb.img.src = gallerySources[lb.index];
      lb.img.alt = `Foto pengantin ${lb.index + 1}`;
      lb.i.textContent = lb.index + 1;
      lb.img.classList.remove("swap");
    };
    if (animate && !reduced) {
      lb.img.classList.add("swap");
      setTimeout(apply, 180);
    } else apply();
  }

  lb.img.addEventListener("error", () => lb.stage.classList.add("failed"));
  lb.img.addEventListener("load", () => lb.stage.classList.remove("failed"));
  lb.mono.textContent = initials;
  lb.n.textContent = gallerySources.length;

  function openLightbox(i) {
    lb.lastFocus = document.activeElement;
    lb.root.classList.add("open");
    lb.root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("lb-open");
    showSlide(i, false);
    $("#lb-close").focus({ preventScroll: true });
  }
  function closeLightbox() {
    lb.root.classList.remove("open");
    lb.root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("lb-open");
    lb.stage.classList.remove("zoomed");
    if (lb.lastFocus) lb.lastFocus.focus({ preventScroll: true });
  }
  const isLbOpen = () => lb.root.classList.contains("open");

  $("#lb-close").addEventListener("click", closeLightbox);
  $("#lb-prev").addEventListener("click", () => showSlide(lb.index - 1, true));
  $("#lb-next").addEventListener("click", () => showSlide(lb.index + 1, true));
  lb.root.addEventListener("click", e => { if (e.target === lb.root || e.target === lb.stage) closeLightbox(); });
  lb.img.addEventListener("click", e => {
    if (lb.stage.classList.contains("zoomed")) { lb.stage.classList.remove("zoomed"); return; }
    const r = lb.img.getBoundingClientRect();
    lb.img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    lb.stage.classList.add("zoomed");
  });
  document.addEventListener("keydown", e => {
    if (!isLbOpen()) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showSlide(lb.index - 1, true);
    else if (e.key === "ArrowRight") showSlide(lb.index + 1, true);
  });
  let touchX = null;
  lb.root.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.root.addEventListener("touchend", e => {
    if (touchX == null || lb.stage.classList.contains("zoomed")) { touchX = null; return; }
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showSlide(lb.index + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });

  /* ---------- Countdown ---------- */
  const cd = { d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-minutes"), s: $("#cd-seconds") };
  function setNum(el, val) {
    const text = pad(val);
    if (el.textContent !== text) {
      el.textContent = text;
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }
  function tick() {
    const diff = target - Date.now();
    if (isNaN(diff) || diff <= 0) {
      [cd.d, cd.h, cd.m, cd.s].forEach(el => (el.textContent = "00"));
      const note = $("#cd-note");
      note.textContent = "Hari bahagia telah tiba";
      note.hidden = false;
      return false;
    }
    setNum(cd.d, Math.floor(diff / 86400000));
    setNum(cd.h, Math.floor(diff / 3600000) % 24);
    setNum(cd.m, Math.floor(diff / 60000) % 60);
    setNum(cd.s, Math.floor(diff / 1000) % 60);
    return true;
  }
  if (tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }

  /* ---------- Salin ke clipboard ---------- */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* lanjut ke fallback */ }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }

  $("#copy-addr").addEventListener("click", async () => {
    const ok = await copyText(`${cfg.gift.recipient}\n${cfg.gift.address}`);
    toast(ok ? "Alamat kado berhasil disalin" : "Gagal menyalin. Salin alamat secara manual.");
  });

  /* ---------- RSVP (mode demo) ---------- */
  const rsvpForm = $("#rsvp-form"), rsvpDone = $("#rsvp-done"), rsvpErr = $("#rsvp-error"), guestsSel = $("#rsvp-guests");

  $$('input[name="attendance"]', rsvpForm).forEach(r => r.addEventListener("change", () => {
    guestsSel.disabled = r.value === "tidak" && r.checked;
  }));

  rsvpForm.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(rsvpForm);
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      rsvpErr.textContent = "Nama wajib diisi.";
      rsvpErr.hidden = false;
      $("#rsvp-name").focus();
      return;
    }
    rsvpErr.hidden = true;
    const attending = fd.get("attendance") === "hadir";
    const message = String(fd.get("message") || "").trim();
    const payload = {
      name, attendance: attending ? "hadir" : "tidak hadir",
      guests: attending ? Number(fd.get("guests")) : 0, message, time: new Date().toISOString()
    };

    const list = store.get("wedding_rsvp", []);
    list.push(payload);
    store.set("wedding_rsvp", list);

    if (cfg.rsvpEndpoint) {
      fetch(cfg.rsvpEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) }).catch(() => {});
    }
    $("#rsvp-demo-note").hidden = !!cfg.rsvpEndpoint;

    $("#rsvp-done-title").textContent = attending ? "Terima kasih, " + name : "Terima kasih atas kabarnya";
    $("#rsvp-done-text").textContent = attending
      ? `Konfirmasi kehadiran Anda (${payload.guests} orang) sudah kami terima. Sampai jumpa di hari bahagia kami.`
      : "Kami mengerti dan tetap berterima kasih atas doa terbaik Anda.";
    rsvpForm.hidden = true;
    rsvpDone.hidden = false;

    if (message) addWish(name, message, true);
    toast("Konfirmasi berhasil dikirim");
  });

  $("#rsvp-again").addEventListener("click", () => {
    rsvpDone.hidden = true;
    rsvpForm.hidden = false;
    rsvpForm.classList.add("in");
  });

  /* ---------- Wedding wishes ---------- */
  const wishList = $("#wish-list");
  const savedWishes = store.get("wedding_wishes", []);

  function wishNode(w, isNew) {
    const el = document.createElement("article");
    el.className = "wish" + (isNew ? " is-new" : "");
    el.innerHTML = '<span class="avatar"></span><div><h4></h4><p></p><time></time></div>';
    $(".avatar", el).textContent = (w.name || "?").trim().charAt(0).toUpperCase();
    $("h4", el).textContent = w.name;
    $("p", el).textContent = w.text;
    $("time", el).textContent = w.when || "";
    return el;
  }
  function addWish(name, text, persistAsNew) {
    const w = { name, text, when: "Baru saja" };
    wishList.prepend(wishNode(w, true));
    wishList.scrollTop = 0;
    if (persistAsNew) {
      savedWishes.unshift(w);
      store.set("wedding_wishes", savedWishes.slice(0, 50));
    }
  }
  savedWishes.forEach(w => wishList.appendChild(wishNode(w, false)));
  cfg.wishes.forEach(w => wishList.appendChild(wishNode(w, false)));

  $("#wish-form").addEventListener("submit", e => {
    e.preventDefault();
    const nameEl = $("#wish-name"), msgEl = $("#wish-message"), err = $("#wish-error");
    const name = nameEl.value.trim(), text = msgEl.value.trim();
    if (!name || !text) {
      err.textContent = !name ? "Nama wajib diisi." : "Pesan tidak boleh kosong.";
      err.hidden = false;
      (!name ? nameEl : msgEl).focus();
      return;
    }
    err.hidden = true;
    addWish(name, text, true);
    msgEl.value = "";
    toast("Ucapan Anda sudah terkirim");
  });

  /* ---------- Musik ---------- */
  const musicBtn = $("#music-btn");
  let musicWarned = false;
  let musicPlayer;
  let musicPlayerReady = false;
  let musicRequested = false;
  let musicPlaying = false;
  const musicVideo = cfg.musicVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);

  function warnMusic(message) {
    if (musicWarned) return;
    musicWarned = true;
    toast(message);
  }

  function setMusicState(playing) {
    musicPlaying = playing;
    musicBtn.classList.toggle("is-paused", !playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  }
  function playMusic() {
    musicRequested = true;
    if (musicPlayerReady) musicPlayer.playVideo();
  }
  musicBtn.addEventListener("click", () => {
    if (musicPlaying) {
      musicRequested = false;
      musicPlayer.pauseVideo();
    } else playMusic();
  });

  if (!musicVideo) {
    warnMusic("Tautan musik YouTube tidak valid.");
  } else {
    window.onYouTubeIframeAPIReady = () => {
      musicPlayer = new window.YT.Player("bgm-player", {
        videoId: musicVideo[1],
        playerVars: {
          autoplay: 0,
          controls: 1,
          loop: 1,
          playlist: musicVideo[1],
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: event => {
            musicPlayerReady = true;
            event.target.getIframe().title = "Lagu pernikahan pilihan";
            if (musicRequested) musicPlayer.playVideo();
          },
          onStateChange: event => {
            setMusicState(event.data === window.YT.PlayerState.PLAYING);
          },
          onAutoplayBlocked: () => {
            setMusicState(false);
            warnMusic("Tekan tombol musik untuk mulai memutar lagu.");
          },
          onError: () => {
            setMusicState(false);
            warnMusic("Video musik tidak dapat diputar. Pastikan video YouTube dapat di-embed.");
          }
        }
      });
    };
    const youtubeApi = document.createElement("script");
    youtubeApi.src = "https://www.youtube.com/iframe_api";
    youtubeApi.onerror = () => warnMusic("Tidak dapat memuat pemutar YouTube. Periksa koneksi internet.");
    document.head.appendChild(youtubeApi);
  }

  /* ---------- Animasi scroll (Intersection Observer) ---------- */
  function initReveal() {
    const els = $$(".reveal, .img-reveal, .split");
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Parallax ringan ---------- */
  const parallaxEls = $$("[data-parallax]");
  let ticking = false;
  function parallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  }
  if (!reduced) {
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    window.addEventListener("resize", parallax);
  }

  /* ---------- Navigasi bawah (scroll-spy) ---------- */
  const navLinks = $$("#bottom-nav a");
  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const key = en.target.dataset.nav;
        navLinks.forEach(a => a.classList.toggle("active", a.dataset.target === key));
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    $$("[data-nav]").forEach(s => spy.observe(s));
  }

  /* ---------- Partikel emas ---------- */
  function initParticles() {
    if (reduced) return;
    const canvas = $("#particles");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    const make = initial => ({
      x: Math.random() * w, y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.5 + 0.4, vy: -(Math.random() * 0.25 + 0.08),
      vx: (Math.random() - 0.5) * 0.15, a: Math.random() * 0.45 + 0.2, t: Math.random() * 6.28
    });
    const parts = Array.from({ length: window.innerWidth < 700 ? 22 : 36 }, () => make(true));
    (function loop() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.t += 0.012;
        p.x += p.vx + Math.sin(p.t) * 0.15;
        p.y += p.vy;
        if (p.y < -10) parts[i] = make(false);
        const alpha = p.a * (0.65 + 0.35 * Math.sin(p.t * 2));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = `rgba(230, 211, 166, ${alpha.toFixed(3)})`;
        ctx.shadowColor = "rgba(200, 169, 106, .8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Buka undangan ---------- */
  const cover = $("#cover");
  let opened = false;
  let autoScrollCancelled = false;
  let autoScrollTimer;
  document.documentElement.classList.add("locked");

  function stopAutoScroll() {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = undefined;
  }

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach(eventName => {
    window.addEventListener(eventName, () => {
      if (opened) {
        autoScrollCancelled = true;
        stopAutoScroll();
      }
    }, { passive: true });
  });

  function startAutoScroll() {
    if (reduced || autoScrollCancelled) return;
    const sections = $$("main > section");
    let index = 0;
    function advance() {
      if (index >= sections.length - 1) return;
      const destination = sections[++index];
      const content = destination.querySelector(
        ":scope > .container, :scope > .hero-inner, :scope > .countdown-inner, :scope > .closing-inner"
      );
      if (content) {
        content.classList.remove("auto-arrive");
        void content.offsetWidth;
        content.classList.add("auto-arrive");
        content.addEventListener("animationend", () => content.classList.remove("auto-arrive"), { once: true });
      }
      destination.scrollIntoView({ behavior: "smooth", block: "start" });
      autoScrollTimer = setTimeout(advance, 5000);
    }
    autoScrollTimer = setTimeout(advance, 5000);
  }

  function openInvitation() {
    if (opened) return;
    opened = true;
    cover.classList.add("is-opening");
    playMusic();
    setTimeout(() => {
      document.documentElement.classList.remove("locked");
      window.scrollTo(0, 0);
      document.body.classList.add("is-open");
      parallax();
    }, 450);
    setTimeout(() => { initReveal(); initScrollSpy(); initParticles(); }, 600);
    setTimeout(() => { cover.style.display = "none"; }, 2000);
    setTimeout(startAutoScroll, 600);
  }
  $("#open-btn").addEventListener("click", openInvitation);

  window.addEventListener("load", () => {
    if (history.scrollRestoration) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  });
})();
