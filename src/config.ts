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

  // The name of the practice, and the quiet line beneath it. Shown large at
  // the top of the page.
  practice: "Life Endings",
  tagline: "Time, space, and support for life's final journey.",

  // Used as the site's meta description — the sentence search engines show
  // underneath the link. Keep it to one clear sentence.
  description:
    "Life Endings: Linda Coppel is a Certified End of Life Doula offering compassionate, non-medical support at home to people approaching the end of life and to those close to them, across North and North-West London.",

  // Professional membership, shown in the footer.
  membership: "Member of End of Life Doula UK",

  // Navigation. The whole site is one page, so each item jumps to a section
  // of it; the `href` is that section's id. The name in the top left goes back
  // to the top.
  nav: [
    { label: "About me", href: "#about" },
    { label: "How I can help", href: "#how-i-can-help" },
    { label: "Get in touch", href: "#contact" },
  ],
};

/*
  Contact details.
  ----------------
  `display` is what people read. `tel` is what the phone dials when the number
  is tapped on a mobile — it needs the +44 international form and no spaces.

  Leave `email` empty to hide it everywhere.
*/
export const contact = {
  phoneDisplay: "07767 270884",
  phoneTel: "+447767270884",
  email: "ldcoppel@gmail.com",
};

/*
  Areas covered.
  --------------
  `short` sits with the contact details at the top of the page. `region` is
  the fuller description; `neighbourhoods` are the specific places listed in
  the "Get in touch" section.
*/
export const areas = {
  short: "North and North-West London",
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
