# Conduit

A personal start page / dashboard that brings your most-used links, tools, and daily planning into a single dark-themed hub. Built as a static site with Firebase for optional cloud sync.

![Conduit demo screenshot](./conduit.png)

🔗 **Live demo / homepage:** [shams-27.github.io/conduit/](https://shams-27.github.io/conduit/)

## Why Conduit?

Most people don't have a tab problem — they have a *retrieval* problem. A hundred open tabs and a bookmarks bar three rows deep both promise "I'll find it when I need it," and both quietly fail. You end up re-Googling things you've already found a dozen times, or scrolling a folder of bookmarks named `New Folder (3)`.

Conduit fixes this by being **one tab, always in the same place, that already knows where everything is.** Pin it, and it stops being another tab competing for space — it becomes the *first* tab, the home base every other tab spins off from and closes back into. Your AI tools, your judge sites, your university portal, your calendar, your own shortcuts — one glance, zero searching.

It's not a bookmarks manager you have to maintain. It's a **home screen for your browser.**

## User Manual

### Pin Conduit to your browser for one-click access

Pinning keeps Conduit permanently docked at the start of your tab bar — small, out of the way, and always one click away, on every window you open.

**Google Chrome / Microsoft Edge / Safari / Firefox / Brave**
1. Open Conduit in a tab.
2. Right-click the tab.
3. Select **Pin tab** (Chrome/Brave) or **Pin** (Edge).

Once pinned, Conduit shrinks to an icon-only tab that stays put — even across restarts on most browsers — so it never gets lost or accidentally closed with the rest of your session.

> **Tip:** Set Conduit as your browser's homepage / new-tab page for the same effect on every fresh window, not just pinned tabs.

## Features

- **Curated resource grid** — Links organized into cards by category (AI tools, learning platforms, DSA/competitive programming judges, dev tools, productivity apps, and more), so everything you reach for daily is one click away.
- **Quick bookmark tray** — Add, save, and delete your own custom shortcuts directly from the header without editing any code.
- **DIU Hub dropdown** — One-click access to Daffodil International University's student portal, result page, e-learning (BLC), routine, notice board, academic calendar, and QBank.
- **Built-in calendar** — A lightweight month-view calendar with previous/next navigation, accessible from the header.
- **Google sign-in with cloud sync** — Log in with your Google account (via Firebase Authentication) to save your custom bookmarks to Firestore and access them from any device. Without login, bookmarks are stored locally in the browser.
- **Responsive masonry layout** — Cards automatically reflow to fill the available space.

## Tech Stack

- **HTML5 / CSS3** — Semantic markup styled with CSS custom properties, JetBrains Mono typography, and a card-based dark theme.
- **Vanilla JavaScript (ES Modules)** — No frontend framework or build step required.
- **Firebase**
  - Authentication (Google Sign-In)
  - Firestore (per-user bookmark storage)

## Getting Started

### Prerequisites

- A modern web browser
- (Optional, for cloud sync) A [Firebase](https://firebase.google.com/) project with **Authentication** (Google provider) and **Firestore** enabled

### Run locally

1. Clone the repository
   ```bash
   git clone https://github.com/shams-27/conduit.git
   cd conduit
   ```
2. Open `index.html` directly in your browser, or serve the folder with any static file server, e.g.:
   ```bash
   npx serve .
   ```
3. Visit the served URL (or the opened file) in your browser.

### Enabling cloud sync (optional)

The app ships pointed at a demo Firebase project. To use your own:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method → Google**.
3. Enable **Firestore Database**.
4. Replace the `firebaseConfig` object in `index.html` with your project's config values.

## Project Structure

```
conduit/
├── index.html   # Markup, layout, and Firebase config
├── style.css    # Theme, layout, and component styling
├── script.js    # Dropdowns, calendar, bookmarks, auth, and Firestore sync logic
└── README.md
```

## Usage

- Click any card link to open it in a new tab.
- Use the **+** button in the header tray to add a personal quick-access bookmark.
- Click **DIU Hub** or the calendar icon to open their respective dropdowns.
- Click **Login with Google** to sync your bookmarks across devices.

## Contributing

Issues and pull requests are welcome. If you'd like to add a new resource card or link category, feel free to open a PR.

## License

This project currently has no license specified. All rights reserved by the author unless stated otherwise.

## Author

**Shams Kabir**
[GitHub](https://github.com/shams-27) · [Repository](https://github.com/shams-27/conduit)
