document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('yearly-roadmap-list');
    const input = document.getElementById('yearly-roadmap-input');
    const addBtn = document.getElementById('add-yearly-roadmap-btn');

    window.showNotification = window.showNotification || function(message) {
        const n = document.createElement('div');
        n.textContent = message;
        n.style.cssText = "position:fixed; bottom:20px; right:20px; background:#00ff88; color:#000; padding:1rem; border-radius:8px; z-index:1000;";
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    };

    const INITIAL_STATS = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        name: "Player1"
    };

    function loadRoadmap() {
        if (!list) return;
        list.innerHTML = '';
        const goals = JSON.parse(localStorage.getItem('yearly_roadmap')) || [];
        const yearlyGoals = goals.filter(g => g.type === 'yearly');
        
        if (yearlyGoals.length === 0) {
            list.innerHTML = '<p style="opacity:0.5; text-align:center;">No milestones set yet.</p>';
            return;
        }

        yearlyGoals.forEach(goal => {
            const item = document.createElement('div');
            item.className = 'roadmap-item';
            
            item.innerHTML = `
                <span style="color: #fff;">${goal.text}</span>
                <button class="delete-btn" style="color: #ff4444; background: none; border: none; cursor: pointer;">&times;</button>
            `;

            item.querySelector('.delete-btn').addEventListener('click', () => {
                const currentGoals = JSON.parse(localStorage.getItem('yearly_roadmap')) || [];
                const updatedGoals = currentGoals.filter(g => {
                    if (goal.id && g.id) return g.id !== goal.id;
                    return g.text !== goal.text || g.type !== 'yearly';
                });
                localStorage.setItem('yearly_roadmap', JSON.stringify(updatedGoals));
                loadRoadmap();
                showNotification('Milestone removed');
            });

            list.appendChild(item);
        });
    }

    if (addBtn && input) {
        addBtn.addEventListener('click', () => {
            const text = input.value.trim();
            if (!text) return;

            const goals = JSON.parse(localStorage.getItem('yearly_roadmap')) || [];
            goals.push({ id: Date.now(), text, type: 'yearly', completed: false });
            localStorage.setItem('yearly_roadmap', JSON.stringify(goals));
            
            let stats = JSON.parse(localStorage.getItem('player_stats')) || INITIAL_STATS;
            if (stats) {
                stats.xp += 10;
                if (stats.xp >= stats.xpToNext) {
                    stats.level++;
                    stats.xp -= stats.xpToNext;
                    stats.xpToNext = Math.floor(stats.xpToNext * 1.2);
                }
                localStorage.setItem('player_stats', JSON.stringify(stats));
            }

            input.value = '';
            loadRoadmap();
            showNotification('Yearly Milestone Initialized (+10 XP)');
        });
    }

    loadRoadmap();
});