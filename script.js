// ============================================================
// Utility
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, text, speed, onDone) {
  if (prefersReducedMotion) {
    el.textContent = text;
    if (onDone) onDone();
    return;
  }
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      if (onDone) onDone();
    }
  }, speed);
}

function onceVisible(el, callback, threshold = 0.35) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
        io.unobserve(entry.target);
      }
    });
  }, { threshold });
  io.observe(el);
}

// ============================================================
// Background particles (canvas)
// ============================================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles() {
  const count = window.innerWidth < 700 ? 45 : 90;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.4,
    speedY: Math.random() * 0.25 + 0.05,
    drift: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.15,
    hue: Math.random() > 0.5 ? '255,143,179' : '165,107,255'
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${p.hue},0.8)`;
    ctx.fill();

    p.y -= p.speedY;
    p.x += p.drift;

    if (p.y < -5) {
      p.y = canvas.height + 5;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -5) p.x = canvas.width + 5;
    if (p.x > canvas.width + 5) p.x = -5;
  }
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});
if (!prefersReducedMotion) requestAnimationFrame(animateParticles);
else ctx.clearRect(0, 0, canvas.width, canvas.height);

// ============================================================
// Floating hearts
// ============================================================
const heartsWrap = document.getElementById('floating-hearts');

function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '❤';
  const size = Math.random() * 16 + 10;
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = size + 'px';
  heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
  const duration = Math.random() * 8 + 9;
  heart.style.animationDuration = duration + 's';
  heartsWrap.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

let heartTimer = null;
function startHearts() {
  if (heartTimer || prefersReducedMotion) return;
  spawnHeart();
  heartTimer = setInterval(spawnHeart, 650);
}
function stopHearts() {
  clearInterval(heartTimer);
  heartTimer = null;
}

// ============================================================
// Confetti burst (canvas one-shot, for the birthday moment)
// ============================================================
function burstConfetti(originYRatio = 0.35) {
  if (prefersReducedMotion) return;
  const cvs = document.createElement('canvas');
  cvs.style.position = 'fixed';
  cvs.style.inset = '0';
  cvs.style.width = '100vw';
  cvs.style.height = '100vh';
  cvs.style.pointerEvents = 'none';
  cvs.style.zIndex = '40';
  document.body.appendChild(cvs);
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  const c = cvs.getContext('2d');

  const colors = ['#ff5c8d', '#ffd27a', '#ffb6c9', '#a56bff', '#ffffff'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: cvs.width / 2 + (Math.random() - 0.5) * 200,
    y: cvs.height * originYRatio,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -9 - 3,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 12,
    gravity: 0.22
  }));

  let frame = 0;
  const maxFrames = 160;

  function tick() {
    frame++;
    c.clearRect(0, 0, cvs.width, cvs.height);
    pieces.forEach(p => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      c.save();
      c.translate(p.x, p.y);
      c.rotate((p.rot * Math.PI) / 180);
      c.fillStyle = p.color;
      c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      c.restore();
    });
    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      cvs.remove();
    }
  }
  tick();
}

// ============================================================
// Intro sequence
// ============================================================
const introLine = document.getElementById('introLine');
const openHeartBtn = document.getElementById('openHeartBtn');
const introText = "Aaj ka din khaas hai, kyunki aap iss duniya mein aayi thi — aur meri duniya iske baad hi puri hui.";

window.addEventListener('DOMContentLoaded', () => {
  startHearts();
  if (introLine) {
    setTimeout(() => typeText(introLine, introText, 32), 500);
  }
});

if (openHeartBtn) {
  openHeartBtn.addEventListener('click', () => {
    const intro = document.getElementById('intro');
    const site = document.getElementById('site');
    intro.style.opacity = '0';
    intro.style.transition = 'opacity .6s ease';
    setTimeout(() => {
      intro.setAttribute('hidden', '');
      intro.style.opacity = '';
      site.removeAttribute('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
      burstConfetti(0.25);
      revealOnLoad();
    }, 600);
  });
}

// ============================================================
// Scroll reveal for sections / timeline cards / reason cards
// ============================================================
function revealOnLoad() {
  const revealables = document.querySelectorAll(
    '.tl-card, .reason-card, .memory-card, .counter-box, .nick-chip, .section-title'
  );
  revealables.forEach((el, idx) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    onceVisible(el, () => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, (idx % 6) * 80);
    });
  });
}

// ============================================================
// Letter typing effect (typed once it scrolls into view)
// ============================================================
const letterText = document.getElementById('letterText');
if (letterText) {
  const fullLetter = letterText.textContent.trim();
  letterText.textContent = '';
  onceVisible(document.getElementById('letterSection') || letterText, () => {
    typeText(letterText, fullLetter, 18);
  }, 0.25);
}

// ============================================================
// Live "time together" counter
// ============================================================
const startDate = new Date('2025-02-23T00:00:00');
const cDays = document.getElementById('cDays');
const cHours = document.getElementById('cHours');
const cMinutes = document.getElementById('cMinutes');
const cSeconds = document.getElementById('cSeconds');

function updateCounter() {
  const now = new Date();
  const diff = Math.max(0, now - startDate);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  if (cDays) cDays.textContent = days;
  if (cHours) cHours.textContent = hours;
  if (cMinutes) cMinutes.textContent = minutes;
  if (cSeconds) cSeconds.textContent = seconds;
}
if (cDays) {
  updateCounter();
  setInterval(updateCounter, 1000);
}

// ============================================================
// Memory wall — flip cards
// ============================================================
document.querySelectorAll('.memory-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// ============================================================
// Final section — sequential line reveal + confetti
// ============================================================
const finalSection = document.getElementById('finalSection');
if (finalSection) {
  const lines = ['finalLine1', 'finalLine2', 'finalLine3', 'finalTitle']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  lines.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
  });

  onceVisible(finalSection, () => {
    lines.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        if (i === lines.length - 1) burstConfetti(0.4);
      }, i * 500);
    });
  }, 0.4);
}

// ============================================================
// Final modal
// ============================================================
const modalOverlay = document.getElementById('modalOverlay');
const lastThingBtn = document.getElementById('lastThingBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

if (lastThingBtn && modalOverlay) {
  lastThingBtn.addEventListener('click', () => {
    modalOverlay.removeAttribute('hidden');
    burstConfetti(0.15);
  });
}
if (closeModalBtn && modalOverlay) {
  closeModalBtn.addEventListener('click', () => modalOverlay.setAttribute('hidden', ''));
}
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.setAttribute('hidden', '');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hasAttribute('hidden')) {
      modalOverlay.setAttribute('hidden', '');
    }
  });
      }
    
