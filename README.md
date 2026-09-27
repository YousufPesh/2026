# CampusMind Labs

Interactive companion pages for CampusMind product demonstrations.

Each Lab is one page. A presenter opens it during a live demo of one CampusMind
offering. Every number, quote, and scenario is written into the page's own JavaScript.
No page calls an API, and no page sends data anywhere. The disclaimers printed on the
pages ("Illustrative", "Synthetic illustrations · Not product outputs") are accurate,
and they have to stay accurate.

Three pages link out to the live product at `app.mind-platform.ai`, so a presenter can
switch from the Lab to the real thing. Those are plain links, not API calls.

Vercel deploys `main` automatically on merge.

## The Labs

The hub at `index.html` lists eight Labs in this order.

| # | Lab | Files | What a visitor can do |
|---|-----|-------|-----------------------|
| 01 | Accessibility | `accessibility.*` | Reveal the five-stage remediation flow and open any stage in a dialog. Compare six sample documents before and after AI remediation. |
| 02 | Recruitment | `recruitment.*` | Walk a prospective student through five stages, from first interest to next step. Pick a channel and a question route, then approve, edit, or hold the counselor reply before it goes to Slate. |
| 03 | Retention | `retention.*` | Expand a seven-stage flow, then open each stage to see student signals, triggers, points, thresholds, outreach, advisor context, and intervention. |
| 04 | Data Bridge | `ontology.*` | Open any of six architecture layers. Run an animated trace of one question through all of them. Compare 13 × u point-to-point integrations against 13 + u. Open the two production agents in the live product. |
| 05 | Virtual Teaching Assistant | `virtual-teaching-assistant.*` | Switch between Canvas, Blackboard, and D2L. Pick one of three live courses, copy a suggested question, and ask it in the live course. |
| 06 | Campus Chat | `campus-chat.*` | See why one licence for every model beats separate subscriptions, with people and models in the same thread. Open the real thread in the live product. |
| 07 | Campus Chat Plus | `campus-chat-plus.*` | Eight scenes, each a headline and one visual: offices that each bought their own AI join one hub, the model picker, the Agent Marketplace, an Educause Info answer with its sources, a group chat, an orchestration agent, and the web widget. Copy four questions for the live Educause Info agent, or open a saved thread. |
| 08 | Admin Console | `admin-console.*` | Watch a runaway bill, then set caps by tenant, group, user, and agent. Compare enforcement modes, review roles and permissions, and preview institution branding. |

`pricing.html` is not a Lab and has no hub card. It is a five-step quote builder that
the top navigation links to. It is the one page that stores data. It saves each copied
quote that carries a name or contact to `localStorage` under `campusmind-quotes`, and
it can export the saved quotes as a CSV file. Nothing leaves the browser.

## Run the Labs locally

The repo has no build step, no bundler, and no dependencies. Opening a page with
`file://` does not work, because most pages load their CSS and JavaScript from
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

The file name does not always match the Lab name. The Data Bridge Lab lives in
`ontology.*`. `index.html` and `home.css` are the hub page. The Pricing page loads
`pricing-redesign.css`, and `pricing.css` is no longer loaded by any page.

`labs-navigation.css` holds the top navigation, and it is the only stylesheet that more
than one page loads. No JavaScript is shared between pages, and there is no shared base
stylesheet. Each page declares its own `:root` design tokens.

## Assets

`assets/` holds 21 MB. Most of it is the twelve before and after PNGs that the
Accessibility Lab swaps between.

```sh
du -sh assets
```

Downscale any image you add. Nothing in this repo optimizes images.
