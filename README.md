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
| 01 | Accessibility | Document remediation | Reveal the five-step remediation loop and open any stage in place. In AI remediation, compare six sample documents before and after. |
| 02 | Recruitment | Prospective-student questions | Step through four kinds of student question and see which specialist answers each one. One question escalates to a person. Approve, edit, or hold the draft reply. |
| 03 | Retention | Early identification and coordinated student support | Expand a seven-stage visual flow, then open each stage to see student signals, institutional triggers, configured points, response thresholds, outreach, advisor context, and early intervention. |
| 04 | Ontology | The semantic layer over campus systems | Open any of six architecture layers. Run an animated trace of one question through all of them. Compare 13 × u point-to-point integrations against 13 + u. |
| 05 | Virtual Teaching Assistant | Student support inside the LMS | Switch between Canvas, Blackboard, and D2L. Read the example question categories. The screenshots are still placeholders. |
| 06 | Agent Studio | Agent design and governance | Follow a concise path from institutional purpose through agent design, connected knowledge, testing, and governed release. |
| 07 | LLM Chat | Campus-wide access to every model | A run sheet for the live demo, in the order it is presented. Jump to any of the three runs, copy each of the 24 prompts straight into the product, watch an agent reach out to Canvas or through Fabric to the systems of record, and browse 23 models by provider at the step where the model changes. |

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

`assets/` holds 21 MB, mostly the twelve before and after PNGs that the Accessibility Lab
swaps between. It also holds the three synthetic files the LLM Chat Lab hands a presenter to
drag into the demo: a graded quiz PDF, a page of meeting notes, and a cohort CSV.

```sh
du -sh assets
```

Downscale any image you add. Nothing in this repo optimizes images.
