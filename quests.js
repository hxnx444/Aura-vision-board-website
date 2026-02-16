document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('quest-list');
    const input = document.getElementById('quest-input');
    const difficultySelect = document.getElementById('quest-difficulty');
    const addBtn = document.getElementById('add-quest-btn');
    const levelDisplay = document.getElementById('quest-player-level');

    // Notification Helper
    window.showNotification = window.showNotification || function(message) {
        const n = document.createElement('div');
        n.textContent = message;
        n.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--primary); color:#fff; padding:1rem; border-radius:8px; z-index:1000; font-weight:bold;";
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    };

    function updateLevelDisplay() {
        const stats = JSON.parse(localStorage.getItem('player_stats'));
        if (stats && levelDisplay) {
            levelDisplay.textContent = stats.level;
        }
    }

    function loadQuests() {
        list.innerHTML = '';
        const quests = JSON.parse(localStorage.getItem('active_quests')) || [];

        if (quests.length === 0) {
            list.innerHTML = '<p style="opacity:0.5; text-align:center;">No active quests. Initialize one above.</p>';
            return;
        }

        quests.forEach(quest => {
            const item = document.createElement('div');
            item.className = 'roadmap-item';
            item.style.borderLeft = `4px solid ${getDifficultyColor(quest.xp)}`;
            
            item.innerHTML = `
                <div style="display:flex; flex-direction:column;">
                    <span style="color: #fff; font-size: 1.1rem;">${quest.text}</span>
                    <span style="color: var(--text-dim); font-size: 0.8rem;">Reward: +${quest.xp} XP</span>
                </div>
                <button class="action-btn" style="width: auto; margin: 0;">COMPLETE</button>
            `;

            item.querySelector('button').addEventListener('click', () => {
                completeQuest(quest);
            });

            list.appendChild(item);
        });
    }

    function getDifficultyColor(xp) {
        if (xp >= 100) return '#ff0099'; // Epic
        if (xp >= 50) return '#ff9900';  // Hard
        if (xp >= 30) return '#00f3ff';  // Medium
        return '#00ff88';                // Easy
    }

    function completeQuest(quest) {
        // Remove from list
        let quests = JSON.parse(localStorage.getItem('active_quests')) || [];
        quests = quests.filter(q => q.id !== quest.id);
        localStorage.setItem('active_quests', JSON.stringify(quests));

        // Increase Productivity
        let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
        skills.productivity = parseFloat((skills.productivity + 0.5).toFixed(1));
        localStorage.setItem('skill_levels', JSON.stringify(skills));

        // Add XP
        let stats = JSON.parse(localStorage.getItem('player_stats')) || { level: 1, xp: 0, xpToNext: 100 };
        stats.xp += parseInt(quest.xp);
        stats.questsCompleted = (stats.questsCompleted || 0) + 1;
        
        if (stats.xp >= stats.xpToNext) {
            stats.level++;
            stats.xp -= stats.xpToNext;
            stats.xpToNext = Math.floor(stats.xpToNext * 1.2);
            showNotification(`LEVEL UP! Welcome to Level ${stats.level}`);
        } else {
            showNotification(`Quest Complete! +${quest.xp} XP | Productivity Up!`);
        }
        localStorage.setItem('player_stats', JSON.stringify(stats));

        loadQuests();
        updateLevelDisplay();
    }

    addBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;
        const xp = difficultySelect.value;
        const quests = JSON.parse(localStorage.getItem('active_quests')) || [];
        quests.push({ id: Date.now(), text, xp });
        localStorage.setItem('active_quests', JSON.stringify(quests));
        input.value = '';
        loadQuests();
    });

    updateLevelDisplay();
    loadQuests();
});