/*
  Site details — the one place to edit the facts.
  -----------------------------------------------
  Names, phone number, the areas covered, and the professional background all
  live here. Change them once and they update on every page that uses them.

  The wording of each page (the paragraphs and headings) sits in the page files
  in src/pages/ — each one is commented so you can find your way around.
*/

export const site = {
  // Name as it appears in the header, the browser tab, and the footer.
  name: "Linda Coppel",

  // The line that sits under the name in the header.
  role: "End of Life Doula",

  // Used as the site's meta description — the sentence search engines show
  // underneath the link. Keep it to one clear sentence.
  description:
    "Linda Coppel is a Certified End of Life Doula offering compassionate, non-medical support at home to people approaching the end of life and to those close to them, across North and North-West London.",

  // Professional membership, shown in the footer and on the About page.
  membership: "Member of End of Life Doula UK",

  // Navigation. The name in the top left already links to the home page.
  nav: [
    { label: "How I can help", href: "/how-i-can-help" },
    { label: "About me", href: "/about" },
    { label: "Get in touch", href: "/contact" },
  ],
};

/*
  Contact details.
  ----------------
  `display` is what people read. `tel` is what the phone dials when the number
  is tapped on a mobile — it needs the +44 international form and no spaces.

  There is no email address on the site at the moment. If you'd like one, fill
  in `email` below and it will appear automatically alongside the phone number.
*/
export const contact = {
  phoneDisplay: "07767 270884",
  phoneTel: "+447767270884",
  email: "", // e.g. "linda@example.com" — leave empty to hide
};

/*
  What the support can offer.
  ---------------------------
  Shown as a list on the "How I can help" page. Add, remove or reword freely.
*/
export const supportOffered = [
  "Being a regular and reassuring presence",
  "Exploring relationships, unresolved issues and what matters most",
  "Helping with advance planning and communicating wishes",
  "Having conversations about dying and death",
  "Living life right up to the end",
  "Supporting family members and carers",
  "Helping with everyday practicalities if needed",
];

/*
  Professional background.
  ------------------------
  Shown as a list on the About page. `detail` is optional — leave it out and
  only the main line shows.
*/
export const background = [
  {
    title: "Certified End of Life Doula",
    detail:
      "Crossfields Institute. Completed the required residential training and a 5,000 word portfolio.",
  },
  {
    title: "16 years as a bereavement counsellor",
  },
  {
    title: "Over 30 years as a therapist",
    detail: "Working with both individuals and communities.",
  },
];

/*
  Areas covered.
  --------------
  `region` is the broad description; `neighbourhoods` are the specific places
  listed on the Contact page.
*/
export const areas = {
  region: "Home based support across North and North-West London",
  neighbourhoods: [
    "St John's Wood",
    "Maida Vale",
    "Little Venice",
    "Kilburn",
    "Queen's Park",
    "West Hampstead",
    "South Hampstead",
    "Swiss Cottage",
    "Belsize Park",
    "Hampstead",
    "Highgate",
    "Gospel Oak",
    "Kentish Town",
    "Primrose Hill",
    "Chalk Farm",
  ],
};

/*
  Internal links.
  ---------------
  On its own domain the site sits at the root, so "/about" is already correct.
  When it is served from a sub-folder instead — a preview link, for example —
  every internal link needs that folder in front of it. `url()` adds it, and
  does nothing at all when the site is at the root, so it is safe everywhere.

  Use it for links to other pages on this site. Phone and email links (tel: and
  mailto:) are not addresses on this site, so they are left alone.
*/
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rest = path.replace(/^\//, "");
  return rest ? `${base}/${rest}` : `${base}/`;
}

/* True when `path` is the page being viewed — used to mark the current menu item. */
export function isCurrent(pathname: string, path: string): boolean {
  const tidy = (p: string) => p.replace(/\/+$/, "") || "/";
  return tidy(pathname) === tidy(url(path));
}
