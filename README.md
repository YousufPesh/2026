# CampusMind Labs

Interactive companion pages for CampusMind product demonstrations.

Each Lab is one page. A presenter opens it during a live demo of one CampusMind
offering. Every number, quote, and scenario is written into the page's own JavaScript.
No page calls an API, and no page sends data anywhere. The disclaimers printed on the
pages ("Illustrative", "Synthetic illustrations · Not product outputs") are accurate,
and they have to stay accurate.

Vercel deploys `main` automatically on merge.

## The Labs

| # | Lab | Offering | What a visitor can do |
|---|-----|----------|-----------------------|
| 01 | Accessibility | Document remediation | Open any of the five workflow steps. Pick one of six sample documents, and it stays selected through every step, with before and after images. |
| 02 | Recruitment | Prospective-student questions | Step through four kinds of student question and see which specialist answers each one. One question escalates to a person. Approve, edit, or hold the draft reply. |
| 03 | Retention | Risk scoring from student signals | Turn signals on and off, set weights and thresholds, and watch the score, the risk bands, and the advisor briefing recompute. |
| 04 | Ontology | The semantic layer over campus systems | Open any of six architecture layers. Run an animated trace of one question through all of them. Compare 13 × u point-to-point integrations against 13 + u. |
| 05 | Virtual Teaching Assistant | Student support inside the LMS | Switch between Canvas, Blackboard, and D2L. Read the example question categories. The screenshots are still placeholders. |

## Run the Labs locally

The repo has no build step, no bundler, and no dependencies. Opening a page with
`file://` does not work, because every page loads its CSS and JavaScript from
root-absolute paths such as `/labs-navigation.css`. Serve the directory instead.

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Use the `.html` URLs locally, such as
`/ontology.html`. Production drops the extension, because `vercel.json` sets
`cleanUrls`, and a plain static server does not do that.

The repo has no tests, no linter, and no CI. To check a change, open the page in a
browser.

## One page per Lab

Every Lab is three files at the repo root, named the same way.

```
<lab>.html
<lab>.css
<lab>.js
```

`index.html` and `home.css` are the hub page. `labs-navigation.css` holds the top
navigation, and it is the only stylesheet that more than one page loads. No JavaScript
is shared between Labs, and there is no shared base stylesheet. Each Lab declares its
own `:root` design tokens.

## Assets

`assets/` holds 21 MB across 16 files, mostly the twelve before and after PNGs that the
Accessibility Lab swaps between.

```sh
du -sh assets
```

Downscale any image you add. Nothing in this repo optimizes images.
