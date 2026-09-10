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

function revealOnce(el, className, threshold = 0.3, delay = 0) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add(className), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold });
  io.observe(el);
}

function staggerReveal(nodeList, className, threshold = 0.25, stepMs = 90) {
  nodeList.forEach((el, i) => revealOnce(el, className, threshold, (i % 8) * stepMs));
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

// ============================================================
// Confetti burst (one-shot overlay canvas)
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

  const colors = ['#ff5c9e', '#e8c9a0', '#ff8fb3', '#a56bff', '#ffffff'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: cvs.width / 2 + (Math.random() - 0.5) * 220,
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
const introEl = document.getElementById('intro');
const introLine = document.getElementById('introLine');
const openHeartBtn = document.getElementById('openHeartBtn');
const introText = introLine ? introLine.textContent.trim() : '';

window.addEventListener('DOMContentLoaded', () => {
  startHearts();
  if (introLine && introText) {
    setTimeout(() => {
      typeText(introLine, introText, 32, () => {
        introLine.classList.add('done');
      });
    }, 500);
  }
});

if (openHeartBtn) {
  openHeartBtn.addEventListener('click', () => {
    const site = document.getElementById('site');
    introEl.classList.add('leaving');
    burstConfetti(0.2);
    setTimeout(() => {
      introEl.setAttribute('hidden', '');
      site.removeAttribute('hidden');
      window.scrollTo(0, 0);
      initScrollReveal();
    }, 1100);
  });
}

// ============================================================
// Scroll reveal — runs once the main site is shown
// ============================================================
function initScrollReveal() {
  document.querySelectorAll('.section-title, .story-date').forEach(el => revealOnce(el, 'in-view', 0.4));
  staggerReveal(document.querySelectorAll('.tl-card'), 'in-view', 0.3, 0);
  staggerReveal(document.querySelectorAll('.nick-chip'), 'in-view', 0.3, 70);
  staggerReveal(document.querySelectorAll('.counter-box'), 'in-view', 0.3, 90);
  staggerReveal(document.querySelectorAll('.reason-card'), 'in-view', 0.25, 90);
  staggerReveal(document.querySelectorAll('.memory-card'), 'in-view', 0.25, 90);
  document.querySelectorAll('.letter-card, .wish-card').forEach(el => revealOnce(el, 'in-view', 0.3));

  initLetterTyping();
  initFinalSection();
}

// ============================================================
// Letter / wish typing effect (typed once each scrolls into view)
// ============================================================
function initLetterTyping() {
  document.querySelectorAll('.letter-text, .wish-text').forEach(el => {
    const full = el.textContent.trim();
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    revealOnce(el, 'typing-armed', 0.25, 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.appendChild(cursor);
          typeText(el, full, 16, () => {
            el.appendChild(cursor);
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    io.observe(el);
  });
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
// Reason cards — tap toggle for touch devices
// ============================================================
document.querySelectorAll('.reason-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.reason-card.tapped').forEach(c => {
      if (c !== card) c.classList.remove('tapped');
    });
    card.classList.toggle('tapped');
  });
});

// ============================================================
// Memory wall — flip cards
// ============================================================
document.querySelectorAll('.memory-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// ============================================================
// Final section — sequential line reveal + confetti
// ============================================================
function initFinalSection() {
  const finalSection = document.getElementById('finalSection');
  if (!finalSection) return;

  const line1 = document.getElementById('finalLine1');
  const line2 = document.getElementById('finalLine2');
  const line3 = document.getElementById('finalLine3');
  const title = document.getElementById('finalTitle');
  const heart = document.querySelector('.final-heart');
  const btn = finalSection.querySelector('.glow-btn');

  const sequence = [line1, line2, line3, title, heart, btn].filter(Boolean);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sequence.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('show');
            if (el === title) burstConfetti(0.35);
          }, i * 500);
        });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  io.observe(finalSection);
}

// ============================================================
// Final modal
// ============================================================
const modalOverlay = document.getElementById('modalOverlay');
const lastThingBtn = document.getElementById('lastThingBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.removeAttribute('hidden');
  requestAnimationFrame(() => modalOverlay.classList.add('visible'));
  burstConfetti(0.15);
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('visible');
  setTimeout(() => modalOverlay.setAttribute('hidden', ''), 400);
}

if (lastThingBtn) lastThingBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hasAttribute('hidden')) closeModal();
  });
}

// ============================================================
// Fallback
// ============================================================
window.addEventListener('load', () => {
  const site = document.getElementById('site');
  if (site && !site.hasAttribute('hidden')) initScrollReveal();
});
      
