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

// Contact form - Enhanced with database saving
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('form-msg');
  
  // Get form values
  const formData = new FormData(form);
  const data = {
    name: formData.get('name') || form.querySelector('input[placeholder="Your Name"]')?.value,
    email: formData.get('email') || form.querySelector('input[placeholder="Email Address"]')?.value,
    phone: form.querySelector('input[placeholder*="Phone"]')?.value || '',
    product_id: null,
    message: form.querySelector('textarea')?.value || ''
  };
  
  // Get selected product interest if exists
  const selectEl = form.querySelector('select');
  if (selectEl && selectEl.value) {
    data.product_interest = selectEl.value;
  }
  
  // Validate data
  if (!data.name || !data.email) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = '#dc3545';
      msg.textContent = 'Please fill in name and email';
    }
    return;
  }
  
  // Send to database
  fetch('/api/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      if (msg) {
        msg.style.display = 'block';
        msg.style.color = '#b87333';
        msg.textContent = 'Thank you! Your inquiry has been saved. We\'ll be in touch within 24 hours.';
      }
      console.log('Inquiry saved to database:', result.inquiry_id);
      form.reset();
      
      // Hide message after 5 seconds
      setTimeout(() => {
        if (msg) msg.style.display = 'none';
      }, 5000);
    } else {
      if (msg) {
        msg.style.display = 'block';
        msg.style.color = '#dc3545';
        msg.textContent = 'Error: ' + (result.error || 'Failed to save inquiry');
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = '#dc3545';
      msg.textContent = 'Error saving inquiry. Please try again.';
    }
  });
}

// WhatsApp Button Enhancement
document.addEventListener('DOMContentLoaded', () => {
  const whatsappBtn = document.getElementById('whatsappBtn');
  if (!whatsappBtn) return;

  // Add enhanced hover effect on desktop
  whatsappBtn.addEventListener('mouseover', () => {
    whatsappBtn.style.transform = 'scale(1.1) translateY(-3px)';
  });

  whatsappBtn.addEventListener('mouseout', () => {
    whatsappBtn.style.transform = 'translateY(0)';
  });

  // Optional: Log when user clicks WhatsApp
  whatsappBtn.addEventListener('click', () => {
    console.log('WhatsApp button clicked - User initiated chat');
    // You can add analytics here later
  });
});

