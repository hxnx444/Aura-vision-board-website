// AURA System Core Logic

// Notification System
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Clear All Data
function clearAllData() {
    if (confirm('SYSTEM WARNING: This will wipe all your progress and settings. Are you sure?')) {
        localStorage.clear();
        showNotification('System reset complete.');
        setTimeout(() => location.reload(), 1000);
    }
}

// Export Strategy
document.getElementById('export-btn')?.addEventListener('click', () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aura_strategy_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('Strategy exported successfully.');
});

// Modal Interactions
const modal = document.getElementById('dayModal');
const closeModal = document.getElementById('closeModal');
const saveTaskBtn = document.getElementById('saveDayTask');
const taskInput = document.getElementById('dayTaskInput');
const taskList = document.getElementById('dayTaskList');

if (modal && closeModal) {
    // Close Modal Logic
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Add Task Logic (Visual only for Home Page demo)
    if (saveTaskBtn && taskInput && taskList) {
        saveTaskBtn.addEventListener('click', () => {
            if (!taskInput.value.trim()) return;
            const li = document.createElement('li');
            li.textContent = taskInput.value;
            taskList.appendChild(li);
            taskInput.value = '';
            showNotification('Objective added to temporary buffer.');
        });
    }
}