# Google Sheet catalog — Godavari Basket Abroad

The storefront catalog is loaded from Google Sheets at runtime. There is no demo product/category catalog in the code.

## Environment variable

`ABROAD_GOOGLE_SHEET_URL`

Use a published CSV/gviz CSV URL, for example:

`https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv&gid=YOUR_GID`

The route temporarily also accepts the old `GLOBAL_GOOGLE_SHEET_URL` name so an existing deployment does not fail during migration. New deployments should use `ABROAD_GOOGLE_SHEET_URL`.

## Recommended columns

The existing bundle-style sheet continues to work:

`id | category | name | subtitle | weight_kg | price_inr | image | items | tags | popular | active`

The loader also understands parent Godavari Basket-style naming where available:

`parent_category | subcategory | description | seller_price | size | image`

### Rules

- `category` drives the live category tabs and category cards.
- `subcategory` is retained from the Sheet and used in category metadata.
- `weight_kg` is preferred. Values such as `1.5`, `1kg`, `500g`, or a `size` value are understood.
- `price_inr`, `bundle_price`, `price`, or `seller_price` can supply the price.
- `items` / `products` / `includes` / `bundle_items` can be separated with semicolons, pipes, or commas.
- `popular` / `featured` can be TRUE/FALSE.
- `active` can be TRUE/FALSE.
- `image` should be a direct image URL. If blank, the Godavari Basket logo is used rather than demo catalog photography.

When the Sheet is unavailable, the site keeps a previously cached live catalog in the browser when possible. It never substitutes hard-coded demo products.
