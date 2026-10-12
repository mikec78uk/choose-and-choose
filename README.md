# Choose and Choose: PDP wireframe

A clickable, low-fidelity wireframe showing how a customer claims the **Choose and Choose** offer from an Oriflame product page (based on [Eleo Protecting Hair Oil](https://uk.oriflame.com/products/product?code=38601)).

**The offer:** buy any 2 products from a selection of 10 (the same product twice counts), then choose 1 or more free gifts from a selection of 10.

The prototype has two versions, depending on how big the offer is:

- **Drawer version** (`index.html`, `mobile.html`): for larger offers, e.g. choose 2 from 10 products and gifts from 10. A one-line strip on the PDP opens the builder, so the product stays the focus.
- **On-page version** (`inline.html`, `inline-mobile.html`): for simple offers only, shown directly on the PDP. It reuses the existing **"Claim as a free gift"** carousel from Choose and Get, so customers see a familiar pattern, plus one short offer line in the buy box that links down to it. There are two scenarios:
  - **Scenario 1 (`?s=1`): only this product qualifies, plus a few gifts.** The carousel shows the gifts ("When you purchase 2 of Protecting Hair Oil"). Gifts unlock once the quantity next to BUY is 2 ("Add 1 more" sets it). The customer claims one with the card's bag icon, and BUY adds the products and the gift together.
  - **Scenario 2 (`?s=2`): several qualifying products, one gift.** Follows the live site's "Unlock your gift" block in the buy box, but with the gift and the products in **one connected box**. The gift panel shows basket "slots" ([item] + [item] = gift) that fill as qualifying items go into the basket. Below it, "When you purchase any 2 of the following" lists the products: the one being viewed comes first ("YOU'RE VIEWING"), then items already in the basket ("✓ IN BASKET"). The gift unlocks and is added automatically at 2. The demo starts with one item already in the basket.

Anything bigger (several products and several gifts) uses the drawer version.

## Views

| Page | What it shows |
| --- | --- |
| `index.html` | Desktop PDP. A one-line offer strip under BUY opens the offer builder in a side drawer. |
| `mobile.html` | Mobile PDP. The same strip opens the builder as a bottom sheet. |
| `inline.html?s=1` / `?s=2` | Desktop PDP, on-page version, scenario 1 or 2. |
| `inline-mobile.html?s=1` / `?s=2` | The same at phone width. |
| `bag.html` | The offer grouped in the bag, with the free gift(s) at £0.00. Remove a product to see the "gift on hold" state. For the on-page version, it shows what was added, plus a reminder if the customer hasn't qualified yet or hasn't claimed their gift. |

Your choices carry through to the bag. A prototype toolbar (switch views, show or hide the numbered annotations, reset the demo) is hidden by default. Add `?proto=1` to the URL to show it, or `?proto=0` to hide it again.

The numbered annotations below are also hidden by default. Turn them on with `?notes=1` (or the toolbar's "Toggle notes"), and off with `?notes=0`.

## Annotations

1. **Offer strip:** a secondary, single-line entry point under BUY. The product and BUY stay the focus of the PDP. The strip shows live progress once the customer has started.
2. **Step 1, choose 2 products:** the current product is pre-added (1 of 2). Customers can add the same product twice. "+" is disabled once 2 are chosen.
3. **Step 2, choose your gift:** stays locked until step 1 is done. Once the gift limit is reached (2 in this demo), the other gifts are disabled.
4. **One add-to-bag action:** adds the products and gifts together as one offer. Disabled until 2 products and at least 1 gift are chosen.
5. **Product and gift details:** tap any product (or "View details" on a gift) to open its details inside the drawer or sheet: images, price, description, key benefits, how to use, ingredients, and a link to the full product page. Customers can add the product or choose the gift from there, and "Back" returns them to the same place in the list without losing their offer.
6. **On-page, scenario 1:** "Claim as a free gift" carousel of gifts. Cards are locked until the customer is buying 2; the bag icon claims a gift ("✓ CLAIMED"), and BUY then reads "BUY 2 + FREE GIFT".
7. **On-page, scenario 2:** "Unlock your gift" in the buy box. Gift and products share one box, linked by the basket slots. The viewed product and items already in the basket are badged and outlined. Adding via the bag icons or ADD TO BASKET fills the slots; at 2 the panel turns green and the gift is added free.

## Open questions for feedback

- Gift count: fixed (e.g. up to 2), or tiered by spend?
- If a product is removed in the bag, should gifts drop automatically or be held with a "fix your offer" warning (as shown)?
- Out-of-stock products and gifts: hide them, or show them greyed out?
- Can the offer stack with VIP 15% off or other promotions?
- Does the offer repeat per pair (4 products = 2× gifts)?
- On-page version: what's the cut-off for showing it on the page (e.g. 1 qualifying product with up to 4 gifts, or up to ~8 products with 1 gift)?
- Scenario 1: is the bag icon clear enough as a "claim" action, or should gift cards have a text button?

Please add feedback as a GitHub issue, naming the view and annotation number (e.g. "Desktop ③: …").

## Running it

It's plain HTML, CSS and JavaScript with no build step. View it with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), or locally:

```bash
python3 -m http.server 8765
```

All names, prices, images and dates are placeholders.
