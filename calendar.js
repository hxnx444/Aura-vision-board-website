document.addEventListener('DOMContentLoaded', () => {
    const monthlyGrid = document.getElementById('monthly-grid');
    const yearlyGrid = document.getElementById('yearly-grid');
    const monthDisplay = document.getElementById('current-month-display');
    const yearDisplay = document.getElementById('current-year-display');
    
    // Modal Elements
    const eventModal = document.getElementById('event-modal');
    const eventInput = document.getElementById('event-input');
    const eventTimeInput = document.getElementById('event-time-input');
    const saveEventBtn = document.getElementById('save-event-btn');
    
    let currentDate = new Date();

    // --- Monthly Calendar Logic ---
    if (monthlyGrid) {
        // Check for URL params to set specific month/year
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        const monthParam = urlParams.get('month');
        if (yearParam && monthParam) {
            currentDate = new Date(parseInt(yearParam), parseInt(monthParam), 1);
        }

        renderMonthlyCalendar(currentDate);

        document.getElementById('prev-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderMonthlyCalendar(currentDate);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderMonthlyCalendar(currentDate);
        });

        // Modal Close Logic
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                if(eventModal) eventModal.classList.remove('open');
            });
        });
    }

    let selectedDateStr = null;

    function renderMonthlyCalendar(date) {
        monthlyGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Load Events
        const events = JSON.parse(localStorage.getItem('calendar_events')) || [];

        // Update Header
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthDisplay.textContent = `${monthNames[month]} ${year}`;

        // Add Day Headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day-header';
            el.textContent = day;
            monthlyGrid.appendChild(el);
        });

        // Calculate Days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day empty';
            el.style.background = 'rgba(0,0,0,0.2)';
            monthlyGrid.appendChild(el);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day';
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                el.classList.add('today');
            }
            
            el.innerHTML = `<span class="day-number">${i}</span>`;
            
            // Check for events
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            
            dayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || '')).forEach(ev => {
                const dot = document.createElement('div');
                dot.className = 'calendar-event-dot';
                dot.title = ev.title;
                el.appendChild(dot);
                
                const titleEl = document.createElement('div');
                titleEl.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
                titleEl.style.fontSize = '0.7rem';
                titleEl.style.color = 'var(--text)';
                titleEl.style.marginTop = '2px';
                titleEl.style.whiteSpace = 'nowrap';
                titleEl.style.overflow = 'hidden';
                titleEl.style.textOverflow = 'ellipsis';
                el.appendChild(titleEl);
            });

            // Click to add event
            el.addEventListener('click', () => {
                selectedDateStr = dateStr;
                if(eventModal) {
                    eventInput.value = '';
                    if(eventTimeInput) eventTimeInput.value = '';
                    eventModal.classList.add('open');
                    eventInput.focus();
                }
            });

            monthlyGrid.appendChild(el);
        }
    }

    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', () => {
            const title = eventInput.value.trim();
            const time = eventTimeInput ? eventTimeInput.value : '';
            if (!title || !selectedDateStr) return;

            const events = JSON.parse(localStorage.getItem('calendar_events')) || [];
            events.push({ id: Date.now(), date: selectedDateStr, title: title, time: time });
            localStorage.setItem('calendar_events', JSON.stringify(events));
            
            eventModal.classList.remove('open');
            renderMonthlyCalendar(currentDate);
        });
    }

    // --- Yearly Calendar Logic ---
    if (yearlyGrid) {
        const year = new Date().getFullYear();
        if (yearDisplay) yearDisplay.textContent = `${year} Overview`;
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const events = JSON.parse(localStorage.getItem('calendar_events')) || [];

        monthNames.forEach((name, index) => {
            const card = document.createElement('a');
            card.className = 'month-card';
            card.href = `monthly-calendar.html?year=${year}&month=${index}`;
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';
            
            const daysInMonth = new Date(year, index + 1, 0).getDate();
            let miniGridHTML = '<div class="mini-calendar">';
            
            for(let i=1; i<=daysInMonth; i++) {
                const dateStr = `${year}-${String(index + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const hasEvent = events.some(e => e.date === dateStr);
                miniGridHTML += `<div class="mini-day ${hasEvent ? 'has-event' : ''}">${i}</div>`;
            }
            miniGridHTML += '</div>';

            card.innerHTML = `
                <div class="month-title">${name}</div>
                ${miniGridHTML}
            `;
            yearlyGrid.appendChild(card);
        });
    }
});