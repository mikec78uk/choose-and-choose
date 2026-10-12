# Choose and Choose: PDP wireframe

A clickable, low-fidelity wireframe showing how a customer claims the **Choose and Choose** offer from an Oriflame product page (based on [Eleo Protecting Hair Oil](https://uk.oriflame.com/products/product?code=38601)).

**The offer:** buy any 2 products from a selection of 10 (the same product twice counts), then choose 1 or more free gifts from a selection of 10.

The prototype has two versions, depending on how big the offer is:

- **Drawer version** (`index.html`, `mobile.html`): for larger offers, e.g. choose 2 from 10 products and gifts from 10. A one-line strip on the PDP opens the builder, so the product stays the focus.
- **On-page version** (`inline.html`, `inline-mobile.html`): for offers where this product is the only qualifying product and there are only a few gifts (3 in the demo). The gift choice sits directly on the PDP as a compact row between the price and BUY.

A suggested rule for which to use: on-page when there's 1 qualifying product and 4 or fewer gifts; drawer otherwise.

## Views

| Page | What it shows |
| --- | --- |
| `index.html` | Desktop PDP. A one-line offer strip under BUY opens the offer builder in a side drawer. |
| `mobile.html` | Mobile PDP. The same strip opens the builder as a bottom sheet. |
| `inline.html` | Desktop PDP, on-page version. Choose 1 of 3 gifts above BUY; "Details" opens a side panel. BUY becomes "BUY + FREE GIFT" once a gift is chosen. |
| `inline-mobile.html` | The same on mobile; gift details open as a bottom sheet. |
| `bag.html` | The offer grouped in the bag, with the free gift(s) at £0.00. Remove a product to see the "gift on hold" state. For the on-page version, it shows the product plus the gift, or a reminder if no gift was chosen. |

Your choices carry through to the bag. A prototype toolbar (switch views, show or hide the numbered annotations, reset the demo) is hidden by default. Add `?proto=1` to the URL to show it, or `?proto=0` to hide it again.

The numbered annotations below are also hidden by default. Turn them on with `?notes=1` (or the toolbar's "Toggle notes"), and off with `?notes=0`.

## Annotations

1. **Offer strip:** a secondary, single-line entry point under BUY. The product and BUY stay the focus of the PDP. The strip shows live progress once the customer has started.
2. **Step 1, choose 2 products:** the current product is pre-added (1 of 2). Customers can add the same product twice. "+" is disabled once 2 are chosen.
3. **Step 2, choose your gift:** stays locked until step 1 is done. Once the gift limit is reached (2 in this demo), the other gifts are disabled.
4. **One add-to-bag action:** adds the products and gifts together as one offer. Disabled until 2 products and at least 1 gift are chosen.
5. **Product and gift details:** tap any product (or "View details" on a gift) to open its details inside the drawer or sheet: images, price, description, key benefits, how to use, ingredients, and a link to the full product page. Customers can add the product or choose the gift from there, and "Back" returns them to the same place in the list without losing their offer.
6. **On-page gift picker (on-page version):** small gift tiles between the price and BUY, with "Details" for each. Selecting a gift is optional, but BUY changes to "BUY + FREE GIFT" to confirm it, and the bag reminds the customer if they skipped it.

## Open questions for feedback

- Gift count: fixed (e.g. up to 2), or tiered by spend?
- If a product is removed in the bag, should gifts drop automatically or be held with a "fix your offer" warning (as shown)?
- Out-of-stock products and gifts: hide them, or show them greyed out?
- Can the offer stack with VIP 15% off or other promotions?
- Does the offer repeat per pair (4 products = 2× gifts)?
- On-page version: what's the cut-off for showing gifts on the page (e.g. up to 4)? Should a gift be pre-selected, or must the customer choose?

Please add feedback as a GitHub issue, naming the view and annotation number (e.g. "Desktop ③: …").

## Running it

It's plain HTML, CSS and JavaScript with no build step. View it with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), or locally:

```bash
python3 -m http.server 8765
```

All names, prices, images and dates are placeholders.
