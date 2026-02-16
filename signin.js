document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('username-input');
    const btn = document.getElementById('signin-btn');

    // Load existing name
    const stats = JSON.parse(localStorage.getItem('player_stats'));
    if (stats && stats.name) {
        input.value = stats.name;
    }

    function saveAndRedirect() {
        const name = input.value.trim();
        if (!name) {
            alert("Identity required.");
            return;
        }

        const currentStats = JSON.parse(localStorage.getItem('player_stats')) || {
            level: 1, xp: 0, xpToNext: 100
        };

        currentStats.name = name;
        localStorage.setItem('player_stats', JSON.stringify(currentStats));
        window.location.href = 'index.html';
    }

    btn.addEventListener('click', saveAndRedirect);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveAndRedirect(); });
});