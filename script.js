// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let tasks        = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex    = null;
let dragSrcIdx   = null;
let completedOpen = false;

// ══════════════════════════════════════════════
//  DOM REFS
// ══════════════════════════════════════════════
const taskForm          = document.getElementById('task-form');
const taskInput         = document.getElementById('task-input');
const dueDateInput      = document.getElementById('due-date-input');
const taskList          = document.getElementById('task-list');
const completedList     = document.getElementById('completed-list');
const completedSection  = document.getElementById('completed-section');
const completedToggle   = document.getElementById('completed-toggle');
const completedLabel    = document.getElementById('completed-toggle-label');
const emptyState        = document.getElementById('empty-state');
const progressBar       = document.getElementById('progress-bar');
const progressCount     = document.getElementById('progress-count');
const progressLabel     = document.getElementById('progress-label');
const modalOverlay      = document.getElementById('modal-overlay');
const editInput         = document.getElementById('edit-input');
const editDueInput      = document.getElementById('edit-due-input');
const saveEditBtn       = document.getElementById('save-edit-btn');
const cancelEditBtn     = document.getElementById('cancel-edit-btn');
const toastEl           = document.getElementById('toast');
const confettiCanvas    = document.getElementById('confetti-canvas');

// ══════════════════════════════════════════════
//  DUE DATE HELPERS
// ══════════════════════════════════════════════
function getDueBadge(dueDate) {
    if (!dueDate) return '';
    const today = new Date(); today.setHours(0,0,0,0);
    const due   = new Date(dueDate); due.setHours(0,0,0,0);
    const diff  = Math.round((due - today) / (1000 * 60 * 60 * 24));

    const label = formatDueLabel(diff, dueDate);
    let cls = 'on-time';
    if (diff < 0)  cls = 'overdue';
    else if (diff <= 2) cls = 'due-soon';

    return `<span class="due-badge ${cls}"><i class="fa-regular fa-calendar"></i>${label}</span>`;
}

function formatDueLabel(diff, dueDate) {
    if (diff < 0)  return `Overdue ${Math.abs(diff)}d`;
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    // Format nicely: e.g. "May 10"
    const d = new Date(dueDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ══════════════════════════════════════════════
//  BUILD TASK LI
// ══════════════════════════════════════════════
function buildTaskLi(task, i, isCompleted = false) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.draggable = !isCompleted;
    li.dataset.index = i;

    const dueBadge = task.completed ? '' : getDueBadge(task.dueDate);

    li.innerHTML = `
        ${!isCompleted ? '<i class="fa-solid fa-grip-lines drag-handle"></i>' : '<span style="width:14px;flex-shrink:0"></span>'}
        <div class="task-checkbox" data-index="${i}"></div>
        <span class="task-text">${escapeHTML(task.text)}</span>
        ${dueBadge}
        <div class="task-actions">
            <button class="btn-edit"   data-index="${i}" title="Edit"><i class="fa-solid fa-pencil"></i></button>
            <button class="btn-delete" data-index="${i}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    if (!isCompleted) {
        li.addEventListener('dragstart', onDragStart);
        li.addEventListener('dragover',  onDragOver);
        li.addEventListener('dragleave', onDragLeave);
        li.addEventListener('drop',      onDrop);
        li.addEventListener('dragend',   onDragEnd);
    }

    return li;
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function render() {
    taskList.innerHTML     = '';
    completedList.innerHTML = '';

    const pending   = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t =>  t.completed);

    // ── Empty state (only when no pending tasks) ──
    emptyState.style.display = pending.length === 0 ? 'flex' : 'none';

    // ── Pending tasks ──
    pending.forEach((task) => {
        const i  = tasks.indexOf(task);
        taskList.appendChild(buildTaskLi(task, i, false));
    });

    // ── Completed collapsible ──
    if (completed.length > 0) {
        completedSection.style.display = 'flex';
        completedLabel.textContent = `Completed (${completed.length})`;
        completed.forEach((task) => {
            const i = tasks.indexOf(task);
            completedList.appendChild(buildTaskLi(task, i, true));
        });
    } else {
        completedSection.style.display = 'none';
        completedSection.classList.remove('open');
        completedOpen = false;
    }

    updateProgress();
    saveTasks();
    checkDeadlines();
}

// ══════════════════════════════════════════════
//  COLLAPSIBLE TOGGLE
// ══════════════════════════════════════════════
completedToggle.addEventListener('click', () => {
    completedOpen = !completedOpen;
    completedSection.classList.toggle('open', completedOpen);
});

// ══════════════════════════════════════════════
//  DEADLINE REMINDER (on load & every minute)
// ══════════════════════════════════════════════
function checkDeadlines() {
    const today = new Date(); today.setHours(0,0,0,0);
    tasks.filter(t => !t.completed && t.dueDate).forEach(t => {
        const due  = new Date(t.dueDate); due.setHours(0,0,0,0);
        const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
        if (diff === 0) showToast(`⏰ "${t.text}" is due today!`, 4000);
        else if (diff < 0) showToast(`🔴 "${t.text}" is overdue!`, 4000);
    });
}
setInterval(checkDeadlines, 60000); // re-check every minute

// ══════════════════════════════════════════════
//  PROGRESS
// ══════════════════════════════════════════════
let lastCompleted = -1;

function updateProgress() {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressBar.style.width   = pct + '%';
    progressCount.textContent = `${completed} / ${total}`;

    if (total === 0)      progressLabel.textContent = 'No tasks yet!';
    else if (pct === 100) progressLabel.textContent = '🎉 All Done!';
    else if (pct >= 50)   progressLabel.textContent = 'Keep it Up!';
    else                  progressLabel.textContent = 'Just Getting Started!';

    if (total > 0 && completed === total && lastCompleted !== total) {
        lastCompleted = total;
        launchConfetti();
    } else if (completed !== total) {
        lastCompleted = -1;
    }
}

// ══════════════════════════════════════════════
//  ADD TASK
// ══════════════════════════════════════════════
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) { shakeInput(); return; }
    tasks.push({ text, completed: false, dueDate: dueDateInput.value || null });
    taskInput.value    = '';
    dueDateInput.value = '';
    render();
    showToast('✅ Task added!');
});

function shakeInput() {
    taskInput.style.animation = 'shake 0.35s ease';
    taskInput.addEventListener('animationend', () => taskInput.style.animation = '', { once: true });
}

// ══════════════════════════════════════════════
//  DELEGATED EVENTS — both lists
// ══════════════════════════════════════════════
[taskList, completedList].forEach(list => {
    list.addEventListener('click', (e) => {
        const checkbox  = e.target.closest('.task-checkbox');
        const editBtn   = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');

        if (checkbox) {
            const i = parseInt(checkbox.dataset.index);
            tasks[i].completed = !tasks[i].completed;
            render();
            showToast(tasks[i].completed ? '✔️ Task completed!' : '↩️ Marked incomplete');
        }

        if (editBtn) {
            const i = parseInt(editBtn.dataset.index);
            editIndex = i;
            editInput.value    = tasks[i].text;
            editDueInput.value = tasks[i].dueDate || '';
            modalOverlay.classList.add('active');
            editInput.focus();
        }

        if (deleteBtn) {
            const i = parseInt(deleteBtn.dataset.index);
            tasks.splice(i, 1);
            render();
            showToast('🗑️ Task deleted');
        }
    });
});

// ══════════════════════════════════════════════
//  EDIT MODAL
// ══════════════════════════════════════════════
saveEditBtn.addEventListener('click', () => {
    const text = editInput.value.trim();
    if (!text) return;
    tasks[editIndex].text    = text;
    tasks[editIndex].dueDate = editDueInput.value || null;
    closeModal();
    render();
    showToast('✏️ Task updated!');
});

cancelEditBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active')) saveEditBtn.click();
});

function closeModal() {
    modalOverlay.classList.remove('active');
    editIndex = null;
}

// ══════════════════════════════════════════════
//  DRAG & DROP (pending tasks only)
// ══════════════════════════════════════════════
function onDragStart(e) {
    dragSrcIdx = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}
function onDragLeave() { this.classList.remove('drag-over'); }
function onDrop(e) {
    e.preventDefault();
    const targetIdx = parseInt(this.dataset.index);
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
    const moved = tasks.splice(dragSrcIdx, 1)[0];
    tasks.splice(targetIdx, 0, moved);
    render();
    showToast('↕️ Task reordered');
}
function onDragEnd() {
    document.querySelectorAll('.task-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
    dragSrcIdx = null;
}

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
let toastTimer;
function showToast(msg, duration = 2500) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ══════════════════════════════════════════════
//  CONFETTI — rises from BOTTOM upward
// ══════════════════════════════════════════════
const ctx = confettiCanvas.getContext('2d');
let particles = [], confettiRunning = false;

function resizeCanvas() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomColor() {
    const colors = ['#ff6f91','#ff9db5','#ffd47e','#ffb347','#80e0a0','#a0c4ff','#ffffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createParticle() {
    return {
        x:     Math.random() * confettiCanvas.width,
        y:     confettiCanvas.height + 10,
        r:     Math.random() * 7 + 4,
        color: randomColor(),
        speed: Math.random() * 4 + 2,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.2,
        drift: (Math.random() - 0.5) * 1.5,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
}

function launchConfetti() {
    particles = Array.from({ length: 130 }, createParticle);
    if (!confettiRunning) animateConfetti();
}

function animateConfetti() {
    confettiRunning = true;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 1.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
    });
    particles = particles.filter(p => p.y > -20);
    if (particles.length > 0) requestAnimationFrame(animateConfetti);
    else { confettiRunning = false; ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
}`;
document.head.appendChild(styleEl);

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
render();