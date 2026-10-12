// Choose and Choose, on-page version. Reuses the existing "Claim as a free gift"
// carousel from Choose and Get, for the two simple cases:
//   ?s=1  This product is the only qualifying product, a few gifts to choose from.
//   ?s=2  Several qualifying products, one gift (added automatically, nothing to choose).
// Loaded after offer.js (reuses OFFER's product data, the overlay and toast styles).

const SCENARIO = new URLSearchParams(location.search).get('s') === '2' ? 2 : 1;
const ONPAGE = {
  required: 2,
  product: OFFER.products[0],
  gifts: ['A', 'B', 'C', 'D'].map((x) => ({ id: 'g' + x, name: 'Gift option ' + x, brand: '[BRAND]', worth: 'Worth £XX.XX' })),
  gift: { id: 'gift', name: '[Gift name]', brand: '[BRAND]', worth: 'Worth £XX.XX' },
  products: OFFER.products.slice(0, 6),
};
const ONPAGE_KEY = 'choose-and-choose-onpage-v1';

function freshOnpage() {
  return { s1: { qty: 1, gift: null, bagQty: 0, bagGift: null }, s2: { added: {} } };
}
function loadOnpage() {
  try {
    const s = JSON.parse(localStorage.getItem(ONPAGE_KEY));
    if (s && s.s1 && s.s2) return s;
  } catch (e) { /* storage unavailable */ }
  return freshOnpage();
}
let onpage = loadOnpage();
function saveOnpage() {
  try { localStorage.setItem(ONPAGE_KEY, JSON.stringify(onpage)); } catch (e) { /* storage unavailable */ }
}

const s2Total = () => Object.values(onpage.s2.added).reduce((a, b) => a + b, 0);
const bagCount = () => (SCENARIO === 1 ? onpage.s1.bagQty + (onpage.s1.bagGift ? 1 : 0) : s2Total() + (s2Total() >= ONPAGE.required ? 1 : 0));

const ICON = {
  heart: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bag: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  check: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5 9-10"/></svg>',
};

// One card in the "Claim as a free gift" carousel (same anatomy as Choose and Get).
function claimCard(c) {
  return '<li class="card' + (c.selected ? ' selected' : '') + (c.hero ? ' gift-hero' : '') + '">' +
    '<div class="card-media">' + (c.badge ? '<span class="card-badge">' + c.badge + '</span>' : '') + (c.hero ? 'GIFT IMAGE' : 'IMAGE') +
    (c.hero ? '' : '<div class="card-actions">' +
      '<button type="button" class="round" aria-label="Add ' + c.name + ' to wishlist">' + ICON.heart + '</button>' +
      '<button type="button" class="round' + (c.selected ? ' on' : '') + '" ' + c.action + ' aria-label="' + c.actionLabel + '"' + (c.disabled ? ' disabled' : '') + '>' + (c.selected ? ICON.check : ICON.bag) + '</button></div>') +
    '</div>' +
    '<div class="stars" aria-label="Rated 4 out of 5">★★★★<span class="dim">★</span> <span class="count">(15)</span></div>' +
    '<span class="card-brand">' + c.brand + '</span>' +
    '<button type="button" class="card-name" data-detail="' + c.id + '">' + c.name + '</button>' +
    '<span class="card-price">' + c.price + '</span>' +
    (c.note ? '<span class="card-note">' + c.note + '</span>' : '') +
    '</li>';
}

// opts: { overlayId, panelId }
function initOnpage(opts) {
  const offerLine = document.getElementById('offer-line');
  const claim = document.getElementById('claim');
  const buy = document.getElementById('buy');
  const qtyBox = document.getElementById('qty');
  const toast = document.getElementById('toast');
  const overlay = document.getElementById(opts.overlayId);
  const panel = document.getElementById(opts.panelId);
  const badge = document.getElementById('bag-count');
  let toastTimer = null;
  let detailId = null;

  const showToast = (msg) => {
    toast.innerHTML = '<span>' + msg + '</span><a href="bag.html?from=s' + SCENARIO + '">View bag</a>';
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  };

  function renderS1() {
    const s = onpage.s1;
    const qualifies = s.qty >= ONPAGE.required;
    const left = ONPAGE.required - s.qty;
    const chosen = ONPAGE.gifts.find((g) => g.id === s.gift);

    offerLine.innerHTML = '<span class="tag">OFFER</span><span>Buy ' + ONPAGE.required + ', claim a free gift</span><a href="#claim">' + (chosen ? 'Gift: ' + chosen.name + ' ✓' : qualifies ? 'Choose your gift ↓' : 'See gifts ↓') + '</a>';
    qtyBox.innerHTML = '<button type="button" data-q="-1" aria-label="Decrease quantity"' + (s.qty <= 1 ? ' disabled' : '') + '>−</button><span aria-live="polite">' + s.qty + '</span><button type="button" data-q="1" aria-label="Increase quantity">+</button>';
    buy.textContent = chosen && qualifies ? 'BUY ' + s.qty + ' + FREE GIFT' : s.qty > 1 ? 'BUY ' + s.qty : 'BUY';

    let status;
    if (!qualifies) status = '<span>Add ' + left + ' more ' + ONPAGE.product.name + ' to claim a gift.</span><button type="button" class="link-btn" data-fill>Add ' + left + ' more</button>';
    else if (!chosen) status = '<span class="ok">✓ You qualify. Choose 1 gift.</span>';
    else status = '<span class="ok">✓ ' + chosen.name + ' claimed. It’s added when you click BUY.</span>';

    claim.innerHTML = claimHead('Claim as a free gift', 'When you purchase ' + ONPAGE.required + ' of ' + ONPAGE.product.name, status, 6) +
      '<ul class="cards">' + ONPAGE.gifts.map((g) => claimCard({
        id: g.id, name: g.name, brand: g.brand, price: '<span class="free">FREE</span> <span class="was">' + g.worth + '</span>',
        selected: s.gift === g.id, disabled: !qualifies,
        badge: s.gift === g.id ? '✓ CLAIMED' : null,
        action: 'data-claim="' + g.id + '"', actionLabel: (s.gift === g.id ? 'Remove gift: ' : 'Claim gift: ') + g.name,
      })).join('') + '</ul>';
  }

  function renderS2() {
    const total = s2Total();
    const qualifies = total >= ONPAGE.required;
    const left = ONPAGE.required - total;
    offerLine.innerHTML = '<span class="tag">OFFER</span><span>Buy ' + ONPAGE.required + ' of the selected items, get ' + ONPAGE.gift.name + ' free</span><a href="#claim">' + (qualifies ? 'Gift unlocked ✓' : total + '/' + ONPAGE.required + ' added ↓') + '</a>';
    buy.textContent = 'BUY';

    const status = qualifies
      ? '<span class="ok">✓ ' + ONPAGE.gift.name + ' will be added to your bag free.</span>'
      : '<span>' + total + ' of ' + ONPAGE.required + ' added · add ' + left + ' more to get your gift.</span>';

    claim.innerHTML = claimHead('Claim ' + ONPAGE.gift.name + ' free', 'When you purchase ' + ONPAGE.required + ' of the selected items', status, 7) +
      '<ul class="cards">' +
      claimCard({ id: 'gift', hero: true, name: ONPAGE.gift.name, brand: ONPAGE.gift.brand, price: '<span class="free">FREE</span> <span class="was">' + ONPAGE.gift.worth + '</span>', badge: qualifies ? '✓ UNLOCKED' : 'FREE GIFT', note: 'Added automatically' }) +
      ONPAGE.products.map((p) => {
        const n = onpage.s2.added[p.id] || 0;
        return claimCard({
          id: p.id, name: p.name, brand: p.sub.split(' · ')[0].toUpperCase(), price: p.price,
          badge: p.current ? 'THIS PRODUCT' : null, note: n ? 'In your bag ×' + n : null,
          action: 'data-add="' + p.id + '"', actionLabel: 'Add ' + p.name + ' to bag',
        });
      }).join('') + '</ul>';
  }

  function claimHead(title, sub, status, n) {
    return '<div class="claim-head"><div><h2 id="claim-title"><span class="note" aria-hidden="true">' + n + '</span>' + title + '</h2>' +
      '<p class="claim-sub">' + sub + '</p><div class="claim-status" aria-live="polite">' + status + '</div></div>' +
      '<div class="arrows"><button type="button" class="arrow" data-scroll="-1" aria-label="Previous">‹</button><button type="button" class="arrow" data-scroll="1" aria-label="Next">›</button></div></div>';
  }

  function render() {
    const strip = claim.querySelector('.cards');
    const x = strip ? strip.scrollLeft : 0;
    if (SCENARIO === 1) renderS1(); else renderS2();
    claim.querySelector('.cards').scrollLeft = x;
    updateArrows();
    const n = bagCount();
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  function updateArrows() {
    const strip = claim.querySelector('.cards');
    const [prev, next] = claim.querySelectorAll('.arrow');
    prev.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
  }

  function renderDetail() {
    const isGift = SCENARIO === 1 || detailId === 'gift';
    const item = SCENARIO === 1 ? ONPAGE.gifts.find((g) => g.id === detailId)
      : detailId === 'gift' ? ONPAGE.gift : ONPAGE.products.find((p) => p.id === detailId);
    let foot = '';
    if (SCENARIO === 1) {
      const sel = onpage.s1.gift === item.id;
      foot = onpage.s1.qty >= ONPAGE.required
        ? '<button type="button" class="' + (sel ? 'btn-outline' : 'btn-primary') + '" data-claim="' + item.id + '">' + (sel ? 'REMOVE THIS GIFT' : 'CLAIM THIS GIFT') + '</button>'
        : '<button type="button" class="btn-disabled" disabled>BUY ' + ONPAGE.required + ' TO CLAIM</button>';
    } else if (detailId !== 'gift') {
      foot = '<button type="button" class="btn-primary" data-add="' + item.id + '">ADD TO BAG</button>';
    }
    panel.innerHTML = '<div class="panel-head"><div class="titles"><span class="tag">' + (isGift ? 'FREE GIFT' : 'OFFER PRODUCT') + '</span><h2 id="op-detail-title">' + item.name + '</h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="panel-body" style="padding-top:16px"><div class="detail">' +
      '<div class="ph detail-image">' + (isGift ? 'GIFT IMAGE' : 'PRODUCT IMAGE') + '</div>' +
      '<div class="detail-thumbs"><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>' +
      (isGift
        ? '<span class="brand">' + item.brand + '</span><span class="sub">' + item.worth + ' · <span class="free">FREE with this offer</span></span><p class="detail-copy">[Short gift description: what it is, size, why customers will love it.]</p>'
        : '<span class="brand">' + item.sub.split(' · ')[0].toUpperCase() + '</span><span class="detail-price">' + item.price + '</span><p class="detail-copy">[Short product description from the PDP.]</p><ul class="benefits"><li>[Key benefit 1]</li><li>[Key benefit 2]</li></ul>') +
      '<details><summary>HOW TO USE</summary><p class="detail-copy">[How to use copy]</p></details>' +
      '<details><summary>INGREDIENTS</summary><p class="detail-copy">[Ingredients list]</p></details>' +
      '</div></div>' + (foot ? '<div class="panel-foot">' + foot + '</div>' : '');
  }
  const openDetail = (id) => { detailId = id; renderDetail(); overlay.hidden = false; panel.querySelector('[data-close]').focus(); };
  const closeDetail = () => { overlay.hidden = true; };

  function act(t) {
    if (t.dataset.claim) {
      onpage.s1.gift = onpage.s1.gift === t.dataset.claim ? null : t.dataset.claim;
    } else if (t.dataset.add) {
      const p = ONPAGE.products.find((x) => x.id === t.dataset.add);
      const before = s2Total();
      onpage.s2.added[p.id] = (onpage.s2.added[p.id] || 0) + 1;
      const unlocked = before < ONPAGE.required && s2Total() >= ONPAGE.required;
      showToast('Added to bag: ' + p.name + (unlocked ? ' · Free gift unlocked ✓' : ''));
    } else if (t.hasAttribute('data-fill')) {
      onpage.s1.qty = ONPAGE.required;
    } else return false;
    saveOnpage();
    render();
    return true;
  }

  claim.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.scroll) {
      const strip = claim.querySelector('.cards');
      strip.scrollBy({ left: Number(t.dataset.scroll) * strip.clientWidth * 0.8, behavior: 'smooth' });
      return;
    }
    if (t.dataset.detail) { openDetail(t.dataset.detail); return; }
    act(t);
  });
  claim.addEventListener('scroll', updateArrows, true);

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.hasAttribute('data-close')) { closeDetail(); return; }
    if (act(t)) closeDetail();
  });
  overlay.querySelector('.backdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeDetail(); });

  qtyBox.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    onpage.s1.qty = Math.max(1, onpage.s1.qty + Number(t.dataset.q));
    if (onpage.s1.qty < ONPAGE.required) onpage.s1.gift = null;
    saveOnpage();
    render();
  });
  qtyBox.hidden = SCENARIO !== 1;

  buy.addEventListener('click', () => {
    if (SCENARIO === 1) {
      const s = onpage.s1;
      s.bagQty += s.qty;
      if (s.gift && s.bagQty >= ONPAGE.required) s.bagGift = s.gift;
      saveOnpage();
      showToast('Added to bag: ' + s.qty + ' × ' + ONPAGE.product.name + (s.bagGift ? ' + free gift' : ''));
      render();
    } else {
      act({ dataset: { add: ONPAGE.product.id }, hasAttribute: () => false });
    }
  });

  render();
}
