document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('skill-assessment-form');

    // Notification Helper
    window.showNotification = window.showNotification || function(message) {
        const n = document.createElement('div');
        n.textContent = message;
        n.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--primary); color:#fff; padding:1rem; border-radius:8px; z-index:1000; font-weight:bold; box-shadow: 0 0 15px rgba(0,0,0,0.5);";
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 4000);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const prodScore = parseInt(formData.get('prod_consistency'));
        const healthScore = parseInt(formData.get('health_rating'));
        const creatScore = parseInt(formData.get('creat_rating'));

        // Get current skills or initialize
        let skills = JSON.parse(localStorage.getItem('skill_levels')) || {
            productivity: 1,
            health: 1,
            creativity: 1
        };

        // Logic: Score >= 7 triggers a level up
        let msg = "Assessment Complete!";
        let leveledUp = false;
        
        if (prodScore >= 7) { skills.productivity++; msg += "\n⚡ Productivity Level Up!"; leveledUp = true; }
        if (healthScore >= 7) { skills.health++; msg += "\n❤️ Health Level Up!"; leveledUp = true; }
        if (creatScore >= 7) { skills.creativity++; msg += "\n🎨 Creativity Level Up!"; leveledUp = true; }

        if (!leveledUp) {
            msg += "\nNo levels gained. Keep pushing!";
        }

        localStorage.setItem('skill_levels', JSON.stringify(skills));
        localStorage.setItem('last_skill_assessment', new Date().toISOString());
        
        // Award XP for completing the assessment
        let stats = JSON.parse(localStorage.getItem('player_stats')) || { xp: 0, xpToNext: 100, level: 1 };
        stats.xp += 50;
        
        if (stats.xp >= stats.xpToNext) {
            stats.level++;
            stats.xp -= stats.xpToNext;
            stats.xpToNext = Math.floor(stats.xpToNext * 1.2);
            msg += "\nPLAYER LEVEL UP!";
        }
        localStorage.setItem('player_stats', JSON.stringify(stats));

        showNotification(msg);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2500);
    });
});