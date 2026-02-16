document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.getElementById('calendar-body');
    const monthYearHeader = document.getElementById('calendar-month-year');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    // Modal Elements (reusing IDs from HTML)
    const modal = document.getElementById('dayModal');
    const modalDateTitle = document.getElementById('modalDate');
    const taskInput = document.getElementById('dayTaskInput');
    const saveBtn = document.getElementById('saveDayTask');
    const taskList = document.getElementById('dayTaskList');

    let currentDate = new Date();
    let selectedDateKey = null;

    function renderCalendar(date) {
        calendarBody.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Update Header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        monthYearHeader.textContent = `${monthNames[month]} ${year}`;

        // Days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarBody.appendChild(emptyCell);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day');
            
            const dateKey = `${year}-${month + 1}-${day}`;
            const savedTasks = JSON.parse(localStorage.getItem(`tasks_${dateKey}`)) || [];

            cell.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-preview">
                    ${savedTasks.length > 0 ? `<span class="dot"></span> ${savedTasks.length} Tasks` : ''}
                </div>
            `;

            cell.addEventListener('click', () => openDayModal(day, month, year));
            calendarBody.appendChild(cell);
        }
    }

    function openDayModal(day, month, year) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        modalDateTitle.textContent = `${monthNames[month]} ${day}, ${year}`;
        selectedDateKey = `${year}-${month + 1}-${day}`;
        
        loadTasksForDate(selectedDateKey);
        modal.style.display = 'flex';
    }

    function loadTasksForDate(key) {
        taskList.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem(`tasks_${key}`)) || [];
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task;
            taskList.appendChild(li);
        });
    }

    function saveCurrentTask() {
        if (!taskInput.value.trim() || !selectedDateKey) return;
        
        const tasks = JSON.parse(localStorage.getItem(`tasks_${selectedDateKey}`)) || [];
        tasks.push(taskInput.value.trim());
        localStorage.setItem(`tasks_${selectedDateKey}`, JSON.stringify(tasks));
        
        // Update UI
        loadTasksForDate(selectedDateKey);
        taskInput.value = '';
        renderCalendar(currentDate); // Refresh calendar to show dots
        showNotification('Objective Saved');
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Override/Augment the save button from script.js
    // We clone the node to remove previous listeners if we want clean slate, 
    // but here we just add our listener. script.js logic might run too, but that's visual only.
    saveBtn.addEventListener('click', saveCurrentTask);

    // Initial Render
    renderCalendar(currentDate);
});