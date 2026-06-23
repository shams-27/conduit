# Conduit

A clean, distraction-free study space for DIU students — everything you need for a productive session in one browser tab.

**Live:** [shams-27.github.io/conduit](https://shams-27.github.io/conduit/)

---

## What is Conduit?

Conduit is a personal browser start page designed around the DIU student workflow. Instead of hunting across tabs for your portal, BLC, or study tools, Conduit puts them all on a single, organized page — with a custom bookmark manager and Google sync so your space travels with you.

---

## Features

- **DIU Hub** — One-click access to Student Portal, BLC, Campus Schedule, DIU Routine, Notice Board, and Academic Calendar
- **Organized Study Links** — Curated sections for AI Assistants, Learning & Media, Google Tools, Toolbox, Communication, and Career resources
- **Custom Bookmarks** — Add your own links through a simple modal; they're saved and ready every session
- **Google Sync** — Sign in with Google to sync your custom bookmarks across all your devices
- **Guest Mode** — No login needed; your links are stored locally until you're ready to sync
- **No distractions** — No ads, no feeds, no noise — just your tools

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript (ES6) |
| Auth & Sync | Google OAuth / Firebase |
| Hosting | GitHub Pages |

---

## Project Structure

```
conduit/
├── index.html      # Layout and bookmark sections
├── style.css       # Styling and responsive design
├── script.js       # Auth, sync, and bookmark logic
└── fonts/          # Custom font assets
```

---

## Running Locally

No build step, no dependencies.

```bash
git clone https://github.com/Shams-27/conduit.git
cd conduit
```

Open `index.html` in your browser — or serve it locally for full Google login support:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

> Google login requires HTTP/HTTPS. Use a local server or deploy to GitHub Pages — opening `index.html` directly as a file won't support auth.

---

## Deploy Your Own

1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to the `main` branch, root `/`
4. Your personal study space is live at `https://<your-username>.github.io/conduit/`

---

## License

[MIT](LICENSE)
