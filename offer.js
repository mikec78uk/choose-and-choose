// Choose and Choose: shared offer state and builder for the clickable wireframe.
// State lives in localStorage so the PDP, mobile and bag views stay in sync.

const OFFER = {
  required: 2,
  maxGifts: 2,
  products: [
    { id: 'p1', name: 'Protecting Hair Oil', sub: 'Eleo · 50 ml', price: '£11.99', current: true },
    ...Array.from({ length: 9 }, (_, i) => ({ id: 'p' + (i + 2), name: 'Qualifying product ' + (i + 2), sub: '[Brand] · [Size]', price: '£XX.XX' })),
  ],
  gifts: Array.from({ length: 10 }, (_, i) => ({ id: 'g' + (i + 1), name: 'Gift option ' + (i + 1), worth: 'Worth £XX.XX' })),
};

const STORE_KEY = 'choose-and-choose-v1';

function freshState() {
  return { qty: { p1: 1 }, picked: [], step: 1 };
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.qty && Array.isArray(s.picked)) return s;
  } catch (e) { /* storage unavailable */ }
  return freshState();
}

let state = loadState();

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
}

function resetOffer() {
  state = freshState();
  saveState();
}

const totalChosen = () => OFFER.products.reduce((n, p) => n + (state.qty[p.id] || 0), 0);
const isComplete = () => totalChosen() >= OFFER.required;
const remaining = () => Math.max(OFFER.required - totalChosen(), 0);
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

function stripStatus() {
  const total = totalChosen();
  const started = total > 1 || state.picked.length > 0;
  if (!started) return 'Choose from ' + OFFER.products.length + ' products and ' + OFFER.gifts.length + ' gifts · Ends [END DATE]';
  return total + '/' + OFFER.required + ' products · ' + state.picked.length + '/' + OFFER.maxGifts + ' gifts chosen';
}

function setQty(id, delta) {
  const n = (state.qty[id] || 0) + delta;
  if (n < 0 || (delta > 0 && isComplete())) return;
  state.qty[id] = n;
  if (!isComplete()) { state.picked = []; state.step = 1; }
}

function toggleGift(id) {
  if (!isComplete()) return;
  const sel = state.picked.includes(id);
  if (sel) state.picked = state.picked.filter((g) => g !== id);
  else if (state.picked.length < OFFER.maxGifts) state.picked.push(id);
}

// Renders the two-step builder into `panel` and wires its controls.
// opts: { onClose, onChange, bagHref, notes }
function mountBuilder(panel, opts) {
  const note = (n) => (opts.notes ? '<span class="note" aria-hidden="true">' + n + '</span>' : '');
  let detail = null; // 'p:<id>' or 'g:<id>' while a details view is open
  let listScroll = 0;

  function stepper(p, n, complete) {
    return '<div class="stepper">' +
      '<button type="button" data-qty="' + p.id + '" data-delta="-1" aria-label="Remove one ' + p.name + '"' + (n === 0 ? ' disabled' : '') + '>−</button>' +
      '<span aria-live="polite">' + n + '</span>' +
      '<button type="button" data-qty="' + p.id + '" data-delta="1" aria-label="Add one ' + p.name + '"' + (complete ? ' disabled' : '') + '>+</button>' +
      '</div>';
  }

  // Product / gift details shown inside the drawer or sheet, so the customer never loses their offer.
  function renderDetail(key, complete) {
    const [kind, id] = key.split(':');
    const isGift = kind === 'g';
    const item = (isGift ? OFFER.gifts : OFFER.products).find((x) => x.id === id);
    let html = '<button type="button" class="back-btn" data-back><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>Back to ' + (isGift ? 'gifts' : 'products') + '</button>';
    html += '<div class="detail">' + note(5) +
      '<div class="ph detail-image">' + (isGift ? 'GIFT IMAGE' : 'PRODUCT IMAGE') + '</div>' +
      '<div class="detail-thumbs"><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>';
    if (isGift) {
      html += '<span class="brand">[BRAND]</span><h3 class="detail-name">' + item.name + '</h3>' +
        '<span class="sub">' + item.worth + ' · <span class="free">FREE with this offer</span></span>' +
        '<p class="detail-copy">[Short gift description: what it is, size, why customers will love it.]</p>';
    } else {
      html += '<span class="brand">' + item.sub.split(' · ')[0].toUpperCase() + '</span><h3 class="detail-name">' + item.name + '</h3>' +
        '<span class="sub">★★★★★ (ratings) · ' + (item.sub.split(' · ')[1] || '') + '</span>' +
        '<span class="detail-price">' + item.price + '</span>' +
        '<p class="detail-copy">' + (item.current ? 'Rich hair oil that nourishes and protects dry, damaged or coloured hair.' : '[Short product description from the PDP.]') + '</p>' +
        '<ul class="benefits"><li>[Key benefit 1]</li><li>[Key benefit 2]</li><li>[Key benefit 3]</li></ul>';
    }
    html += '<details><summary>HOW TO USE</summary><p class="detail-copy">[How to use copy]</p></details>' +
      '<details><summary>INGREDIENTS</summary><p class="detail-copy">[Ingredients list]</p></details>' +
      (isGift ? '' : '<a href="#full-pdp" class="detail-link">View full product page ↗</a>');

    if (isGift) {
      const sel = state.picked.includes(id);
      const atLimit = !sel && state.picked.length >= OFFER.maxGifts;
      html += '<button type="button" class="' + (sel || atLimit ? 'btn-outline' : 'btn-primary') + '" data-gift="' + id + '"' + (atLimit ? ' disabled' : '') + '>' +
        (sel ? 'REMOVE THIS GIFT' : atLimit ? 'GIFT LIMIT REACHED' : 'CHOOSE THIS GIFT') + '</button>';
    } else {
      const n = state.qty[id] || 0;
      html += '<div class="detail-action"><span>In your offer</span>' + stepper(item, n, complete) + '</div>';
    }
    return html + '</div>';
  }

  function render() {
    const total = totalChosen();
    const complete = isComplete();
    const step = complete ? state.step : 1;
    const ready = complete && state.picked.length >= 1;

    let body = '';
    if (detail) {
      body = renderDetail(detail, complete);
    } else if (step === 1) {
      body += '<div class="row-head"><h3>' + note(2) + ' Choose any ' + OFFER.required + ' products</h3><span>' + total + ' / ' + OFFER.required + '</span></div>';
      body += '<p class="hint">The same product twice counts. Tap a product to see its details.</p>';
      body += OFFER.products.map((p) => {
        const n = state.qty[p.id] || 0;
        return '<div class="product-row' + (n ? ' chosen' : '') + '">' +
          '<button type="button" class="row-link" data-detail="p:' + p.id + '" aria-label="View details: ' + p.name + '">' +
          '<span class="ph"></span>' +
          '<span class="info"><span class="name">' + p.name + (p.current ? ' (this product)' : '') + '</span><span class="sub">' + p.sub + ' · ' + p.price + '</span>' +
          '<span class="more">View details</span></span></button>' +
          stepper(p, n, complete) + '</div>';
      }).join('');
    } else {
      const chosen = OFFER.products.filter((p) => state.qty[p.id] > 0);
      body += '<div class="chosen-box"><div class="row-head"><span>Your ' + OFFER.required + ' products</span><button type="button" class="link-btn" data-step="1">Edit</button></div>' +
        chosen.map((p) => '<span class="item">' + state.qty[p.id] + ' × ' + p.name + '</span>').join('') + '</div>';
      body += '<div class="row-head"><h3>' + note(3) + ' Choose your free gift</h3><span>' + state.picked.length + ' / ' + OFFER.maxGifts + ' chosen</span></div>';
      body += '<div class="gift-grid">' + OFFER.gifts.map((g) => {
        const sel = state.picked.includes(g.id);
        const disabled = !sel && state.picked.length >= OFFER.maxGifts;
        return '<div class="gift-card"><button type="button" class="gift" data-gift="' + g.id + '" aria-pressed="' + sel + '"' + (disabled ? ' disabled' : '') + '>' +
          '<span class="ph">GIFT IMAGE<span class="check" aria-hidden="true">' + (sel ? '✓' : '') + '</span></span>' +
          '<span class="name">' + g.name + '</span><span class="sub">' + g.worth + ' · <span class="free">FREE</span></span></button>' +
          '<button type="button" class="link-btn" data-detail="g:' + g.id + '" aria-label="View details: ' + g.name + '">View details</button></div>';
      }).join('') + '</div>';
    }
    if (!detail) body += '<a href="#terms" class="hint">Offer terms &amp; conditions</a>';

    let cta;
    if (step === 1 && complete) cta = '<button type="button" class="btn-primary" data-step="2">NEXT: CHOOSE YOUR GIFT</button>';
    else if (step === 2 && ready) cta = '<a class="btn-primary" href="' + opts.bagHref + '">ADD OFFER TO BAG</a>';
    else cta = '<button type="button" class="btn-disabled" disabled>' + (step === 1 ? 'CHOOSE ' + remaining() + ' MORE PRODUCT' : 'CHOOSE AT LEAST 1 GIFT') + '</button>';

    const prevBody = panel.querySelector('.panel-body');
    const keepScroll = prevBody ? prevBody.scrollTop : 0;
    panel.innerHTML =
      (opts.sheet ? '<div class="grabber"><span></span></div>' : '') +
      '<div class="panel-head"><div class="titles"><span class="tag">CHOOSE &amp; CHOOSE</span><h2 id="builder-title">Build your offer</h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="steps">' +
      '<button type="button" data-step="1"' + (step === 1 ? ' aria-current="step"' : '') + '><span class="bar"></span>1 · CHOOSE ' + OFFER.required + ' PRODUCTS ' + (complete ? '✓' : '') + '</button>' +
      '<button type="button" data-step="2"' + (step === 2 ? ' aria-current="step"' : '') + (complete ? '' : ' disabled') + '><span class="bar"></span>2 · CHOOSE YOUR GIFT</button>' +
      '</div>' +
      '<div class="panel-body">' + body + '</div>' +
      '<div class="panel-foot">' + note(4) +
      '<div class="sum"><span>' + plural(total, 'product') + ' + ' + plural(state.picked.length, 'free gift') + '</span><span>[OFFER TOTAL]</span></div>' + cta + '</div>';
    panel.querySelector('.panel-body').scrollTop = keepScroll;
  }

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.hasAttribute('data-close')) { detail = null; opts.onClose(); return; }
    const body = panel.querySelector('.panel-body');
    if (t.dataset.detail) {
      listScroll = body.scrollTop;
      detail = t.dataset.detail;
      render();
      panel.querySelector('.panel-body').scrollTop = 0;
      panel.querySelector('[data-back]').focus();
      return;
    }
    if (t.hasAttribute('data-back')) {
      detail = null;
      render();
      panel.querySelector('.panel-body').scrollTop = listScroll;
      return;
    }
    if (t.dataset.step) detail = null;
    if (t.dataset.qty) setQty(t.dataset.qty, Number(t.dataset.delta));
    else if (t.dataset.gift) toggleGift(t.dataset.gift);
    else if (t.dataset.step) { if (t.dataset.step === '1' || isComplete()) state.step = Number(t.dataset.step); }
    else return;
    saveState();
    render();
    if (opts.onChange) opts.onChange();
  });

  render();
  return { render };
}

// Wires an offer strip + overlay pair on a PDP view.
function initPdp({ stripId, overlayId, panelId, statusId, bagHref, sheet }) {
  const strip = document.getElementById(stripId);
  const overlay = document.getElementById(overlayId);
  const panel = document.getElementById(panelId);
  const status = document.getElementById(statusId);
  const notes = true; // annotation markers; hidden via CSS when toggled off
  const updateStatus = () => { status.textContent = stripStatus(); };

  const open = () => { overlay.hidden = false; builder.render(); panel.querySelector('[data-close]').focus(); };
  const close = () => { overlay.hidden = true; strip.focus(); };
  const builder = mountBuilder(panel, { onClose: close, onChange: updateStatus, bagHref, notes, sheet });

  strip.addEventListener('click', open);
  overlay.querySelector('.backdrop').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
  updateStatus();
  if (new URLSearchParams(location.search).get('offer') === 'open') open();
}

// Prototype toolbar: view switcher, annotation toggle and reset.
function initProtoBar() {
  const bar = document.querySelector('.proto-bar');
  if (!bar) return;
  try { if (localStorage.getItem(STORE_KEY + '-notes') === 'off') document.body.classList.add('notes-off'); } catch (e) { /* ignore */ }
  bar.querySelector('[data-notes]').addEventListener('click', () => {
    const off = document.body.classList.toggle('notes-off');
    try { localStorage.setItem(STORE_KEY + '-notes', off ? 'off' : 'on'); } catch (e) { /* ignore */ }
  });
  bar.querySelector('[data-reset]').addEventListener('click', () => { resetOffer(); location.href = location.pathname; });
}
