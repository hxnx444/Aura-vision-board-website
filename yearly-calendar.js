document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('yearly-calendar-body');
    const yearDisplay = document.getElementById('calendar-year');
    const prevBtn = document.getElementById('prevYear');
    const nextBtn = document.getElementById('nextYear');

    // Modal
    const modal = document.getElementById('monthModal');
    const closeModal = document.getElementById('closeMonthModal');
    const modalTitle = document.getElementById('modalMonth');
    const input = document.getElementById('monthGoalInput');
    const addBtn = document.getElementById('saveMonthGoal');
    const list = document.getElementById('monthGoalList');

    let currentYear = new Date().getFullYear();
    let selectedMonthKey = null;

    function renderYear() {
        grid.innerHTML = '';
        yearDisplay.textContent = currentYear;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        months.forEach((m, index) => {
            const card = document.createElement('div');
            card.className = 'month-card'; // Needs CSS or inline styles
            card.style.cssText = "background: rgba(255,255,255,0.05); padding: 1rem; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s;";
            
            const key = `${currentYear}-${index}`;
            const goals = JSON.parse(localStorage.getItem(`month_goals_${key}`)) || [];

            card.innerHTML = `
                <h3 style="color: var(--neon-blue); margin-bottom: 0.5rem;">${m}</h3>
                <div style="font-size: 0.8rem; opacity: 0.7;">${goals.length} Goals</div>
            `;

            card.addEventListener('click', () => openModal(index, m));
            grid.appendChild(card);
        });
    }

    function openModal(monthIndex, monthName) {
        selectedMonthKey = `${currentYear}-${monthIndex}`;
        modalTitle.textContent = `${monthName} ${currentYear} Goals`;
        loadGoals();
        modal.style.display = 'flex';
    }

    function loadGoals() {
        list.innerHTML = '';
        const goals = JSON.parse(localStorage.getItem(`month_goals_${selectedMonthKey}`)) || [];
        goals.forEach(goal => {
            const li = document.createElement('li');
            li.textContent = goal;
            list.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        if(!input.value.trim() || !selectedMonthKey) return;
        
        const goals = JSON.parse(localStorage.getItem(`month_goals_${selectedMonthKey}`)) || [];
        goals.push(input.value.trim());
        localStorage.setItem(`month_goals_${selectedMonthKey}`, JSON.stringify(goals));
        
        input.value = '';
        loadGoals();
        renderYear(); // Update counts
        showNotification('Monthly Goal Added');
    });

    // Modal Close Logic
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });

    prevBtn.addEventListener('click', () => {
        currentYear--;
        renderYear();
    });
    nextBtn.addEventListener('click', () => {
        currentYear++;
        renderYear();
    });

    renderYear();
});