const EVENT_DATE = new Date('2026-11-28T15:30:00-05:00');

const $ = (selector) => document.querySelector(selector);
const intro = $('#intro');
const main = $('#main');
const music = $('#music');
const musicToggle = $('#musicToggle');
const toast = $('#toast');
const openButton = $('#openInvitation');

let fadeTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function syncMusicUI() {
  const playing = !music.paused;
  musicToggle.classList.toggle('playing', playing);
  musicToggle.classList.toggle('is-paused', !playing);
  musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  musicToggle.setAttribute('title', playing ? 'Pausar música' : 'Reproducir música');
}

async function startMusic() {
  clearInterval(fadeTimer);
  try {
    music.volume = 0;
    await music.play();
    let volume = 0;
    fadeTimer = setInterval(() => {
      volume = Math.min(0.68, volume + 0.055);
      music.volume = volume;
      if (volume >= 0.68) clearInterval(fadeTimer);
    }, 70);
  } catch (error) {
    music.volume = 0.68;
    showToast('Toca el botón de música para escuchar la canción');
  }
  syncMusicUI();
}

openButton.addEventListener('click', () => {
  startMusic();
  musicToggle.classList.add('show');
  intro.classList.add('opening');
  openButton.disabled = true;

  setTimeout(() => {
    intro.classList.add('opened');
    document.body.classList.remove('locked');
    main.classList.add('visible');
  }, 900);
});

musicToggle.addEventListener('click', async () => {
  if (music.paused) {
    try {
      music.volume = 0.68;
      await music.play();
    } catch (error) {
      showToast('No fue posible iniciar el audio');
    }
  } else {
    music.pause();
  }
  syncMusicUI();
});

music.addEventListener('play', syncMusicUI);
music.addEventListener('pause', syncMusicUI);
music.addEventListener('error', () => showToast('No fue posible cargar la música'));

function applyGuestPersonalization() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('invitado');
  const seats = params.get('cupos');
  const card = $('#guestCard');

  if (!guest) return;

  $('#guestName').textContent = guest;
  card.classList.add('show');

  if (seats && /^\d+$/.test(seats) && Number(seats) > 0) {
    const number = Number(seats);
    const seatBadge = $('#guestSeats');
    $('#guestCopy').textContent = number === 1
      ? 'Hemos reservado 1 lugar para ti.'
      : `Hemos reservado ${number} lugares para ustedes.`;
    seatBadge.textContent = number;
    seatBadge.classList.add('show');
  }
}

function updateCountdown() {
  let remaining = EVENT_DATE.getTime() - Date.now();

  if (remaining <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach((id) => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }

  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  remaining %= 60000;
  const seconds = Math.floor(remaining / 1000);

  $('#days').textContent = String(days);
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#minutes').textContent = String(minutes).padStart(2, '0');
  $('#seconds').textContent = String(seconds).padStart(2, '0');
}

function initReveals() {
  const elements = document.querySelectorAll('[data-reveal], .stagger');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach((element) => observer.observe(element));
}

applyGuestPersonalization();
updateCountdown();
setInterval(updateCountdown, 1000);
initReveals();
syncMusicUI();
