# Meelad Fest 2026 - Arts & Cultural Competition Web Portal

A high-performance **MVC (Model-View-Controller) Architecture** web application for managing Arts & Cultural Competitions, Live Stage Management, Judge Evaluation, Team Points Leaderboards, and **Public Mark Publishing**.

---

## 🌟 Key Features & Role Interfaces

### 1. 🌐 Public Home Page & Live Mark Publishing (`#home`, `#results`)
- **Published Scoreboards**: View verified program marks and grade certificates (A, B, C).
- **Filters & Search**: Filter by Category (*Sub-Junior, Junior, Senior, General*), Program Item, or Search candidate by Name/Chest Number.
- **Team Championship Standings**: Live tabulated total team points leaderboard.
- **Official Scorecards**: Modal popups displaying detailed criteria breakdown for candidates.

### 2. 🔐 Admin Access Portal (`#admin`)
- **Passcode Authentication**: Access secured with admin passcode (`admin123`).
- **Mark Publishing Hub**: Review judge submissions and toggle **Publish/Unpublish Marks** live on the public scoreboard.
- **Programs Manager**: Create & edit competition programs, assign criteria weightages, set total max marks.
- **Teams & Candidates Manager**: Register teams, candidates, and auto-assign Chest Numbers (e.g. `C-101`).
- **Judge Access Manager**: Manage Judge credentials and PINs.

### 3. 👥 Team Access Portal (`#team`)
- **Team Login**: Sign in with Team Code (e.g., `ALHUDA`) and PIN (`1111`).
- **Team Roster**: View registered candidates, assigned chest numbers, and enrolled events.
- **Live Stage Monitor**: Real-time tracking of team candidates performing on stage.
- **Team Points Summary**: View accumulated championship points.

### 4. ⚖️ Judge Access Portal (`#judge`)
- **Judge Login**: Sign in with Judge Code (e.g., `J-101`) and Secret PIN (`9999`).
- **Digital Scoring Sheet**:
  - Select active stage & performing chest number.
  - Interactive criteria sliders (*Tajweed/Rules, Pitch, Diction, Presentation*).
  - Real-time score total & grade badge calculation.
  - Submit & Lock Marks.

### 5. 🎙️ Stage Access & LED Screen Mode (`#stage`, `#led`)
- **Stage Control Console**: Call candidate chest numbers to stage, start performance, or clear stage.
- **Stage LED Screen Display Mode**: Full-screen high-contrast display for stage TV screens/projectors showing **ON STAGE NOW** performer info and queue.

---

## 🔐 Default Credentials & Passcodes

| Access Role | Identifier / Code | Passkey PIN | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | N/A | `admin123` | Full access to manage & publish marks |
| **Team 1** | `ALHUDA` | `1111` | Al-Huda Academy Portal |
| **Team 2** | `ANNOOR` | `2222` | An-Noor Institute Portal |
| **Team 3** | `ALFATH` | `3333` | Al-Fath College Portal |
| **Judge 1** | `J-101` | `9999` | Ustad Abdul Rahiman (Stage 1) |
| **Judge 2** | `J-102` | `8888` | Dr. Tariq Al-Mansoor (Stage 2) |
| **Judge 3** | `J-103` | `7777` | Prof. Hassan Basri (Stage 3) |

---

## 📁 Architecture Overview

```
meelad-site/
├── backend/                  # Server-side Express MVC Architecture
│   ├── routes/
│   │   └── api.js
│   └── server.js
├── public/                   # Client-side Modular MVC Architecture
│   ├── css/
│   │   └── styles.css        # Glassmorphism & Vibrant Design System
│   ├── js/
│   │   ├── models/           # Data Models & Reactive StateStore
│   │   │   ├── DataStore.js
│   │   │   └── StateManager.js
│   │   ├── views/            # View Template Renderers
│   │   │   ├── HeaderView.js
│   │   │   ├── PublicView.js
│   │   │   ├── AdminView.js
│   │   │   ├── TeamView.js
│   │   │   ├── JudgeView.js
│   │   │   ├── StageView.js
│   │   │   └── ModalView.js
│   │   ├── controllers/      # Action & Router Controllers
│   │   │   ├── AppController.js
│   │   │   ├── AuthController.js
│   │   │   ├── PublicController.js
│   │   │   ├── AdminController.js
│   │   │   ├── TeamController.js
│   │   │   ├── JudgeController.js
│   │   │   └── StageController.js
│   │   ├── router.js         # Hash Router
│   │   └── app.js            # App Bootstrap
│   └── index.html            # SPA Entrypoint
└── package.json
```

---

## 🚀 How to Run

Simply open `public/index.html` in any web browser! All data persists smoothly in browser LocalStorage.
Optionally, if Node.js is installed on your server environment, run:
```bash
npm start
```
and navigate to `http://localhost:3000`.
