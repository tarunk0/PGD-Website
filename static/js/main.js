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

// Product Enquiry Handler - Auto-fill form with product details
function enquireProduct(e, productId, productName, productCategory, productPrice, productPurity) {
  e.preventDefault();
  
  // Check if form exists on current page
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) {
    // Form doesn't exist on current page (e.g., viewing catalog.html)
    // Store product data and redirect to home page
    sessionStorage.setItem('enquiry_product_id', productId);
    sessionStorage.setItem('enquiry_product_name', productName);
    sessionStorage.setItem('enquiry_product_category', productCategory);
    sessionStorage.setItem('enquiry_product_price', productPrice);
    sessionStorage.setItem('enquiry_product_purity', productPurity);
    window.location.href = '/#contact';
    return;
  }
  
  // Form exists on current page - scroll and auto-fill
  contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Auto-fill product information
  setTimeout(() => {
    autoFillProductDetails(productId, productName, productCategory, productPrice, productPurity);
  }, 500);
}

// Helper function to auto-fill product details
function autoFillProductDetails(productId, productName, productCategory, productPrice, productPurity) {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  // Set product category dropdown
  const categorySelect = document.getElementById('productCategory');
  if (categorySelect && productCategory) {
    categorySelect.value = productCategory.toLowerCase();
    categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Set hidden product fields
  const productIdField = document.getElementById('productId');
  const productNameField = document.getElementById('productName');
  if (productIdField) productIdField.value = productId;
  if (productNameField) productNameField.value = productName;
  
  // Pre-fill message with product details
  const messageField = document.getElementById('messageField');
  const prefilledMessage = `I am interested in your ${productName} (${productCategory.toUpperCase()}) product listed at ${productPrice}. Purity: ${productPurity}. Please provide quotation for bulk orders.\n\nRequirements:\n- Destination: \n- Quantity: \n- Timeline: `;
  
  if (messageField) {
    messageField.value = prefilledMessage;
    messageField.focus();
    messageField.setSelectionRange(messageField.value.length, messageField.value.length);
  }
  
  // Focus on first empty required field
  const nameField = contactForm.querySelector('input[name="name"]');
  if (nameField && !nameField.value) {
    nameField.focus();
  }
}

// Contact form - Enhanced with database saving
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('form-msg');
  
  // Get form values from named inputs
  const name = form.querySelector('input[name="name"]')?.value || '';
  const email = form.querySelector('input[name="email"]')?.value || '';
  const phone = form.querySelector('input[name="phone"]')?.value || '';
  const productCategory = form.querySelector('select[name="product_category"]')?.value || '';
  const productId = form.querySelector('input[name="product_id"]')?.value || null;
  const message = form.querySelector('textarea[name="message"]')?.value || '';
  
  console.log('📋 Form captured:', { name, email, phone, productCategory, productId, message });
  
  // Validate required fields
  if (!name || !email || !phone) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = '#dc3545';
      msg.textContent = 'Please fill in all required fields (Name, Email, Phone)';
    }
    console.warn('Form validation failed - missing required fields');
    return;
  }
  
  // Validate phone format (basic check)
  const phoneRegex = /[0-9+\-\s]{10,}/;
  if (!phoneRegex.test(phone)) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = '#dc3545';
      msg.textContent = 'Please enter a valid phone number (minimum 10 digits)';
    }
    return;
  }
  
  // Build data object
  const data = {
    name: name,
    email: email,
    phone: phone,
    product_id: productId || null,
    message: message,
    product_category: productCategory
  };
  
  console.log('Submitting inquiry:', data);
  
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
    if (result.success || result.status === 'success') {
      if (msg) {
        msg.style.display = 'block';
        msg.style.color = '#22c55e';
        msg.textContent = '✓ Inquiry submitted successfully! We\'ll contact you within 24 hours.';
      }
      console.log('✓ Inquiry saved:', result.inquiry_id || result.id);
      form.reset();
      // Clear hidden fields
      document.getElementById('productId').value = '';
      document.getElementById('productName').value = '';
      
      // Hide message after 6 seconds
      setTimeout(() => {
        if (msg) msg.style.display = 'none';
      }, 6000);
    } else {
      if (msg) {
        msg.style.display = 'block';
        msg.style.color = '#dc3545';
        msg.textContent = 'Error: ' + (result.error || 'Failed to save inquiry. Please try again.');
      }
      console.error('✗ Error saving inquiry:', result);
    }
  })
  .catch(error => {
    console.error('✗ Fetch error:', error);
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = '#dc3545';
      msg.textContent = 'Error saving inquiry. Please try again or contact us directly.';
    }
  });
}

// Initialize - Check for redirected product details from catalog
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have product details from sessionStorage (from catalog redirect)
  const productId = sessionStorage.getItem('enquiry_product_id');
  if (productId) {
    const productName = sessionStorage.getItem('enquiry_product_name');
    const productCategory = sessionStorage.getItem('enquiry_product_category');
    const productPrice = sessionStorage.getItem('enquiry_product_price');
    const productPurity = sessionStorage.getItem('enquiry_product_purity');
    
    // Auto-fill the form
    autoFillProductDetails(productId, productName, productCategory, productPrice, productPurity);
    
    // Scroll to contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      setTimeout(() => {
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    // Clear sessionStorage
    sessionStorage.clear();
  }
});

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

