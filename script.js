// ── State ──────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex = null;

// ── DOM References ─────────────────────────────────────
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

// ── Render ─────────────────────────────────────────────
function render() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        tasks.forEach((task, i) => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.completed ? ' completed' : '');

            li.innerHTML = `
                <div class="task-checkbox" data-index="${i}"></div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-edit" data-index="${i}" title="Edit">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-delete" data-index="${i}" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            taskList.appendChild(li);
        });
    }

    updateProgress();
    saveTasks();
}

// ── Progress ───────────────────────────────────────────
function updateProgress() {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressBar.style.width   = pct + '%';
    progressCount.textContent = `${completed} / ${total}`;

    if (total === 0)           progressLabel.textContent = 'No tasks yet!';
    else if (pct === 100)      progressLabel.textContent = '🎉 All Done!';
    else if (pct >= 50)        progressLabel.textContent = 'Keep it Up!';
    else                       progressLabel.textContent = 'Just Getting Started!';
}

// ── Add Task ───────────────────────────────────────────
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    taskInput.value = '';
    render();
});

// ── Delegated Events (check / edit / delete) ───────────
taskList.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.task-checkbox');
    const editBtn  = e.target.closest('.btn-edit');
    const deleteBtn= e.target.closest('.btn-delete');

    if (checkbox) {
        const i = parseInt(checkbox.dataset.index);
        tasks[i].completed = !tasks[i].completed;
        render();
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
    }
});

// ── Edit Modal ─────────────────────────────────────────
saveEditBtn.addEventListener('click', () => {
    const text = editInput.value.trim();
    if (!text) return;
    tasks[editIndex].text = text;
    closeModal();
    render();
});

cancelEditBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active')) {
        saveEditBtn.click();
    }
});

function closeModal() {
    modalOverlay.classList.remove('active');
    editIndex = null;
    editInput.value = '';
}

// ── Helpers ────────────────────────────────────────────
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ── Init ───────────────────────────────────────────────
render();