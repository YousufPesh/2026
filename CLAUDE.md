# CLAUDE.md

Guidance for agents working in this repo. For what the Labs are, read `README.md`.

## These pages are demos, not the product

Five pages, one per CampusMind offering. A presenter drives each one during a live
demo. All data is written into the page's own JavaScript. Do not add API calls,
analytics, or storage unless the user asks for them. Every page tells its reader that
the content is illustrative, and that statement has to stay true.

## Constraints

- Add no build step and no dependencies. There is no `package.json`, bundler, or
  framework, and Vercel serves the files as they are.
- Add no web fonts. The four brand Labs use `-apple-system, BlinkMacSystemFont,
  "Segoe UI"`. Accessibility and Virtual Teaching Assistant use `Inter, "Avenir Next"`.
- Keep the three-file naming. Every Lab is `<lab>.html`, `<lab>.css`, and `<lab>.js` at
  the repo root. Add no subdirectories and no shared modules. Accessibility is the one
  exception, because it also loads `accessibility-examples.js`.
- Match the existing accessibility standard. These pages use tablists with roving
  `tabIndex`, `aria-pressed` toggles, `aria-live` regions, visible focus rings, and
  `prefers-reduced-motion` branches. One of the Labs demos an accessibility product.

## The duplication is deliberate

Every stylesheet declares its own `:root` tokens, `.shell`, `.masthead`,
`.section-nav`, and `.eyebrow`. Every JavaScript file defines its own `$`. Three Labs
implement scroll tracking, two of them with identical code.

Do not extract a shared stylesheet or a shared JavaScript module on your own
initiative. A presenter who edits one Lab on the morning of a talk cannot break the
other four. If the user asks for consolidation, that is a real task. Otherwise, leave
it.

The tokens already differ on purpose. `--gold` is `#e8b949` in `recruitment.css` and
`#a67312` in both `retention.css` and `ontology.css`.
`virtual-teaching-assistant.css` defines `--gold-soft` instead, and `home.css` defines
no gold at all. `accessibility.css` uses a different palette: `--teal: #306d7e`,
`--deep`, `--pale`, and `--border`.

## Do not run a formatter

Three formatting styles coexist in this repo.

| Style | Files |
|-------|-------|
| Pretty-printed | `index.html`, `home.css`, `labs-navigation.css`, `virtual-teaching-assistant.*` |
| One rule or element per line | `ontology.html`, `ontology.css` |
| Collapsed whitespace | `accessibility.*`, `recruitment.*`, `retention.*` |

The collapsed files are complete pages, not stubs. `recruitment.html` holds 15.6 KB on
11 lines, and `accessibility.css` holds one line of 19,621 characters. To see the
longest line in a file:

```sh
awk '{ if (length($0) > m) m = length($0) } END { print FILENAME, m }' accessibility.css
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

**Recruitment.** `recruitment.js` registers a browser-agent tool through
`document.modelContext.registerTool`. The call uses optional chaining and aborts on
`pagehide`. No other Lab does this, and nothing in the repo records whether it is an
experiment or the start of a convention. Ask before you copy it to another Lab or
delete it.

**Retention.** `render()` rebuilds six sections from a single `state` object. The
weight inputs accept a number only when `0 <= n <= 50` and `n % 5 === 0`. They set
`aria-invalid` and restore the last valid value on blur. Keep that check. The page also
preserves the open state of every `<details>` element across re-renders on purpose.

**Ontology.** The largest JavaScript file at 431 lines, and the only file with section
comments. The question trace advances every 1500 ms, or every 2600 ms when
`prefers-reduced-motion` matches. `qcard()` builds the card shell with `innerHTML` and
then writes each field with `textContent`. Keep those two steps separate, so that card
data cannot inject markup.

**Virtual Teaching Assistant.** The smallest Lab, and the only unfinished one. All
three LMS panels show a `.screenshot-placeholder` frame that reads "Product screenshot
forthcoming". The tablist works. Adding the screenshots is the remaining work.

## Check a change before you call it done

The repo has no tests, no linter, and no CI. Serve the directory and look at the page.

```sh
python3 -m http.server 8000
```

`file://` does not work, because the pages load CSS and JavaScript from root-absolute
paths. Use the `.html` URLs locally. Production drops the extension through
`cleanUrls`. Before you finish, move through the page with the keyboard, and view it at
a narrow width.

## Known problems

Do not fix these unless the user asks.

- `accessibility.css` has 35 unused class selectors out of 138, and `recruitment.css`
  has 14 out of 99. Both sets are left over from an earlier design. Before you delete a
  selector that looks unused, grep the JavaScript too, because several classes are
  applied at runtime. To list them again:

  ```sh
  for c in $(grep -o '\.[a-zA-Z][a-zA-Z0-9_-]*' accessibility.css | sort -u | tr -d '.'); do
  	grep -qh -- "$c" accessibility.html accessibility*.js || echo "$c"
  done
  ```

- `assets/` holds 21 MB. No image has a `srcset` or a smaller derivative, and only
  `recruitment-student.png` sets `loading="lazy"`. `recruitment.html` declares
  `width="1024"` and `height="1024"` on two images that are 1254 by 1254 pixels. Both
  are square, so the page does not shift.
- Every internal link is written as `/x.html`, and `cleanUrls` serves `/x`. Each
  navigation inside the site costs one redirect in production.
- `accessibility.js` writes its own Tab cycling and its own backdrop-click-to-close for
  `<dialog>` elements that it opens with `showModal()`. The browser already does both.
- `ontology.css` hardcodes `scroll-padding-top: 95px` for the same sticky navigation
  that `retention.js` measures into `--section-nav-height`.
- The favicon is declared three ways. `index.html`, `ontology.html`, and
  `virtual-teaching-assistant.html` use `/assets/campusmind-favicon.png`.
  `accessibility.html` uses the relative path `assets/campusmind-favicon.png`.
  `recruitment.html` and `retention.html` use an inline SVG data URI that does not match
  the PNG mark. `accessibility.html` and `recruitment.html` set no `theme-color`.
