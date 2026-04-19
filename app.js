// ============================================================
// Sazón de la Nana — Pedidos por WhatsApp
// ============================================================

// 👇 REEMPLAZA por el número de WhatsApp de la Nana (formato internacional, sin "+" ni espacios)
// Ej. España: 34612345678
const WHATSAPP_NUMBER = '34000000000';

const PRODUCTS = {
  'emp-carne':   { name: 'Empanada de carne' },
  'emp-pollo':   { name: 'Empanada de pollo' },
  'arepa-paisa': { name: 'Arepa paisa' },
  'arepa-queso': { name: 'Arepa de queso' },
};

const cart = new Map(); // id -> qty

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ---------- Quantity buttons on cards ----------
$$('.card').forEach(card => {
  const id = card.dataset.id;
  const qtyEl = $('[data-qty]', card);
  $$('.qty-btn', card).forEach(btn => {
    btn.addEventListener('click', () => {
      const current = cart.get(id) || 0;
      const next = btn.dataset.action === 'inc' ? current + 1 : Math.max(0, current - 1);
      if (next === 0) cart.delete(id); else cart.set(id, next);
      qtyEl.textContent = next;
      card.classList.toggle('active', next > 0);
      renderCart();
    });
  });
});

// ---------- Cart rendering ----------
const cartBtn   = $('#cartBtn');
const cartCount = $('#cartCount');
const cartPanel = $('#cartPanel');
const cartList  = $('#cartList');
const backdrop  = $('#backdrop');
const sendBtn   = $('#sendBtn');

function totalItems() {
  let t = 0;
  for (const q of cart.values()) t += q;
  return t;
}

function renderCart() {
  const total = totalItems();
  cartCount.textContent = total;
  cartBtn.hidden = total === 0;

  if (total === 0) {
    cartList.innerHTML = '<li class="cart-empty">Tu pedido está vacío — agrega algo rico 🥟</li>';
    sendBtn.disabled = true;
    return;
  }

  sendBtn.disabled = false;
  cartList.innerHTML = '';
  for (const [id, qty] of cart.entries()) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="item-name">${PRODUCTS[id].name}</span>
      <span class="item-qty">× ${qty}</span>
    `;
    cartList.appendChild(li);
  }
}

// ---------- Cart open/close ----------
function openCart() {
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('show'));
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('show');
  setTimeout(() => { backdrop.hidden = true; }, 250);
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartPanel.classList.contains('open')) closeCart();
});

// ---------- Send order via WhatsApp ----------
sendBtn.addEventListener('click', () => {
  if (totalItems() === 0) return;

  const name  = $('#custName').value.trim();
  const notes = $('#custNotes').value.trim();

  const lines = [];
  lines.push('¡Hola Nana! 👋 Quiero hacer un pedido:');
  lines.push('');
  for (const [id, qty] of cart.entries()) {
    lines.push(`• ${qty} × ${PRODUCTS[id].name}`);
  }
  lines.push('');
  if (name)  lines.push(`Nombre: ${name}`);
  if (notes) lines.push(`Notas: ${notes}`);
  lines.push('');
  lines.push('Pago: Bizum o efectivo al recoger 🙌');
  lines.push('¡Gracias! 💛');

  const text = encodeURIComponent(lines.join('\n'));
  const url  = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, '_blank');
});

// ---------- Initial render ----------
renderCart();
