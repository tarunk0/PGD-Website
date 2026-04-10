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

// Mobile nav — slide-in panel with overlay
(function() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  // Create overlay element once
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function openNav() {
    nav.classList.add('open');
    overlay.classList.add('active');
    toggle.innerHTML = '&#10005;'; // × symbol
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    toggle.innerHTML = '&#9776;'; // ☰ symbol
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    nav.classList.contains('open') ? closeNav() : openNav();
  });

  overlay.addEventListener('click', closeNav);

  // Close nav when a link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
})();

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

// =================== CURRENCY CONVERSION SYSTEM ===================
const CurrencySystem = (() => {
  const STORAGE_KEY = 'pgd_selected_currency';
  const RATES_KEY = 'pgd_currency_rates';
  const RATES_EXPIRY_KEY = 'pgd_rates_expiry';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  let rates = {};
  let currentCurrency = 'USD';
  
  /**
   * Initialize currency system - fetch rates and setup UI
   */
  async function init() {
    // Restore user's currency preference
    currentCurrency = localStorage.getItem(STORAGE_KEY) || 'USD';
    updateCurrencyDisplay();
    
    // Fetch currency rates with caching
    await fetchAndCacheRates();
    
    // Setup event listeners
    setupEventListeners();
    
    // Apply currency conversion to all prices
    applyConversion();
  }
  
  /**
   * Fetch rates from API or use cached version
   */
  async function fetchAndCacheRates() {
    try {
      const now = Date.now();
      const cachedRates = localStorage.getItem(RATES_KEY);
      const expiry = localStorage.getItem(RATES_EXPIRY_KEY);
      
      // Use cached rates if still valid
      if (cachedRates && expiry && now < parseInt(expiry)) {
        rates = JSON.parse(cachedRates);
        return;
      }
      
      // Fetch fresh rates from API
      const response = await fetch('/api/currency-rates');
      if (!response.ok) throw new Error('Failed to fetch rates');
      
      const data = await response.json();
      if (data.success && data.rates) {
        rates = data.rates;
        
        // Cache rates with expiry timestamp
        localStorage.setItem(RATES_KEY, JSON.stringify(rates));
        localStorage.setItem(RATES_EXPIRY_KEY, String(now + CACHE_DURATION));
      }
    } catch (error) {
      console.error('Currency rates fetch error:', error);
      // Fallback to default rates if API fails
      rates = {
        'USD': 1.0,
        'EUR': 0.92,
        'GBP': 0.79,
        'INR': 83.12
      };
    }
  }
  
  /**
   * Setup currency selector event listeners
   */
  function setupEventListeners() {
    const currencyToggle = document.getElementById('currencyToggle');
    const currencyDropdown = document.getElementById('currencyDropdown');
    const currencyOptions = document.querySelectorAll('.currency-option');
    
    if (!currencyToggle) return;
    
    // Toggle dropdown on button click
    currencyToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      currencyDropdown?.classList.toggle('active');
    });
    
    // Handle currency option selection
    currencyOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selectedCurrency = option.dataset.currency;
        selectCurrency(selectedCurrency);
        currencyDropdown?.classList.remove('active');
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      currencyDropdown?.classList.remove('active');
    });
    
    // Mark current currency as active
    updateCurrencyOptions();
  }
  
  /**
   * Select and apply currency
   */
  function selectCurrency(currency) {
    if (!rates[currency]) return;
    
    currentCurrency = currency;
    localStorage.setItem(STORAGE_KEY, currency);
    
    updateCurrencyDisplay();
    updateCurrencyOptions();
    applyConversion();
  }
  
  /**
   * Update currency display in button
   */
  function updateCurrencyDisplay() {
    const display = document.getElementById('currencyDisplay');
    if (display) {
      display.textContent = currentCurrency;
    }
  }
  
  /**
   * Mark active currency in dropdown
   */
  function updateCurrencyOptions() {
    const options = document.querySelectorAll('.currency-option');
    options.forEach(option => {
      if (option.dataset.currency === currentCurrency) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
  
  /**
   * Apply currency conversion to all product prices
   */
  function applyConversion() {
    if (!rates[currentCurrency]) return;
    
    const conversionRate = rates[currentCurrency];
    const baseRate = rates['USD']; // All prices are in USD
    
    // Convert all price elements on the page
    const priceElements = document.querySelectorAll('[data-product-price]');
    priceElements.forEach(element => {
      const basePrice = parseFloat(element.dataset.basePrice || element.getAttribute('data-product-price'));
      if (!isNaN(basePrice)) {
        const convertedPrice = (basePrice * conversionRate).toFixed(2);
        element.textContent = `${currentCurrency} ${convertedPrice}`;
        element.dataset.basePrice = basePrice; // Store base price for future conversions
      }
    });
    
    // Convert prices in the .pcard-price elements on catalog page
    const catalogPrices = document.querySelectorAll('.pcard-price');
    catalogPrices.forEach(element => {
      // Extract numeric price from text (assumes format like "$29.99" or "29.99")
      const priceText = element.getAttribute('data-product-price') || element.textContent;
      const basePrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      
      if (!isNaN(basePrice)) {
        const convertedPrice = (basePrice * conversionRate).toFixed(2);
        element.textContent = `${currentCurrency} ${convertedPrice}`;
        if (!element.getAttribute('data-product-price')) {
          element.setAttribute('data-product-price', basePrice);
        }
      }
    });
  }
  
  /**
   * Convert a single price value
   */
  function convertPrice(priceInUSD) {
    if (!rates[currentCurrency]) return priceInUSD;
    return (priceInUSD * rates[currentCurrency]).toFixed(2);
  }
  
  // Public API
  return {
    init,
    convertPrice,
    getCurrentCurrency: () => currentCurrency,
    getRates: () => ({ ...rates, base: 'USD' })
  };
})();

// Initialize currency system on page load
document.addEventListener('DOMContentLoaded', () => {
  CurrencySystem.init();
});

