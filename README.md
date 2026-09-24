# Linda Coppel — End of Life Doula

A small, calm, fast website built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com).

Four pages:

| Page | Address | What it's for |
| --- | --- | --- |
| Home | `/` | Short and calm. What the support is, and how to call. |
| How I can help | `/how-i-can-help` | What the support looks like in practice. |
| About me | `/about` | What matters to Linda, and her professional background. |
| Get in touch | `/contact` | The phone number, and the areas covered. |

## Running it

```bash
npm install     # once, the first time
npm run dev     # local preview at http://localhost:4321
```

Leave `npm run dev` running while you edit; the browser updates as you save.
Press `Ctrl+C` in the terminal to stop it.

## Editing the content

**The facts live in `src/config.ts`** — name, phone number, the list of what the
support offers, the professional background, and the areas covered. Change them
once there and every page updates.

| What you want to change | Where in `src/config.ts` |
| --- | --- |
| Name, role, site description | `site` |
| Phone number (and email, if you add one) | `contact` |
| Menu items | `site.nav` |
| The "practical and emotional support" list | `supportOffered` |
| Qualifications and experience | `background` |
| Areas covered | `areas` |

**The wording lives in the page files** in `src/pages/`. Each page is commented
so you can find the paragraph you want. For example, the three short blocks on
the home page (Time / A familiar presence / Alongside your care team) are at the
top of `src/pages/index.astro`.

### Adding the phone number correctly

In `src/config.ts` the number appears twice on purpose:

- `phoneDisplay` is what people read: `07767 270884`
- `phoneTel` is what a phone actually dials when tapped: `+447767270884`
  (international form, no spaces)

If the number ever changes, update both.

### Adding an email address

`contact.email` is empty, so no email appears anywhere. Fill it in and it shows
up automatically in the footer and on the Contact page. Leave it empty to keep
the phone as the only route in.

## Changing how it looks

All the colours and fonts are defined once, at the top of
`src/styles/global.css`, in the `@theme` block. Nothing else needs touching.

The page itself is a **pale green**. Two other surfaces sit either side of it:
cream (`--color-cream`) for cards that lift forward, and a deeper sage
(`--color-sage`) for the full-width bands that set back. That three-surface
arrangement is what stops a page of plain text feeling flat, so if you change
one, change all three together.

Text colours and leaf colours are kept **separate on purpose**. Text has to stay
legible so it's dark and slightly muted; the leaves don't, so they get to be
properly green. If you want greener foliage, change `--color-leaf-light`,
`--color-leaf` and `--color-leaf-deep` and leave the text colours alone.

Body text is set larger than a typical website (18px) with generous line
spacing, because the people reading it are often tired, anxious, or on a phone
at a difficult moment.

The content column width is set once, in the `.wrap` class in the same file
(`max-width: 78rem`). Every section uses it, so the left and right edges line up
all the way down the site. Widen or narrow the whole site by changing that one
number.

If you change the fonts, also update the Google Fonts `<link>` in
`src/layouts/BaseLayout.astro` so the new font actually loads.

### The plants

All the greenery is drawn as SVG, not photographed. Two plants, both broad-leaved
evergreens: **camellia** (glossy scalloped leaves, round many-petalled pink
flowers) and **magnolia grandiflora** (much larger leathery leaves, big creamy
flowers with a central cone, and a rusty felted underside on the leaves that are
turned over).

**Nothing is stamped out.** The obvious way to draw a branch is to write one leaf
shape and repeat it at different sizes and angles — and that is precisely what
makes a drawing look like clip-art. Instead every leaf and every petal is
generated in full from its own parameters: its own length, its own width on each
side of the midrib, its own curve, droop and angle. A smooth curve is then fitted
through the sampled points. No two leaves on the site are the same shape.

The variation comes from a seeded random number generator, so the planting is
irregular in every part but identical on every build.

| File | What it is |
| --- | --- |
| `src/plants.ts` | The geometry: leaves, stems, petals, the curve fitting |
| `src/components/Branch.astro` | One shoot, generated leaf by leaf |
| `src/components/Flower.astro` | One bloom, generated petal by petal |
| `src/components/PlantDefs.astro` | Gradients and the assembled plantings |
| `src/components/Botanical.astro` | Draws a planting |
| `src/components/LeafDivider.astro` | The small mark between sections |
| `src/components/Leaf.astro` | One leaf, for bullet points and the wordmark |

`Botanical` takes a `variant` — `full` (two flowers; used once, on the home page),
`pair` (one flower) or `leaves` (foliage only) — plus `flip` and `lean` so no two
plantings on a page stand identically.

**Where the artwork lives.** Because the leaves are generated rather than
repeated, each branch is a few thousand characters of path data. `PlantDefs`
renders every branch and flower once into the page's `<defs>`, and everything
else references them with `<use>`. Add a new planting by composing `<use>`
elements there, not by repeating path data.

**Four things that took several attempts**, worth knowing before redrawing any
of it:

1. **Depth comes from colour, not transparency.** Fading a leaf towards the page
   colour turns greenery grey and lifeless. Each leaf carries a shaded half,
   split along its own midrib, and a gradient from base to tip.
2. **Petal tips must be blunt.** Running a petal's two side curves into a point
   makes a spike, and a ring of spikes reads as a star, not a flower.
3. **Veins are measured against the blade's width at that point**, not its widest
   point — otherwise they overshoot near the tip and the leaf sprouts spikes.
4. **The margin needs more sample points than it has scallops.** Fewer, and the
   scalloping aliases into a sawtooth. `LEAF_SAMPLES` in `plants.ts` is 30;
   keep scallop counts well under half that.

To reshuffle a branch entirely, change its `seed` in `PlantDefs.astro`.

There is deliberately **no greenery in the footer**: it's compact and text-dense,
and a plant collides with the copyright line at every size worth using.

## Before publishing

1. Buy a domain.
2. Put it in `astro.config.mjs` as `site:` (currently the placeholder
   `https://example.com`). The sitemap and the canonical links are built from it.
3. Read every page through once out loud. The wording is drawn from Linda's own
   notes, but some sentences were joined up or reordered to fit the page, so it
   needs her eye on it before it goes live.

## Deploying

`npm run build` produces a plain static site in `dist/`, which any host will
serve.

- **Netlify** or **Vercel** — connect the Git repository and they detect Astro
  automatically. Build command `npm run build`, publish directory `dist`.
- **Cloudflare Pages** — the same settings.

## Project structure

```
src/
  config.ts              ← the facts: name, phone, areas, background
  styles/global.css      ← colours, fonts, reusable classes
  layouts/
    BaseLayout.astro     ← the shell: <head>, header, footer
  components/
    Header.astro
    Footer.astro
    Botanical.astro      ← the three-stem planting
    Sprig.astro          ← a single leaf stem
    LeafDivider.astro    ← the small leaf mark between sections
    Leaf.astro           ← one small leaf (bullets, card marks)
  pages/
    index.astro          ← home
    how-i-can-help.astro
    about.astro
    contact.astro
public/                  ← served as-is (favicon, and any photos you add)
```

Adding a page means creating a new `.astro` file in `src/pages/` — the filename
becomes the address. Add it to `site.nav` in `src/config.ts` to put it in the menu.

## A note on what isn't here

There is **no contact form**, on purpose. A form asks a worried person to compose
something in writing and then wait for a reply. A phone number lets them speak to
a person today. If a form would be useful later, it should sit underneath the
number rather than in place of it.

There is also **no cookie banner**, because the site sets no cookies and runs no
analytics or tracking. The only third-party request is to Google Fonts. If you
later add analytics, you will need to revisit that.
