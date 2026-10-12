// Choose and Choose, unified PDP version. One "Unlock your gift" box in the buy box for
// every offer; only its contents change with the amount of choice:
//   ?s=1  This product only, a few gifts   -> gift tiles in the box
//   ?s=2  Several products, one gift       -> product carousel in the box, gift automatic
//   ?s=3  Several products, several gifts  -> summary in the box, drawer to choose
// Rules shared by all three: adding a product always goes straight to the basket, the
// slots count what's really in the basket, and gifts are chosen (or reserved) at any time.
// Loaded after offer.js (reuses OFFER's product data and shared styles).

const SC = (() => {
  const s = new URLSearchParams(location.search).get('s');
  return s === '2' ? 2 : s === '3' ? 3 : 1;
})();

const makeGifts = (n) => Array.from({ length: n }, (_, i) => ({ id: 'g' + (i + 1), name: 'Gift option ' + (i + 1), brand: '[BRAND]', worth: 'Worth £XX.XX' }));
const SCENARIOS = {
  1: { required: 2, maxGifts: 1, products: OFFER.products.slice(0, 1), gifts: makeGifts(4), start: {} },
  2: { required: 2, maxGifts: 1, products: OFFER.products.slice(0, 6), gifts: [{ id: 'gift', name: '[Gift name]', brand: '[BRAND]', worth: 'Worth £XX.XX' }], start: { p4: 1 } },
  3: { required: 2, maxGifts: 2, products: OFFER.products, gifts: makeGifts(10), start: { p6: 1 } },
};
const CFG = SCENARIOS[SC];
const AUTO_GIFT = CFG.gifts.length === 1;
const THIS = OFFER.products[0];
const UNIFIED_KEY = 'choose-and-choose-unified-v1';

function freshUnified() {
  const o = {};
  [1, 2, 3].forEach((n) => { o[n] = { items: { ...SCENARIOS[n].start }, gifts: [], qty: 1 }; });
  return o;
}
function loadUnified() {
  try {
    const s = JSON.parse(localStorage.getItem(UNIFIED_KEY));
    if (s && s[1] && s[2] && s[3]) return s;
  } catch (e) { /* storage unavailable */ }
  return freshUnified();
}
let ALL = loadUnified();
const basket = () => ALL[SC];
function saveUnified() {
  try { localStorage.setItem(UNIFIED_KEY, JSON.stringify(ALL)); } catch (e) { /* storage unavailable */ }
}

const offerCount = () => CFG.products.reduce((n, p) => n + (basket().items[p.id] || 0), 0);
const isUnlocked = () => offerCount() >= CFG.required;
const claimedGifts = () => (AUTO_GIFT ? [CFG.gifts[0].id] : basket().gifts);
const giftById = (id) => CFG.gifts.find((g) => g.id === id);
const productById = (id) => CFG.products.find((p) => p.id === id);
const basketCount = () => Object.values(basket().items).reduce((a, b) => a + b, 0) + (isUnlocked() ? claimedGifts().length : 0);

function addItem(id, n) {
  basket().items[id] = (basket().items[id] || 0) + (n || 1);
}
function removeItem(id) {
  const b = basket();
  if (!b.items[id]) return;
  b.items[id] -= 1;
  if (!b.items[id]) delete b.items[id];
}
function toggleGift(id) {
  const b = basket();
  if (b.gifts.includes(id)) b.gifts = b.gifts.filter((g) => g !== id);
  else if (CFG.maxGifts === 1) b.gifts = [id];
  else if (b.gifts.length < CFG.maxGifts) b.gifts.push(id);
}

// ---------- Shared pieces ----------

const ICON = {
  heart: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bag: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  close: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>',
};

const giftHeadline = () => (SC === 1 ? 'Choose a FREE gift' : SC === 2 ? 'FREE ' + CFG.gifts[0].name : 'Choose up to ' + CFG.maxGifts + ' FREE gifts');
const giftCondition = () => (SC === 1 ? 'when you buy ' + CFG.required + ' ' + THIS.name
  : SC === 2 ? 'when you buy any ' + CFG.required + ' of the products below'
  : 'when you buy any ' + CFG.required + ' of the selected products');

// [item] + [item] = [gift]: filled from what's actually in the basket.
function slotsHtml() {
  const filled = [];
  CFG.products.forEach((p) => { for (let i = 0; i < (basket().items[p.id] || 0); i++) filled.push(p); });
  const unlocked = isUnlocked();
  let html = '';
  for (let i = 0; i < CFG.required; i++) {
    const p = filled[i];
    html += (i ? '<span class="slot-op">+</span>' : '') +
      (p ? '<span class="slot filled" title="' + p.name + '">' + (p.current ? 'THIS' : 'ITEM') + '<span class="slot-tick">✓</span></span>' : '<span class="slot">?</span>');
  }
  html += '<span class="slot-op">=</span><span class="slot gift' + (unlocked ? ' filled' : '') + '">GIFT' + (unlocked ? '<span class="slot-tick">✓</span>' : '') + '</span>';
  return '<div class="slots" role="img" aria-label="' + Math.min(offerCount(), CFG.required) + ' of ' + CFG.required + ' qualifying items in your basket">' + html + '</div>';
}

function statusHtml() {
  const c = offerCount();
  const left = CFG.required - c;
  const gifts = claimedGifts();
  let cls = '', text;
  if (!isUnlocked()) {
    text = c + ' of ' + CFG.required + ' in your basket · add ' + left + ' more to unlock';
    if (!AUTO_GIFT && gifts.length) text += '. Your gift is reserved.';
  } else if (AUTO_GIFT) {
    cls = 'ok'; text = '✓ Unlocked. Your gift is in your basket free.';
  } else if (!gifts.length) {
    cls = 'todo'; text = '✓ Unlocked. Now choose your free gift' + (CFG.maxGifts > 1 ? 's' : '') + '.';
  } else {
    cls = 'ok'; text = '✓ Unlocked. ' + (gifts.length === 1 ? giftById(gifts[0]).name + ' is' : gifts.length + ' gifts are') + ' in your basket free.';
  }
  return '<span class="unlock-status ' + cls + '" aria-live="polite">' + text + '</span>';
}

function badgesFor(p) {
  const n = basket().items[p.id] || 0;
  const out = [];
  if (p.current) out.push('<span class="card-badge dark">YOU’RE VIEWING</span>');
  if (n) out.push('<span class="card-badge ok">✓ IN BASKET' + (n > 1 ? ' ×' + n : '') + '</span>');
  return out.join('');
}

// Gift tile with an explicit Choose control (scenario 1 box, scenario 3 drawer).
function giftTile(g) {
  const sel = basket().gifts.includes(g.id);
  const full = !sel && CFG.maxGifts > 1 && basket().gifts.length >= CFG.maxGifts;
  return '<li class="gtile' + (sel ? ' chosen' : '') + '">' +
    '<span class="ph gtile-img">GIFT IMAGE</span>' +
    '<span class="gtile-name">' + g.name + '</span>' +
    '<span class="gtile-worth"><span class="free">FREE</span> · ' + g.worth + '</span>' +
    '<button type="button" class="choose-btn" data-gift="' + g.id + '" aria-pressed="' + sel + '"' + (full ? ' disabled' : '') + ' aria-label="' + (sel ? 'Remove gift: ' : 'Choose gift: ') + g.name + '">' + (sel ? '✓ Chosen' : full ? 'Limit reached' : 'Choose') + '</button>' +
    '<button type="button" class="link-btn" data-detail="g:' + g.id + '" aria-label="Details: ' + g.name + '">Details</button>' +
    '</li>';
}

// Product card in the scenario 2 carousel (Choose and Get anatomy).
function productCard(p) {
  const n = basket().items[p.id] || 0;
  return '<li class="card' + (p.current ? ' viewing' : '') + (n ? ' in-basket' : '') + '">' +
    '<div class="card-media"><div class="card-badges">' + badgesFor(p) + '</div>IMAGE' +
    '<div class="card-actions">' +
    '<button type="button" class="round" aria-label="Add ' + p.name + ' to wishlist">' + ICON.heart + '</button>' +
    '<button type="button" class="round" data-add="' + p.id + '" aria-label="' + (n ? 'Add another ' : 'Add ') + p.name + ' to basket">' + ICON.bag + '</button></div></div>' +
    '<div class="stars" aria-label="Rated 4 out of 5">★★★★<span class="dim">★</span> <span class="count">(15)</span></div>' +
    '<span class="card-brand">' + p.sub.split(' · ')[0].toUpperCase() + '</span>' +
    '<button type="button" class="card-name" data-detail="p:' + p.id + '">' + p.name + '</button>' +
    '<span class="card-price">' + p.price + '</span></li>';
}

const rankProduct = (p) => (p.current ? 0 : basket().items[p.id] ? 1 : 2);
const orderedProducts = () => CFG.products.slice().sort((a, b) => rankProduct(a) - rankProduct(b));

// ---------- The page ----------

// opts: { overlayId, panelId }
function initUnified(opts) {
  const box = document.getElementById('unlock');
  const offerLine = document.getElementById('offer-line');
  const qtyBox = document.getElementById('qty');
  const buy = document.getElementById('buy');
  const toast = document.getElementById('toast');
  const overlay = document.getElementById(opts.overlayId);
  const panel = document.getElementById(opts.panelId);
  const badge = document.getElementById('bag-count');
  const ui = { open: false, mode: null, detail: null, listScroll: 0 };
  let toastTimer = null;

  function showToast(msg) {
    toast.innerHTML = '<span>' + msg + '</span><a href="bag.html?s=' + SC + '">View basket</a>';
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  }

  function renderBuyBox() {
    const c = offerCount();
    offerLine.innerHTML = '<span class="tag">OFFER</span><span>Buy ' + (SC === 1 ? CFG.required : 'any ' + CFG.required) + ', get a free gift</span>' +
      '<a href="#unlock">' + (isUnlocked() ? 'Unlocked ✓' : Math.min(c, CFG.required) + '/' + CFG.required + ' in basket') + '</a>';
    const q = basket().qty;
    qtyBox.innerHTML = '<button type="button" data-q="-1" aria-label="Decrease quantity"' + (q <= 1 ? ' disabled' : '') + '>−</button><span aria-live="polite">' + q + '</span><button type="button" data-q="1" aria-label="Increase quantity">+</button>';
    const n = basketCount();
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  function renderBox() {
    const strip = box.querySelector('.cards');
    const x = strip ? strip.scrollLeft : 0;
    const unlocked = isUnlocked();
    let body = '';

    if (SC === 1) {
      body = '<div class="unlock-section"><div class="unlock-section-head"><span>Choose ' + CFG.maxGifts + ' gift</span><span class="muted">' + basket().gifts.length + '/' + CFG.maxGifts + '</span></div>' +
        '<ul class="gtiles">' + CFG.gifts.map(giftTile).join('') + '</ul></div>';
    } else if (SC === 2) {
      body = '<div class="unlock-list-head"><span>When you purchase any ' + CFG.required + ' of the following</span>' +
        '<div class="arrows"><button type="button" class="arrow" data-scroll="-1" aria-label="Previous">‹</button><button type="button" class="arrow" data-scroll="1" aria-label="Next">›</button></div></div>' +
        '<ul class="cards compact">' + orderedProducts().map(productCard).join('') + '</ul>';
    } else {
      const gifts = basket().gifts.map(giftById);
      const inBasket = CFG.products.filter((p) => basket().items[p.id]);
      body = '<div class="unlock-section unlock-summary">' +
        '<div class="sum-row"><span class="sum-label">Products</span><span>' + (inBasket.length ? inBasket.map((p) => (basket().items[p.id] > 1 ? basket().items[p.id] + ' × ' : '') + p.name).join(', ') : 'None yet') + '</span></div>' +
        '<div class="sum-row"><span class="sum-label">Gifts</span><span>' + (gifts.length ? gifts.map((g) => g.name).join(', ') : 'Choose up to ' + CFG.maxGifts + ' from ' + CFG.gifts.length) + '</span></div>' +
        '<div class="gift-peek" aria-hidden="true">' + CFG.gifts.slice(0, 5).map(() => '<span class="ph"></span>').join('') + '<span class="peek-more">+' + (CFG.gifts.length - 5) + '</span></div>' +
        '<button type="button" class="btn-outline" data-open-drawer>' + (unlocked && !gifts.length ? 'CHOOSE YOUR GIFTS' : 'CHOOSE PRODUCTS &amp; GIFTS') + '</button></div>';
    }

    box.innerHTML =
      '<h2 class="unlock-title" id="unlock-title"><span class="note" aria-hidden="true">' + (5 + SC) + '</span>Unlock your gift</h2>' +
      '<div class="unlock-box' + (unlocked ? ' done' : '') + '">' +
        '<div class="unlock-gift">' +
          '<div class="ph unlock-gift-img">' + (SC === 2 ? 'GIFT IMAGE' : CFG.gifts.length + ' GIFTS') + '</div>' +
          '<div class="unlock-gift-copy"><strong>' + giftHeadline() + '</strong><span>' + giftCondition() + '</span>' +
            slotsHtml() + statusHtml() +
            (SC === 2 ? '<button type="button" class="link-btn" data-detail="g:gift">Gift details</button>' : '') +
          '</div>' +
        '</div>' + body +
      '</div>' +
      '<a href="#terms" class="io-terms">Offer terms &amp; conditions · Ends [END DATE]</a>';

    const newStrip = box.querySelector('.cards');
    if (newStrip) { newStrip.scrollLeft = x; updateArrows(); }
  }

  function updateArrows() {
    const strip = box.querySelector('.cards');
    if (!strip) return;
    const [prev, next] = box.querySelectorAll('.arrow');
    prev.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
  }

  // ----- Overlay: details (scenarios 1-2) or the drawer (scenario 3) -----

  function detailHtml(key) {
    const [kind, id] = key.split(':');
    const isGift = kind === 'g';
    const item = isGift ? giftById(id) : productById(id);
    let foot;
    if (isGift && AUTO_GIFT) {
      foot = '<p class="hint">Added to your basket automatically when you buy any ' + CFG.required + ' of the selected products.</p>';
    } else if (isGift) {
      const sel = basket().gifts.includes(id);
      const full = !sel && CFG.maxGifts > 1 && basket().gifts.length >= CFG.maxGifts;
      foot = '<button type="button" class="' + (sel ? 'btn-outline' : 'btn-primary') + '" data-gift="' + id + '"' + (full ? ' disabled' : '') + '>' +
        (sel ? 'REMOVE THIS GIFT' : full ? 'GIFT LIMIT REACHED' : 'CHOOSE THIS GIFT') + '</button>';
    } else {
      const n = basket().items[id] || 0;
      foot = '<div class="detail-action"><span>In your basket</span><div class="stepper">' +
        '<button type="button" data-remove="' + id + '" aria-label="Remove one ' + item.name + '"' + (n ? '' : ' disabled') + '>−</button><span>' + n + '</span>' +
        '<button type="button" data-add="' + id + '" aria-label="Add one ' + item.name + '">+</button></div></div>';
    }
    const body = '<div class="detail">' +
      (ui.mode === 'drawer' ? '<button type="button" class="back-btn" data-back>' + ICON.back + 'Back to ' + (isGift ? 'gifts' : 'products') + '</button>' : '') +
      '<div class="ph detail-image">' + (isGift ? 'GIFT IMAGE' : 'PRODUCT IMAGE') + '</div>' +
      '<div class="detail-thumbs"><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>' +
      (isGift
        ? '<span class="brand">' + item.brand + '</span><h3 class="detail-name">' + item.name + '</h3><span class="sub">' + item.worth + ' · <span class="free">FREE with this offer</span></span><p class="detail-copy">[Short gift description: what it is, size, why customers will love it.]</p>'
        : '<span class="brand">' + item.sub.split(' · ')[0].toUpperCase() + '</span><h3 class="detail-name">' + item.name + '</h3>' + (badgesFor(item) ? '<div class="card-badges inline">' + badgesFor(item) + '</div>' : '') +
          '<span class="detail-price">' + item.price + '</span><p class="detail-copy">[Short product description from the PDP.]</p><ul class="benefits"><li>[Key benefit 1]</li><li>[Key benefit 2]</li></ul>') +
      '<details><summary>HOW TO USE</summary><p class="detail-copy">[How to use copy]</p></details>' +
      '<details><summary>INGREDIENTS</summary><p class="detail-copy">[Ingredients list]</p></details>' +
      (isGift || item.current ? '' : '<a href="#full-pdp" class="detail-link">View full product page ↗</a>') +
      '</div>';
    return { title: item.name, tag: isGift ? 'FREE GIFT' : 'OFFER PRODUCT', body, foot };
  }

  function drawerHtml() {
    const rows = orderedProducts().map((p) => {
      const n = basket().items[p.id] || 0;
      return '<div class="product-row' + (p.current ? ' viewing' : '') + (n ? ' in-basket' : '') + '">' +
        '<button type="button" class="row-link" data-detail="p:' + p.id + '" aria-label="Details: ' + p.name + '"><span class="ph"></span>' +
        '<span class="info"><span class="row-badges">' + badgesFor(p) + '</span><span class="name">' + p.name + '</span><span class="sub">' + p.sub + ' · ' + p.price + '</span><span class="more">View details</span></span></button>' +
        '<div class="stepper"><button type="button" data-remove="' + p.id + '" aria-label="Remove one ' + p.name + ' from basket"' + (n ? '' : ' disabled') + '>−</button>' +
        '<span aria-live="polite">' + n + '</span><button type="button" data-add="' + p.id + '" aria-label="Add one ' + p.name + ' to basket">+</button></div></div>';
    }).join('');
    const body =
      '<div class="unlock-gift drawer-progress"><div class="unlock-gift-copy"><strong>' + giftHeadline() + '</strong><span>' + giftCondition() + '</span>' + slotsHtml() + statusHtml() + '</div></div>' +
      '<div class="row-head"><h3>1 · Choose any ' + CFG.required + ' products</h3><span>' + Math.min(offerCount(), CFG.required) + ' / ' + CFG.required + '</span></div>' +
      '<p class="hint">Products are added straight to your basket. Items already in your basket count.</p>' + rows +
      '<div class="row-head" style="margin-top:12px"><h3>2 · Choose up to ' + CFG.maxGifts + ' free gifts</h3><span>' + basket().gifts.length + ' / ' + CFG.maxGifts + '</span></div>' +
      '<p class="hint">' + (isUnlocked() ? 'Your gifts are added to your basket free.' : 'You can choose now; your gifts are reserved until you have ' + CFG.required + ' products.') + '</p>' +
      '<ul class="gtiles drawer-gifts">' + CFG.gifts.map(giftTile).join('') + '</ul>';
    const foot = statusHtml() + '<div class="foot-actions"><a class="btn-outline" href="bag.html?s=' + SC + '">VIEW BASKET</a><button type="button" class="btn-primary" data-close>DONE</button></div>';
    return { title: 'Build your offer', tag: 'CHOOSE &amp; CHOOSE', body, foot };
  }

  function renderPanel() {
    if (!ui.open) return;
    const prevBody = panel.querySelector('.panel-body');
    const keep = prevBody ? prevBody.scrollTop : 0;
    const v = ui.detail ? detailHtml(ui.detail) : drawerHtml();
    panel.innerHTML =
      '<div class="grabber"><span></span></div>' +
      '<div class="panel-head"><div class="titles"><span class="tag">' + v.tag + '</span><h2 id="u-panel-title">' + v.title + '</h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close">' + ICON.close + '</button></div>' +
      '<div class="panel-body" style="padding-top:16px">' + v.body + '</div>' +
      (v.foot ? '<div class="panel-foot">' + v.foot + '</div>' : '');
    panel.querySelector('.panel-body').scrollTop = keep;
  }

  function openPanel(mode, detail) {
    ui.open = true; ui.mode = mode; ui.detail = detail || null;
    overlay.hidden = false;
    renderPanel();
    panel.querySelector('.panel-body').scrollTop = 0;
    panel.querySelector('[data-close]').focus();
  }
  function closePanel() {
    ui.open = false; ui.detail = null;
    overlay.hidden = true;
  }

  function renderAll() {
    renderBuyBox();
    renderBox();
    renderPanel();
  }

  // ----- Actions (one handler for the box, the panel and the buy box) -----

  function handle(t) {
    const before = isUnlocked();
    if (t.dataset.scroll) {
      const strip = box.querySelector('.cards');
      strip.scrollBy({ left: Number(t.dataset.scroll) * strip.clientWidth * 0.8, behavior: 'smooth' });
      return;
    }
    if (t.hasAttribute('data-open-drawer')) { openPanel('drawer'); return; }
    if (t.hasAttribute('data-close')) { closePanel(); return; }
    if (t.hasAttribute('data-back')) {
      ui.detail = null; renderPanel();
      panel.querySelector('.panel-body').scrollTop = ui.listScroll;
      return;
    }
    if (t.dataset.detail) {
      if (ui.open && ui.mode === 'drawer') {
        ui.listScroll = panel.querySelector('.panel-body').scrollTop;
        ui.detail = t.dataset.detail; renderPanel();
        panel.querySelector('.panel-body').scrollTop = 0;
      } else openPanel('detail', t.dataset.detail);
      return;
    }
    let msg = null;
    if (t.dataset.add) {
      const p = productById(t.dataset.add);
      addItem(p.id, 1);
      msg = 'Added to basket: ' + p.name;
    } else if (t.dataset.remove) {
      removeItem(t.dataset.remove);
    } else if (t.dataset.gift) {
      const had = basket().gifts.includes(t.dataset.gift);
      toggleGift(t.dataset.gift);
      if (!had) msg = isUnlocked() ? 'Gift added to your basket free' : 'Gift reserved: it’s added once you have ' + CFG.required + ' in your basket';
      if (ui.mode === 'detail') closePanel();
    } else if (t.dataset.q) {
      basket().qty = Math.max(1, basket().qty + Number(t.dataset.q));
    } else return;
    if (!before && isUnlocked()) msg = (msg ? msg + ' · ' : '') + 'Free gift unlocked ✓';
    saveUnified();
    renderAll();
    if (msg) showToast(msg);
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (!box.contains(t) && !panel.contains(t) && !qtyBox.contains(t)) return;
    handle(t);
  });
  box.addEventListener('scroll', updateArrows, true);
  overlay.querySelector('.backdrop').addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ui.open) closePanel(); });

  buy.addEventListener('click', () => {
    const before = isUnlocked();
    const q = basket().qty;
    addItem(THIS.id, q);
    basket().qty = 1;
    saveUnified();
    renderAll();
    showToast('Added to basket: ' + (q > 1 ? q + ' × ' : '') + THIS.name + (!before && isUnlocked() ? ' · Free gift unlocked ✓' : ''));
  });

  renderAll();
  if (SC === 3 && new URLSearchParams(location.search).get('offer') === 'open') openPanel('drawer');
}
