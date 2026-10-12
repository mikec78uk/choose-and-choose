// Choose and Choose, on-page version: for small offers (a few qualifying products and a
// few gifts) both steps sit on the PDP as a compact module between the price and BUY.
// Loaded after offer.js (reuses OFFER's product data and the overlay styles).
// ?products=1 shows the case where this product is the only qualifying product (buy 2 of it).

const INLINE = (() => {
  const n = Math.min(Math.max(Number(new URLSearchParams(location.search).get('products')) || 3, 1), 4);
  return {
    required: 2,
    maxGifts: 1,
    products: OFFER.products.slice(0, n),
    gifts: [
      { id: 'a', name: 'Gift option A', worth: 'Worth £XX.XX' },
      { id: 'b', name: 'Gift option B', worth: 'Worth £XX.XX' },
      { id: 'c', name: 'Gift option C', worth: 'Worth £XX.XX' },
    ],
  };
})();

const INLINE_KEY = 'choose-and-choose-inline-v2';

function loadInline() {
  try {
    const s = JSON.parse(localStorage.getItem(INLINE_KEY));
    if (s && s.qty && Array.isArray(s.picked)) return s;
  } catch (e) { /* storage unavailable */ }
  return { qty: { p1: 1 }, picked: [] };
}

let inlineState = loadInline();
// Drop products that aren't in this scenario's selection.
Object.keys(inlineState.qty).forEach((id) => {
  if (!INLINE.products.some((p) => p.id === id)) delete inlineState.qty[id];
});

function saveInline() {
  try { localStorage.setItem(INLINE_KEY, JSON.stringify(inlineState)); } catch (e) { /* storage unavailable */ }
}

const inlineTotal = () => INLINE.products.reduce((n, p) => n + (inlineState.qty[p.id] || 0), 0);
const inlineComplete = () => inlineTotal() >= INLINE.required;

function setInlineQty(id, delta) {
  const n = (inlineState.qty[id] || 0) + delta;
  const min = id === 'p1' ? 1 : 0; // you're on this product's page, so it stays in
  if (n < min || (delta > 0 && inlineComplete())) return;
  inlineState.qty[id] = n;
  if (!inlineComplete()) inlineState.picked = [];
  saveInline();
}

function toggleInlineGift(id) {
  if (!inlineComplete()) return;
  const sel = inlineState.picked.includes(id);
  if (sel) inlineState.picked = inlineState.picked.filter((g) => g !== id);
  else if (INLINE.maxGifts === 1) inlineState.picked = [id];
  else if (inlineState.picked.length < INLINE.maxGifts) inlineState.picked.push(id);
  saveInline();
}

function inlineBuyLabel() {
  const total = inlineTotal();
  if (!inlineComplete()) return 'BUY';
  return inlineState.picked.length ? 'BUY ' + total + ' + FREE GIFT' : 'BUY ' + total + ' PRODUCTS';
}

// opts: { moduleId, buyId, overlayId, panelId, bagHref, sheet }
function initInlinePdp(opts) {
  const mod = document.getElementById(opts.moduleId);
  const buy = document.getElementById(opts.buyId);
  const overlay = document.getElementById(opts.overlayId);
  const panel = document.getElementById(opts.panelId);
  let detailKey = null;

  const miniStepper = (p) => {
    const n = inlineState.qty[p.id] || 0;
    const min = p.id === 'p1' ? 1 : 0;
    return '<div class="mini-stepper">' +
      '<button type="button" data-qty="' + p.id + '" data-delta="-1" aria-label="Remove one ' + p.name + '"' + (n <= min ? ' disabled' : '') + '>−</button>' +
      '<span aria-live="polite">' + n + '</span>' +
      '<button type="button" data-qty="' + p.id + '" data-delta="1" aria-label="Add one ' + p.name + '"' + (inlineComplete() ? ' disabled' : '') + '>+</button></div>';
  };

  function renderModule() {
    const total = inlineTotal();
    const complete = inlineComplete();
    const left = INLINE.required - total;
    const onlyThis = INLINE.products.length === 1;
    const step1 = complete ? '1 · Products ✓'
      : onlyThis ? '1 · Add ' + left + ' more to qualify'
      : '1 · Add ' + left + ' more product from the offer';

    mod.innerHTML =
      '<div class="io-head"><span class="note" aria-hidden="true">6</span><span class="tag">OFFER</span>' +
      '<span class="io-title" id="io-title">Buy ' + INLINE.required + ', get a free gift</span>' +
      '<span class="io-count">' + total + '/' + INLINE.required + ' products</span></div>' +
      '<div class="io-progress" aria-hidden="true"><span style="width:' + Math.round(Math.min(total, INLINE.required) / INLINE.required * 100) + '%"></span></div>' +

      '<span class="io-step">' + step1 + '</span>' +
      (onlyThis
        ? '<div class="io-qty-row"><span>Quantity of this product</span>' + miniStepper(INLINE.products[0]) + '</div>'
        : '<div class="io-gifts">' +
      INLINE.products.map((p) => {
        const n = inlineState.qty[p.id] || 0;
        return '<div class="io-gift-wrap"><div class="io-tile' + (n ? ' chosen' : '') + '">' +
          '<span class="ph">' + (p.current ? '<span class="io-this">THIS PRODUCT</span>' : 'IMAGE') + '</span>' +
          '<span class="io-name">' + p.name + '</span><span class="io-worth">' + p.price + '</span>' + miniStepper(p) + '</div>' +
          (p.current ? '' : '<button type="button" class="link-btn" data-detail="p:' + p.id + '" aria-label="View details: ' + p.name + '">Details</button>') + '</div>';
      }).join('') + '</div>') +

      '<span class="io-step' + (complete ? '' : ' locked') + '">2 · Choose your free gift' + (complete ? '' : ' · unlocks at ' + INLINE.required + ' products') + '</span>' +
      '<div class="io-gifts" role="group" aria-label="Free gifts">' +
      INLINE.gifts.map((g) => {
        const sel = inlineState.picked.includes(g.id);
        return '<div class="io-gift-wrap"><button type="button" class="io-gift" data-gift="' + g.id + '" aria-pressed="' + sel + '"' + (complete ? '' : ' disabled') + '>' +
          '<span class="ph">GIFT<span class="check" aria-hidden="true">' + (sel ? '✓' : '') + '</span></span>' +
          '<span class="io-name">' + g.name + '</span><span class="io-worth">' + g.worth + '</span></button>' +
          '<button type="button" class="link-btn" data-detail="g:' + g.id + '" aria-label="View details: ' + g.name + '">Details</button></div>';
      }).join('') + '</div>' +
      '<a href="#terms" class="io-terms">Offer terms &amp; conditions · Ends [END DATE]</a>';
    buy.textContent = inlineBuyLabel();
  }

  function renderDetail() {
    const [kind, id] = detailKey.split(':');
    const isGift = kind === 'g';
    const item = (isGift ? INLINE.gifts : INLINE.products).find((x) => x.id === id);
    let foot;
    if (isGift) {
      const sel = inlineState.picked.includes(id);
      foot = inlineComplete()
        ? '<button type="button" class="' + (sel ? 'btn-outline' : 'btn-primary') + '" data-gift="' + id + '">' + (sel ? 'REMOVE THIS GIFT' : 'CHOOSE THIS GIFT') + '</button>'
        : '<button type="button" class="btn-disabled" disabled>ADD ' + (INLINE.required - inlineTotal()) + ' MORE PRODUCT TO UNLOCK</button>';
    } else {
      foot = '<div class="detail-action"><span>In your offer</span>' + miniStepper(item) + '</div>';
    }
    panel.innerHTML =
      (opts.sheet ? '<div class="grabber"><span></span></div>' : '') +
      '<div class="panel-head"><div class="titles"><span class="tag">' + (isGift ? 'FREE GIFT' : 'OFFER PRODUCT') + '</span><h2 id="io-detail-title">' + item.name + '</h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="panel-body" style="padding-top:16px"><div class="detail">' +
      '<div class="ph detail-image">' + (isGift ? 'GIFT IMAGE' : 'PRODUCT IMAGE') + '</div>' +
      '<div class="detail-thumbs"><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>' +
      (isGift
        ? '<span class="brand">[BRAND]</span><span class="sub">' + item.worth + ' · <span class="free">FREE with this offer</span></span>' +
          '<p class="detail-copy">[Short gift description: what it is, size, why customers will love it.]</p>'
        : '<span class="brand">' + item.sub.split(' · ')[0].toUpperCase() + '</span><span class="sub">★★★★★ (ratings) · ' + (item.sub.split(' · ')[1] || '') + '</span>' +
          '<span class="detail-price">' + item.price + '</span><p class="detail-copy">[Short product description from the PDP.]</p>' +
          '<ul class="benefits"><li>[Key benefit 1]</li><li>[Key benefit 2]</li><li>[Key benefit 3]</li></ul>') +
      '<details><summary>HOW TO USE</summary><p class="detail-copy">[How to use copy]</p></details>' +
      '<details><summary>INGREDIENTS</summary><p class="detail-copy">[Ingredients list]</p></details>' +
      (isGift ? '' : '<a href="#full-pdp" class="detail-link">View full product page ↗</a>') +
      '</div></div><div class="panel-foot">' + foot + '</div>';
  }

  const openDetail = (key) => { detailKey = key; renderDetail(); overlay.hidden = false; panel.querySelector('[data-close]').focus(); };
  const closeDetail = () => {
    overlay.hidden = true;
    const back = detailKey && mod.querySelector('[data-detail="' + detailKey + '"]');
    if (back) back.focus();
  };

  mod.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.detail) { openDetail(t.dataset.detail); return; }
    const sel = t.dataset.qty ? '[data-qty="' + t.dataset.qty + '"][data-delta="' + t.dataset.delta + '"]' : '[data-gift="' + t.dataset.gift + '"]';
    if (t.dataset.qty) setInlineQty(t.dataset.qty, Number(t.dataset.delta));
    else if (t.dataset.gift) toggleInlineGift(t.dataset.gift);
    else return;
    renderModule();
    const again = mod.querySelector(sel);
    if (again && !again.disabled) again.focus();
  });

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.hasAttribute('data-close')) { closeDetail(); return; }
    if (t.dataset.qty) { setInlineQty(t.dataset.qty, Number(t.dataset.delta)); renderModule(); renderDetail(); }
    else if (t.dataset.gift) { toggleInlineGift(t.dataset.gift); renderModule(); closeDetail(); }
  });

  overlay.querySelector('.backdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeDetail(); });
  buy.addEventListener('click', () => { location.href = opts.bagHref + location.search.replace(/^\?/, '&'); });

  renderModule();
}
