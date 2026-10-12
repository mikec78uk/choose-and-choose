// Choose and Choose, on-page version: for offers where this product is the only
// qualifying product and there are only a few gifts, the gift choice sits on the PDP.
// Loaded after offer.js (reuses OFFER's product data and the overlay styles).

const INLINE = {
  maxGifts: 1,
  gifts: [
    { id: 'a', name: 'Gift option A', worth: 'Worth £XX.XX' },
    { id: 'b', name: 'Gift option B', worth: 'Worth £XX.XX' },
    { id: 'c', name: 'Gift option C', worth: 'Worth £XX.XX' },
  ],
};

const INLINE_KEY = 'choose-and-choose-inline-v1';

function loadInline() {
  try {
    const s = JSON.parse(localStorage.getItem(INLINE_KEY));
    if (s && Array.isArray(s.picked)) return s;
  } catch (e) { /* storage unavailable */ }
  return { picked: [] };
}

let inlineState = loadInline();

function saveInline() {
  try { localStorage.setItem(INLINE_KEY, JSON.stringify(inlineState)); } catch (e) { /* storage unavailable */ }
}

function toggleInlineGift(id) {
  const sel = inlineState.picked.includes(id);
  if (sel) inlineState.picked = inlineState.picked.filter((g) => g !== id);
  else if (INLINE.maxGifts === 1) inlineState.picked = [id];
  else if (inlineState.picked.length < INLINE.maxGifts) inlineState.picked.push(id);
  saveInline();
}

const inlineChoiceLabel = () => (INLINE.maxGifts === 1 ? 'Choose 1 of ' + INLINE.gifts.length : 'Choose up to ' + INLINE.maxGifts + ' of ' + INLINE.gifts.length);

// opts: { moduleId, buyId, overlayId, panelId, bagHref, sheet }
function initInlinePdp(opts) {
  const mod = document.getElementById(opts.moduleId);
  const buy = document.getElementById(opts.buyId);
  const overlay = document.getElementById(opts.overlayId);
  const panel = document.getElementById(opts.panelId);
  let detailId = null;
  let opener = null;

  function renderModule() {
    mod.innerHTML =
      '<div class="io-head"><span class="note" aria-hidden="true">6</span><span class="tag">OFFER</span>' +
      '<span class="io-title" id="io-title">Free gift with this product</span><span class="io-count">' + inlineChoiceLabel() + '</span></div>' +
      '<div class="io-gifts" role="group" aria-labelledby="io-title">' +
      INLINE.gifts.map((g) => {
        const sel = inlineState.picked.includes(g.id);
        return '<div class="io-gift-wrap"><button type="button" class="io-gift" data-gift="' + g.id + '" aria-pressed="' + sel + '">' +
          '<span class="ph">GIFT<span class="check" aria-hidden="true">' + (sel ? '✓' : '') + '</span></span>' +
          '<span class="io-name">' + g.name + '</span><span class="io-worth">' + g.worth + '</span></button>' +
          '<button type="button" class="link-btn" data-detail="' + g.id + '" aria-label="View details: ' + g.name + '">Details</button></div>';
      }).join('') + '</div>' +
      '<a href="#terms" class="io-terms">Offer terms &amp; conditions · Ends [END DATE]</a>';
    buy.textContent = inlineState.picked.length ? 'BUY + FREE GIFT' : 'BUY';
  }

  function renderDetail() {
    const g = INLINE.gifts.find((x) => x.id === detailId);
    const sel = inlineState.picked.includes(g.id);
    panel.innerHTML =
      (opts.sheet ? '<div class="grabber"><span></span></div>' : '') +
      '<div class="panel-head"><div class="titles"><span class="tag">FREE GIFT</span><h2 id="io-detail-title">' + g.name + '</h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="panel-body" style="padding-top:16px"><div class="detail">' +
      '<div class="ph detail-image">GIFT IMAGE</div>' +
      '<div class="detail-thumbs"><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>' +
      '<span class="brand">[BRAND]</span>' +
      '<span class="sub">' + g.worth + ' · <span class="free">FREE with Protecting Hair Oil</span></span>' +
      '<p class="detail-copy">[Short gift description: what it is, size, why customers will love it.]</p>' +
      '<details><summary>HOW TO USE</summary><p class="detail-copy">[How to use copy]</p></details>' +
      '<details><summary>INGREDIENTS</summary><p class="detail-copy">[Ingredients list]</p></details>' +
      '</div></div>' +
      '<div class="panel-foot"><button type="button" class="' + (sel ? 'btn-outline' : 'btn-primary') + '" data-gift="' + g.id + '">' +
      (sel ? 'REMOVE THIS GIFT' : 'CHOOSE THIS GIFT') + '</button></div>';
  }

  const openDetail = (id, from) => {
    detailId = id;
    opener = from;
    renderDetail();
    overlay.hidden = false;
    panel.querySelector('[data-close]').focus();
  };
  const closeDetail = () => {
    overlay.hidden = true;
    const target = opener && mod.querySelector('[data-detail="' + opener + '"]');
    if (target) target.focus();
  };

  mod.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.detail) { openDetail(t.dataset.detail, t.dataset.detail); return; }
    if (t.dataset.gift) { toggleInlineGift(t.dataset.gift); renderModule(); mod.querySelector('[data-gift="' + t.dataset.gift + '"]').focus(); }
  });

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-close')) { closeDetail(); return; }
    if (t.dataset.gift) { toggleInlineGift(t.dataset.gift); renderModule(); closeDetail(); }
  });

  overlay.querySelector('.backdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeDetail(); });
  buy.addEventListener('click', () => { location.href = opts.bagHref; });

  renderModule();
}
