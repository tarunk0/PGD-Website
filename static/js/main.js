// PGD – Pandra Global Dynamics – main.js

// Sticky header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Live shipment counter from API
async function fetchShipments() {
  try {
    const res = await fetch('/api/shipment-count');
    const data = await res.json();
    const countEl = document.getElementById('live-count');
    const footerEl = document.getElementById('footer-count');
    const formatted = data.count.toLocaleString();
    if (countEl) countEl.textContent = formatted;
    if (footerEl) footerEl.textContent = formatted;
  } catch (e) {}
}
fetchShipments();
setInterval(fetchShipments, 8000);

// Mobile nav toggle
function toggleNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  if (nav.style.display === 'flex') { nav.style.display = ''; }
  else { nav.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:70px;left:0;right:0;background:rgba(0,23,45,0.97);padding:2rem;gap:1.5rem;z-index:999;'; }
}

// Catalog filter
function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#catalog-grid .product-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
  });
}

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('form-msg');
  if (msg) { msg.style.display = 'block'; e.target.reset(); }
}
