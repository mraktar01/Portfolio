// ============================================================
//  script.js — SHOHEB PORTFOLIO
//  Handles: page routing, typing animation, scroll reveal,
//           portfolio filter, EmailJS form submission,
//           WhatsApp & Telegram direct contact buttons.
//
//  ⚡ SETUP CHECKLIST:
//  1. Fill in config.js with your EmailJS keys + phone numbers
//  2. Add <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js">
//     in index.html <head> (already included)
//  3. In your EmailJS dashboard, name the template variables:
//     {{from_name}}, {{from_email}}, {{phone}},
//     {{service}}, {{budget}}, {{message}}
// ============================================================

// ── WAIT FOR DOM ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── EMAILJS INIT ────────────────────────────────────────
  // Reads your public key from config.js
  if (typeof emailjs !== 'undefined' && CONFIG.EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE') {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  } else if (typeof emailjs === 'undefined') {
    console.warn('⚠️  EmailJS library not loaded. Check the <script> tag in index.html.');
  } else {
    console.info('ℹ️  EmailJS not configured yet. Fill in config.js to enable email sending.');
  }

  // ── WHATSAPP & TELEGRAM BUTTONS ─────────────────────────
  buildDirectContactButtons();

  // ── NAVBAR SCROLL ───────────────────────────────────────
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')
      .classList.toggle('scrolled', window.scrollY > 30);
  });

  // ── TYPING ANIMATION ────────────────────────────────────
  startTypingAnimation();

  // ── SCROLL REVEAL ───────────────────────────────────────
  initReveal();

});

// ── PAGE ROUTING ──────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(name);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(initReveal, 100);
}

// ── HAMBURGER MENU ────────────────────────────────────────
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── TYPING ANIMATION ──────────────────────────────────────
function startTypingAnimation() {
  const words  = ['Tech Enthusiast', 'Web Developer', 'Hardware Specialist', 'Data Professional'];
  const el     = document.getElementById('typed-text');
  let wIdx     = 0;
  let cIdx     = 0;
  let deleting = false;

  if (!el) return;

  function tick() {
    const word = words[wIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++cIdx);
      if (cIdx === word.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      el.textContent = word.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
      }
    }
    setTimeout(tick, deleting ? 55 : 85);
  }
  tick();
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal:not(.visible)')
    .forEach(el => observer.observe(el));
}

// ── PORTFOLIO FILTER ──────────────────────────────────────
function filterPF(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pf-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
  });
}

// ── TOAST HELPER ──────────────────────────────────────────
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.remove('error'), 400);
  }, 4500);
}

// ── CONTACT FORM — EMAIL SUBMISSION ───────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');

  // Validate EmailJS config
  if (
    CONFIG.EMAILJS_PUBLIC_KEY  === 'YOUR_PUBLIC_KEY_HERE'  ||
    CONFIG.EMAILJS_SERVICE_ID  === 'YOUR_SERVICE_ID_HERE'  ||
    CONFIG.EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID_HERE'
  ) {
    showToast('⚠️ Email not configured yet. See config.js', true);
    return;
  }

  // Loading state
  const originalText = btn.textContent;
  btn.textContent    = 'Sending…';
  btn.disabled       = true;

  // Build template params from form field names
  const templateParams = {
    from_name : form.querySelector('[name="from_name"]')?.value  || '',
    from_email: form.querySelector('[name="from_email"]')?.value || '',
    phone     : form.querySelector('[name="phone"]')?.value      || 'Not provided',
    service   : form.querySelector('[name="service"]')?.value    || '',
    budget    : form.querySelector('[name="budget"]')?.value     || 'Not specified',
    message   : form.querySelector('[name="message"]')?.value    || '',
  };

  emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      showToast('✓ Message sent! I\'ll get back to you within 24 hours.');
      form.reset();
      btn.textContent = originalText;
      btn.disabled    = false;
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      showToast('✗ Something went wrong. Please try WhatsApp or email directly.', true);
      btn.textContent = originalText;
      btn.disabled    = false;
    });
}

// ── WHATSAPP & TELEGRAM DIRECT CONTACT ────────────────────
//  Dynamically builds the buttons using values from config.js
//  Injects them into every element with class "direct-contact-slot"
function buildDirectContactButtons() {
  const slots = document.querySelectorAll('.direct-contact-slot');
  if (!slots.length) return;

  const waNumber  = CONFIG.WHATSAPP_NUMBER  || '91XXXXXXXXXX';
  const waMessage = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE || 'Hi Shoheb!');
  const tgUser    = CONFIG.TELEGRAM_USERNAME || 'your_telegram_username';

  const html = `
    <div class="direct-contact-row">
      <span class="direct-contact-label">Or reach me instantly via</span>
      <a  class="btn-whatsapp"
          href="https://wa.me/${waNumber}?text=${waMessage}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>
      <a  class="btn-telegram"
          href="https://t.me/${tgUser}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message on Telegram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        Telegram
      </a>
    </div>
  `;

  slots.forEach(slot => { slot.innerHTML = html; });
}
