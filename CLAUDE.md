# CLAUDE.md

Guidance for agents working in this repo. For what the Labs are, read `README.md`.

## These pages are demos, not the product

Eight Labs, one per CampusMind offering, plus the hub and a Pricing page. A presenter
drives each Lab during a live demo. All data is written into the page's own JavaScript.
Do not add API calls, analytics, or storage unless the user asks for them. Pricing is
the one page that already stores data, in `localStorage`. Every page tells its reader
that the content is illustrative, and that statement has to stay true.

Strictly think about what visuals will support my argument. No paragraphs, and not a lot
of text. Focus on supporting graphics and on telling the story graphically, in support
of my main demo. No one reads a lot of text on a Lab.

## Constraints

- Add no build step and no dependencies. There is no `package.json`, bundler, or
  framework, and Vercel serves the files as they are.
- Add no web fonts. Two system stacks are in use. The hub, Data Bridge, Campus Chat,
  Campus Chat Plus, and Admin Console use `-apple-system, BlinkMacSystemFont, "Segoe UI"`.
  Accessibility, Recruitment, Retention, Virtual Teaching Assistant, and Pricing use
  `Inter, "Avenir Next", Avenir` with the same system fallback.
- Keep the three-file naming. Every Lab is `<lab>.html`, `<lab>.css`, and `<lab>.js` at
  the repo root. Add no subdirectories and no shared modules. Two pages break the
  pattern. Accessibility also loads `accessibility-examples.js`. Pricing loads
  `pricing-redesign.css`, not `pricing.css`.
- Match the existing accessibility standard. These pages use tablists with roving
  `tabIndex`, `aria-pressed` toggles, `aria-live` regions, visible focus rings, and
  `prefers-reduced-motion` branches. One of the Labs demos an accessibility product.

## The duplication is deliberate

Every stylesheet declares its own `:root` tokens, `.shell`, `.masthead`,
`.section-nav`, and `.eyebrow`. Every JavaScript file defines its own `$`. Four Labs
(`ontology.js`, `campus-chat.js`, `campus-chat-plus.js`, and `admin-console.js`)
implement scroll tracking with the same code and a different default section.

Do not extract a shared stylesheet or a shared JavaScript module on your own
initiative. A presenter who edits one Lab on the morning of a talk cannot break the
others. If the user asks for consolidation, that is a real task. Otherwise, leave it.

The tokens already differ on purpose. `--gold` has three values.

| `--gold` | Files |
|----------|-------|
| `#a67312` | `ontology.css`, `campus-chat.css`, `campus-chat-plus.css`, `admin-console.css`, `pricing-redesign.css` |
| `#876328` | `accessibility.css`, `retention.css` |
| `#9a6811` | `recruitment.css` |

`virtual-teaching-assistant.css` defines `--gold-soft` instead, and `home.css` defines
no gold at all. `accessibility.css` also uses `--teal: #306d7e`, `--deep`, `--pale`,
and `--border`.

## Do not run a formatter

Three formatting styles coexist in this repo, sometimes inside one Lab.

| Style | Files |
|-------|-------|
| Pretty-printed | `index.html`, `home.css`, `labs-navigation.css`, `virtual-teaching-assistant.*`, `pricing.*`, `pricing-redesign.css`, and the JavaScript of Accessibility, Recruitment, Data Bridge, Campus Chat, Campus Chat Plus, and Admin Console |
| One rule or element per line | `ontology.html`, `ontology.css`, `campus-chat.html`, `campus-chat.css`, `campus-chat-plus.html`, `campus-chat-plus.css`, `admin-console.html`, `admin-console.css` |
| Collapsed whitespace | `recruitment.html`, `recruitment.css`, `retention.*`, `accessibility.css` |

The collapsed files are complete pages, not stubs. `recruitment.css` is one line of
20,488 characters. `accessibility.css` has 229 lines, and one of them holds 19,621
characters. To list the line count and longest line of every file:

```sh
for f in *.html *.css *.js; do
	awk -v f="$f" '{ if (length($0) > m) m = length($0) } END { print f, NR, m }' "$f"
done
```

A formatter turns a one-line change into a diff of a thousand lines, and the real
change disappears inside it. Edit these files in place with a targeted string
replacement, and leave the rest of the line as it is.

## Notes per Lab

**Accessibility.** `accessibility-examples.js` declares a top-level `const examples`,
and `accessibility.js` reads it from the global scope. Both files load as plain
`<script defer>` rather than modules, so the script order in `accessibility.html`
decides whether the page works. `drawWorkflowWires()` draws the connector arrows at
runtime from `getBoundingClientRect()` measurements, and a `ResizeObserver` plus a
one-second animation loop redraw them. If you change CSS that affects node geometry,
check the page at more than one viewport width.

**Recruitment.** The page is a journey of five stage cards (interest, expertise, slate,
review, next), and each card opens in a dialog. The visitor picks one of four channels
and one of three question routes. The review stage offers Approve, Edit, and Hold, and
the result is recorded in Slate.

**Retention.** The page opens as a compact illustrated card stack. Expanding it reveals
seven connected stage cards, and each card opens its visual in one native `<dialog>`.
`drawWires()` calculates the connectors from the cards' rendered positions. Keep its
`ResizeObserver` and redraw loop when you change card geometry. The dialog updates the
URL hash, returns focus to the opening card, and supports direct links to every stage.
All of this lives in `retention.js`, which has 15 collapsed lines.

**Data Bridge.** The files are still named `ontology.*`, and the page's meta
description still says "Fabric IQ ontology". The question trace advances every 1400 ms,
or every 2400 ms when `prefers-reduced-motion` matches. `qcard()` builds the card shell
with `innerHTML` and then writes each field with `textContent`. Keep those two steps
separate, so that card data cannot inject markup. `AGENTS` holds two agents, Leadership
Agent and Student Success Assistant, and each links to the live product.

**Virtual Teaching Assistant.** The Canvas, Blackboard, and D2L tablist works, but all
three panels still show a `.screenshot-placeholder` frame that reads "Product
screenshot forthcoming". Adding the screenshots is the remaining work. A course picker
links to three live courses, and each course has suggested questions with Copy
buttons.

**Campus Chat.** The argument for one licence that covers every model and every
person. It shows chat bubbles, because it illustrates people and models sharing one
thread. Its last section opens the real thread in the live product.

**Campus Chat Plus.** Everything in Campus Chat, plus custom agents. At the booth the
live product runs on the left screen and this Lab on the right, and the presenter does
the talking. The page borrows the layout of the Campus Chat Plus marketing video: each
section is one scene with a short headline and one visual, and there is no body copy.
Unlike the other Labs, the page is fluid rather than a fixed 620px column, so it
follows the window as the presenter resizes it beside the live demo. The page sits
against the left edge of the window, not in the centre. `main` is a size
container. Below 1000px of container width, each scene stacks the headline above a
visual up to 680px wide. From 1000px, the headline and the visual sit side by side.
Headline size and scene padding scale with `cqi` units.

The eight scenes are the scattered offices that join one hub, the composer's model
picker, the Agent Marketplace, one Educause Info answer with its sources, a group chat,
an orchestration agent calling three agents, the web widget, and four questions to
copy. The answer, group chat, and orchestration scenes play once when they scroll into
view, and each has a replay button. `player()` runs all three from step tables, so add
a beat by adding a row to `ANSWER`, `TURNS`, or `ORCH`. The Agents tab in the picker
lists the agents added in the marketplace scene.

The live agent is **Educause Info**, which covers EDUCAUSE 2026 in Denver (September 29
to October 2) and online (October 14 and 15). It appears in the chat's agent list, not
in the marketplace search. All four Copy questions were asked of the live agent on
2026-09-26 and returned real sessions. Name a date in a question, not "day two",
because the agent counts the preconference days. The model counts in `PROVIDERS` and
the skill names in `SKILLS` were copied from the live picker on 2026-09-26, and they
drift as models are added. The provider logos are `assets/logo-*.svg`, copied from Lobe Icons
(`@lobehub/icons-static-svg`, MIT). A new provider needs its own file there. The sessions, rooms, people, and other agents on the page
are fictional.

**Admin Console.** Seven sections, reached through a `<select>` jump menu. A Notes
checkbox shows the hidden `.pnote` presenter narration. The branding preview writes the
typed institution name with `textContent`. A link at the top opens the live admin
console at `admin.mind-platform.ai`.

**Pricing.** All prices sit in one block at the top of `pricing.js`. Its header comment lists the
pricing assumptions, which the page repeats in its notes. Unlike every other page, `pricing.html` uses relative paths such
as `./labs-navigation.css`. `pricing-redesign.css` overrides `.labs-navigation`, so the
navigation looks different on this page only. Edits to `pricing.css` do nothing.

## Check a change before you call it done

The repo has no tests, no linter, and no CI. Serve the directory and look at the page.

```sh
python3 -m http.server 8000
```

`file://` does not work, because most pages load CSS and JavaScript from root-absolute
paths. Use the `.html` URLs locally. Production drops the extension through
`cleanUrls`. Before you finish, move through the page with the keyboard, and view it at
a narrow width.

## Known problems

Do not fix these unless the user asks.

- `pricing.css` is not loaded by any page. It is the stylesheet that
  `pricing-redesign.css` replaced.
- `accessibility.css` has many selectors left over from an earlier design. The loop
  below flags 82 of 231 classes. Before you delete one, grep all the JavaScript, because
  several classes are applied at runtime.

  ```sh
  for c in $(grep -o '\.[a-zA-Z][a-zA-Z0-9_-]*' accessibility.css | sort -u | tr -d '.'); do
  	grep -qh -- "$c" accessibility.html accessibility*.js || echo "$c"
  done
  ```

- `assets/` holds 21 MB. No image has a `srcset`, a smaller derivative, or
  `loading="lazy"`. `recruitment-student.png` and `student-website-visit.png` (3.1 MB
  together) are not referenced by any page.
- Most internal links are written as `/x.html`, and `cleanUrls` serves `/x`. Each
  navigation inside the site costs one redirect in production.
- `accessibility.js` and `retention.js` write their own Tab cycling and their own
  backdrop-click-to-close for `<dialog>` elements that they open with `showModal()`.
  The browser already handles Tab inside a modal dialog.
- `assets/` still holds the three demo files that the old Campus Chat Plus run sheet
  handed out: `Maya_Quiz3_Graded.pdf`, `Nair_meeting_notes_Maya.txt`, and
  `Lakeview_Fall2025_FirstYear_Cohort.csv`. No page references them now.
- The favicon path differs by page. `accessibility.html` uses `assets/…`,
  `pricing.html` uses `./assets/…`, and every other page uses
  `/assets/campusmind-favicon.png`. `accessibility.html` and `recruitment.html` set no
  `theme-color`.
- The Pricing CSV export escapes quotes but does not guard against spreadsheet formula
  injection in the name and contact fields.
