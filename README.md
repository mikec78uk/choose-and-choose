# Choose and Choose: PDP wireframe

A clickable, low-fidelity wireframe showing how a customer claims the **Choose and Choose** offer from an Oriflame product page (based on [Eleo Protecting Hair Oil](https://uk.oriflame.com/products/product?code=38601)).

**The offer:** buy any 2 products from a selection of 10 (the same product twice counts), then choose 1 or more free gifts from a selection of 10.

The prototype has two versions, depending on how big the offer is:

- **Drawer version** (`index.html`, `mobile.html`): for larger offers, e.g. choose 2 from 10 products and gifts from 10. A one-line strip on the PDP opens the builder, so the product stays the focus.
- **On-page version** (`inline.html`, `inline-mobile.html`): for small offers with only a few qualifying products and a few gifts (3 of each in the demo). Both steps sit directly on the PDP as a compact module between the price and BUY: add the extra product(s), then choose the gift. Add `?products=1` for the case where this product is the only qualifying product (buy 2 of it): step 1 becomes a single quantity control.

A suggested rule for which to use: on-page when there are 3 or fewer qualifying products and 4 or fewer gifts; drawer otherwise.

## Views

| Page | What it shows |
| --- | --- |
| `index.html` | Desktop PDP. A one-line offer strip under BUY opens the offer builder in a side drawer. |
| `mobile.html` | Mobile PDP. The same strip opens the builder as a bottom sheet. |
| `inline.html` | Desktop PDP, on-page version. Step 1: add 1 more product from 3 (this product is pre-added). Step 2: choose 1 of 3 gifts, unlocked at 2 products. "Details" opens a side panel. BUY changes to "BUY 2 PRODUCTS" and then "BUY 2 + FREE GIFT". |
| `inline-mobile.html` | The same on mobile; details open as a bottom sheet. |
| `bag.html` | The offer grouped in the bag, with the free gift(s) at £0.00. Remove a product to see the "gift on hold" state. For the on-page version, it shows the products plus the gift, or a reminder if the customer hasn't qualified yet or hasn't chosen their gift. |

Your choices carry through to the bag. A prototype toolbar (switch views, show or hide the numbered annotations, reset the demo) is hidden by default. Add `?proto=1` to the URL to show it, or `?proto=0` to hide it again.

The numbered annotations below are also hidden by default. Turn them on with `?notes=1` (or the toolbar's "Toggle notes"), and off with `?notes=0`.

## Annotations

1. **Offer strip:** a secondary, single-line entry point under BUY. The product and BUY stay the focus of the PDP. The strip shows live progress once the customer has started.
2. **Step 1, choose 2 products:** the current product is pre-added (1 of 2). Customers can add the same product twice. "+" is disabled once 2 are chosen.
3. **Step 2, choose your gift:** stays locked until step 1 is done. Once the gift limit is reached (2 in this demo), the other gifts are disabled.
4. **One add-to-bag action:** adds the products and gifts together as one offer. Disabled until 2 products and at least 1 gift are chosen.
5. **Product and gift details:** tap any product (or "View details" on a gift) to open its details inside the drawer or sheet: images, price, description, key benefits, how to use, ingredients, and a link to the full product page. Customers can add the product or choose the gift from there, and "Back" returns them to the same place in the list without losing their offer.
6. **On-page offer (on-page version):** a compact module between the price and BUY with a progress bar, small product tiles with quantity controls, and small gift tiles that unlock at 2 products, each with "Details". BUY stays the single action and its label confirms what's being added; the bag reminds the customer if they haven't qualified or haven't chosen a gift.

## Open questions for feedback

- Gift count: fixed (e.g. up to 2), or tiered by spend?
- If a product is removed in the bag, should gifts drop automatically or be held with a "fix your offer" warning (as shown)?
- Out-of-stock products and gifts: hide them, or show them greyed out?
- Can the offer stack with VIP 15% off or other promotions?
- Does the offer repeat per pair (4 products = 2× gifts)?
- On-page version: what's the cut-off for showing the offer on the page (e.g. up to 3 products and 4 gifts)? Should a gift be pre-selected once the customer qualifies?

Please add feedback as a GitHub issue, naming the view and annotation number (e.g. "Desktop ③: …").

## Running it

It's plain HTML, CSS and JavaScript with no build step. View it with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), or locally:

```bash
python3 -m http.server 8765
```

All names, prices, images and dates are placeholders.
