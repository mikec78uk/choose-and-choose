# Choose and Choose: PDP wireframe

A clickable, low-fidelity wireframe showing how a customer claims the **Choose and Choose** offer from an Oriflame product page (based on [Eleo Protecting Hair Oil](https://uk.oriflame.com/products/product?code=38601)). Open `index.html` for an overview of all scenarios.

## The approach

One **"Unlock your gift"** box sits in the buy box on every qualifying product page, below the delivery details (as on the live site). What's inside depends on how much the customer has to choose:

| Scenario | Example offer | What the box shows |
| --- | --- | --- |
| **1. One qualifying product, a few gifts** (`pdp.html?s=1`) | Buy 2 of this product, choose 1 of 4 gifts | Gift tiles with a clear **Choose** button, right in the box |
| **2. Several qualifying products, one gift** (`pdp.html?s=2`) | Buy any 2 of 6 products, get one gift | The products as cards (Choose and Get pattern). The gift is added automatically; there's nothing to choose |
| **3. Several qualifying products, several gifts** (`pdp.html?s=3`) | Buy any 2 of 10, choose up to 2 of 10 gifts | Progress and a summary, with **Choose products & gifts** opening a drawer |

The same rules apply in every scenario:

- **Basket slots show progress:** [item] + [item] = [gift]. They fill from what's actually in the basket, including items added earlier on other pages.
- **Adding a product always goes straight to the basket:** ADD TO BASKET, the bag icon on a card, or + in the drawer. There's no separate "add offer" step.
- **Gifts can be chosen at any time.** Choosing before qualifying reserves the gift until there are enough products in the basket. With a single gift, it's added automatically.
- **The viewed product and items already in the basket are always marked:** "YOU'RE VIEWING" (black) and "✓ IN BASKET" (green), on cards, drawer rows and details.
- **Details for any product or gift** open in a side panel (a bottom sheet on mobile) with the same actions.

The mobile views (`pdp-mobile.html?s=1|2|3`) show the same page at phone width.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Overview with links to every scenario. |
| `pdp.html?s=1` / `?s=2` / `?s=3` | Desktop PDP for each scenario. Scenarios 2 and 3 start with one qualifying item already in the basket. |
| `pdp-mobile.html?s=1` / `?s=2` / `?s=3` | The same at phone width. |
| `bag.html?s=1` / `?s=2` / `?s=3` | The basket. Remove an item to see the "add 1 more to get your reserved gift" state. |
| `drawer.html`, `mobile.html` | Earlier iteration: the drawer-only version. |

A prototype toolbar (switch scenarios, mobile/desktop view, annotations, reset) is hidden by default. Add `?proto=1` to show it (e.g. `pdp.html?s=1&proto=1`) and `?proto=0` to hide it. The numbered annotations are hidden too; turn them on with `?notes=1`. "Reset the demo" on the overview page clears all choices.

## Annotations

6. **Scenario 1:** gift tiles in the box. Choosing reserves the gift; it's added free once 2 are in the basket.
7. **Scenario 2:** the qualifying products in the box, led by the viewed product, then items already in the basket. The gift is added automatically at 2.
8. **Scenario 3:** progress and a summary in the box; the drawer lists products (with basket quantities) and gifts. Everything in the drawer updates the basket directly.

(1–5 belong to the earlier drawer-only version.)

## Open questions for feedback

- **Scenario 1 rule:** is it "buy 2 of this product", or "buy 1 and choose a gift"? If it's the latter, there's nothing to unlock and the box only needs the gift tiles.
- **Scenario 2:** is it OK to add the single gift automatically? What happens if it's out of stock?
- **Cut-offs between scenarios:** e.g. inline gift tiles for up to 4 gifts; a "View all" link once there are more than ~8 qualifying products.
- If a product is removed from the basket, should reserved gifts stay reserved (as shown) or be removed?
- Out-of-stock products and gifts: hide them, or show them greyed out?
- Can the offer stack with VIP 15% off or other promotions? Does it repeat (4 products = 2× gifts)?

Please add feedback as a GitHub issue, naming the scenario (e.g. "Scenario 3, drawer: …").

## Running it

It's plain HTML, CSS and JavaScript with no build step. View it with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), or locally:

```bash
python3 -m http.server 8765
```

All names, prices, images and dates are placeholders.
