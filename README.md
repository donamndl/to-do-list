# ✅ Glassmorphism To-Do App

A beautifully designed, fully functional **To-Do List** web application built with pure **HTML, CSS, and JavaScript** — no frameworks, no dependencies. Features a stunning glassmorphism UI, smooth animations, and a rich set of productivity features.

![To-Do App Preview](./images/preview.png)

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🔮 Glassmorphism UI | Frosted glass card with backdrop blur and subtle borders |
| 📊 Progress Tracker | Animated progress bar + live counter showing completed vs total |
| 📅 Due Dates | Set deadlines on tasks with color-coded urgency badges |
| ⏰ Deadline Reminders | Auto toast alerts for tasks due today or overdue, re-checked every minute |
| ✅ Completed Collapsible | Completed tasks fold into a separate collapsible section |
| 🔃 Drag & Drop | Reorder active tasks by dragging using the grip handle |
| 🎉 Confetti | Celebratory confetti rises from the bottom when all tasks are completed |
| ✏️ Edit Tasks | Update task text and due date via a sleek modal dialog |
| 🗑️ Delete Tasks | Remove tasks with a single click |
| 🔔 Toast Notifications | Non-intrusive feedback for every action |
| 💾 Persistent Storage | Tasks saved to `localStorage` — survive page refresh |
| 📱 Responsive Design | Fully optimized for mobile, tablet, and desktop |

---

## 📅 Due Date Badge Colors

| Badge | Meaning |
|---|---|
| 🔵 Blue — `May 10` | Due date is more than 2 days away |
| 🟡 Yellow — `Due Tomorrow` | Due within 2 days — pulses gently |
| 🔴 Red — `Overdue 3d` | Past the due date — pulses urgently |

---

## 📁 Project Structure

```
to-do-list/
│
├── index.html        # App markup & structure
├── style.css         # Glassmorphism styles & animations
├── script.js         # All app logic (tasks, due dates, drag & drop, confetti, etc.)
│
└── images/
    ├── background.jpg   # Starry night background image
    └── empty.avif       # Illustration shown when task list is empty
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension *(recommended)*

### Run Locally

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/donamndl/to-do-list.git
   ```

2. **Open the folder** in VS Code:
   ```bash
   cd to-do-list
   code .
   ```

3. **Start Live Server:**
   - Click **"Go Live"** in the VS Code status bar, or
   - Right-click `index.html` → **Open with Live Server**

4. Visit `http://127.0.0.1:5500/index.html` in your browser.

> ⚠️ **Important:** Always open the **folder** in VS Code, not just the file. Live Server requires a folder root to serve correctly.

---

## 🎮 How to Use

### Adding a Task
1. Type your task in the input field
2. Optionally pick a **due date** from the date picker
3. Press **Enter** or click the **+** button

### Managing Tasks
| Action | How |
|---|---|
| ✅ Complete a task | Click the circle checkbox on the left |
| ✏️ Edit a task | Click the **yellow pencil** button — update text or due date |
| 🗑️ Delete a task | Click the **pink trash** button |
| 🔃 Reorder tasks | Drag using the **⠿ grip handle** on the left |
| 🎉 Confetti | Complete **all tasks** to trigger confetti rising from the bottom |

### Completed Tasks
- Finished tasks move into a **"Completed (n)"** section below the active list
- Click the bar to **expand or collapse** it
- Completed tasks show no due date badge to keep things clean

---

## 🛠️ Built With

- **HTML5** — Semantic structure
- **CSS3** — Glassmorphism, Flexbox, CSS transitions, `backdrop-filter`
- **Vanilla JavaScript (ES6+)** — DOM manipulation, Drag & Drop API, Canvas API, Date API
- **Font Awesome 6** — Icons
- **Google Fonts** — Jost typeface
- **Web Storage API** — `localStorage` for data persistence

---

## ✨ Design Highlights

- **Glassmorphism card** using `backdrop-filter: blur()` with semi-transparent background
- **Smooth animations** — fade-in on load, slide-in for new tasks, pop-in for modal, collapsible expand
- **Custom confetti engine** built on HTML5 Canvas — particles rise from the bottom upward, no external library
- **Pulsing due date badges** — CSS keyframe animation for overdue and due-soon tasks
- **Input shake animation** when submitting an empty task
- **Drag-over visual feedback** with highlighted drop targets
- **Custom scrollbar** styled to match the pink color theme

---

## 🗺️ Roadmap

- [x] Due dates & deadline reminders
- [x] Completed tasks collapsible section
- [ ] Task categories / folders
- [ ] Priority tags (High / Medium / Low)
- [ ] Search & filter bar
- [ ] Dark / Light theme toggle
- [ ] Export tasks as PDF or CSV
- [ ] PWA support (offline mode)