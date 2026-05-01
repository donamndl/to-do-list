// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let tasks      = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex  = null;
let dragSrcIdx = null;

// ══════════════════════════════════════════════
//  DOM REFS
// ══════════════════════════════════════════════
const taskForm      = document.getElementById('task-form');
const taskInput     = document.getElementById('task-input');
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const progressBar   = document.getElementById('progress-bar');
const progressCount = document.getElementById('progress-count');
const progressLabel = document.getElementById('progress-label');
const modalOverlay  = document.getElementById('modal-overlay');
const editInput     = document.getElementById('edit-input');
const saveEditBtn   = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const toastEl       = document.getElementById('toast');
const confettiCanvas= document.getElementById('confetti-canvas');

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function render() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        tasks.forEach((task, i) => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.completed ? ' completed' : '');
            li.draggable = true;
            li.dataset.index = i;

            li.innerHTML = `
                <i class="fa-solid fa-grip-lines drag-handle"></i>
                <div class="task-checkbox" data-index="${i}"></div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-edit"   data-index="${i}" title="Edit">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-delete" data-index="${i}" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            li.addEventListener('dragstart', onDragStart);
            li.addEventListener('dragover',  onDragOver);
            li.addEventListener('dragleave', onDragLeave);
            li.addEventListener('drop',      onDrop);
            li.addEventListener('dragend',   onDragEnd);

            taskList.appendChild(li);
        });
    }

    updateProgress();
    saveTasks();
}

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

    if (total === 0)       progressLabel.textContent = 'No tasks yet!';
    else if (pct === 100)  progressLabel.textContent = '🎉 All Done!';
    else if (pct >= 50)    progressLabel.textContent = 'Keep it Up!';
    else                   progressLabel.textContent = 'Just Getting Started!';

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
    tasks.push({ text, completed: false });
    taskInput.value = '';
    render();
    showToast('Task added!');
});

function shakeInput() {
    taskInput.style.animation = 'shake 0.35s ease';
    taskInput.addEventListener('animationend', () => taskInput.style.animation = '', { once: true });
}

// ══════════════════════════════════════════════
//  DELEGATED EVENTS
// ══════════════════════════════════════════════
taskList.addEventListener('click', (e) => {
    const checkbox  = e.target.closest('.task-checkbox');
    const editBtn   = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (checkbox) {
        const i = parseInt(checkbox.dataset.index);
        tasks[i].completed = !tasks[i].completed;
        render();
        showToast(tasks[i].completed ? 'Task completed!' : 'Marked incomplete');
    }

    if (editBtn) {
        const i = parseInt(editBtn.dataset.index);
        editIndex = i;
        editInput.value = tasks[i].text;
        modalOverlay.classList.add('active');
        editInput.focus();
    }

    if (deleteBtn) {
        const i = parseInt(deleteBtn.dataset.index);
        tasks.splice(i, 1);
        render();
        showToast('Task deleted');
    }
});

// ══════════════════════════════════════════════
//  EDIT MODAL
// ══════════════════════════════════════════════
saveEditBtn.addEventListener('click', () => {
    const text = editInput.value.trim();
    if (!text) return;
    tasks[editIndex].text = text;
    closeModal();
    render();
    showToast('Task updated!');
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
//  DRAG & DROP
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
function onDragLeave() {
    this.classList.remove('drag-over');
}
function onDrop(e) {
    e.preventDefault();
    const targetIdx = parseInt(this.dataset.index);
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
    const moved = tasks.splice(dragSrcIdx, 1)[0];
    tasks.splice(targetIdx, 0, moved);
    render();
    showToast('Task reordered');
}
function onDragEnd() {
    document.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
    dragSrcIdx = null;
}

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════════
//  CONFETTI — rises from the BOTTOM upward
// ══════════════════════════════════════════════
const ctx = confettiCanvas.getContext('2d');
let particles = [];
let confettiRunning = false;

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
        y:     confettiCanvas.height + 10,   // spawn below screen
        r:     Math.random() * 7 + 4,
        color: randomColor(),
        speed: Math.random() * 4 + 2,        // upward speed
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.2,
        drift: (Math.random() - 0.5) * 1.5, // slight horizontal sway
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
        p.y     -= p.speed;  // move UP
        p.x     += p.drift;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
            ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });

    // Remove particles once they've risen off the top
    particles = particles.filter(p => p.y > -20);

    if (particles.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiRunning = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
}`;
document.head.appendChild(style);

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
render();