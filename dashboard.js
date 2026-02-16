document.addEventListener('DOMContentLoaded', () => {
    window.showNotification = window.showNotification || function(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: #00ff88; color: #000; padding: 1rem;
            border-radius: 8px; z-index: 1000; font-weight: bold;
            box-shadow: 0 0 15px rgba(0,255,136,0.4);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    const INITIAL_STATS = {
        level: 5,
        xp: 450,
        xpToNext: 600,
        name: "Player1",
        streak: 0,
        lastLogin: null,
        questsCompleted: 0
    };

    let playerStats = JSON.parse(localStorage.getItem('player_stats')) || INITIAL_STATS;

    // --- Streak Logic ---
    if (typeof playerStats.streak === 'undefined') playerStats.streak = 0;
    
    const today = new Date().toDateString();
    if (playerStats.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (playerStats.lastLogin === yesterday.toDateString()) {
            playerStats.streak++;
            setTimeout(() => showNotification(`🔥 Daily Streak: ${playerStats.streak} Days!`), 1000);
        } else {
            playerStats.streak = 1;
        }
        playerStats.lastLogin = today;
        localStorage.setItem('player_stats', JSON.stringify(playerStats));
    }

    const levelEl = document.getElementById('player-level');
    const nameEl = document.querySelector('.player-name');
    const streakEl = document.getElementById('player-streak');
    const xpFillEl = document.getElementById('xp-fill');
    const xpTextEl = document.querySelector('.xp-text');

    function updateStatsUI() {
        if (nameEl) nameEl.textContent = playerStats.name;
        levelEl.textContent = playerStats.level;
        if (streakEl) streakEl.textContent = playerStats.streak;
        const percentage = (playerStats.xp / playerStats.xpToNext) * 100;
        xpFillEl.style.width = `${percentage}%`;
        xpTextEl.textContent = `${playerStats.xp} / ${playerStats.xpToNext} XP`;
        localStorage.setItem('player_stats', JSON.stringify(playerStats));
        checkAchievements();
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'player_stats' && e.newValue) {
            playerStats = JSON.parse(e.newValue);
            updateStatsUI();
        }
    });

    function addXP(amount) {
        playerStats.xp += amount;
        if (playerStats.xp >= playerStats.xpToNext) {
            playerStats.level++;
            playerStats.xp -= playerStats.xpToNext;
            playerStats.xpToNext = Math.floor(playerStats.xpToNext * 1.2);
            showNotification(`LEVEL UP! You are now Level ${playerStats.level}`);
        } else {
            showNotification(`+${amount} XP Gained!`);
        }
        updateStatsUI();
    }

    function updateVisionStats() {
        const visionItems = JSON.parse(localStorage.getItem('vision_board_items')) || [];
        const visionPreview = document.getElementById('vision-preview');
        
        if (!visionPreview) return;

        if (visionItems.length === 0) {
            visionPreview.innerHTML = '<div class="empty-state">Canvas is empty. Start visualizing!</div>';
            return;
        }

        let html = '';
        // Prioritize goals and text for preview
        const meaningfulItems = visionItems.filter(i => ['goal', 'text', 'note', 'inspiration'].includes(i.type));
        const itemsToShow = meaningfulItems.length > 0 ? meaningfulItems.slice(0, 3) : visionItems.slice(0, 3);

        itemsToShow.forEach(item => {
            let icon = '🔹';
            let text = 'Element';

            // Strip HTML tags for text preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.content;
            const cleanText = tempDiv.textContent.trim() || 'Untitled';

            switch(item.type) {
                case 'goal': icon = '🏆'; text = cleanText; break;
                case 'text': icon = 'Aa'; text = cleanText; break;
                case 'note': icon = '📝'; text = cleanText; break;
                case 'inspiration': icon = '💡'; text = cleanText; break;
                case 'image': icon = '🖼️'; text = 'Image Asset'; break;
                case 'color': icon = '🎨'; text = 'Color Block'; break;
                default: icon = '✨'; text = cleanText || 'Vision Item';
            }

            html += `
                <div class="vision-item" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem; background: rgba(255,255,255,0.05); border-radius: var(--btn-radius); margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 1rem;">${icon}</span>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem; color: var(--text);">${text}</span>
                </div>
            `;
        });

        if (visionItems.length > itemsToShow.length) {
            html += `<div style="text-align: center; font-size: 0.75rem; color: var(--text-dim); margin-top: 0.2rem;">+${visionItems.length - itemsToShow.length} more objects</div>`;
        }

        visionPreview.innerHTML = html;
    }

    function getSkillRank(level) {
        if (level >= 10) return "Grandmaster";
        if (level >= 8) return "Master";
        if (level >= 6) return "Expert";
        if (level >= 4) return "Adept";
        if (level >= 2) return "Apprentice";
        return "Novice";
    }

    function updateSkillTree() {
        const skillStatsContainer = document.querySelector('.skill-stats');
        if (!skillStatsContainer) return;

        const skills = JSON.parse(localStorage.getItem('skill_levels')) || {
            productivity: 1,
            health: 1,
            creativity: 1
        };

        skillStatsContainer.innerHTML = `
            <div class="skill-item">
                <div class="skill-header">
                    <span>⚡ Productivity</span>
                    <span class="skill-level">Lv. ${skills.productivity} - ${getSkillRank(skills.productivity)}</span>
                </div>
                <div class="skill-bar"><div class="skill-fill" style="width: ${Math.min(skills.productivity * 10, 100)}%"></div></div>
            </div>
            <div class="skill-item">
                <div class="skill-header">
                    <span>❤️ Health</span>
                    <span class="skill-level">Lv. ${skills.health} - ${getSkillRank(skills.health)}</span>
                </div>
                <div class="skill-bar"><div class="skill-fill" style="width: ${Math.min(skills.health * 10, 100)}%"></div></div>
            </div>
            <div class="skill-item">
                <div class="skill-header">
                    <span>🎨 Creativity</span>
                    <span class="skill-level">Lv. ${skills.creativity} - ${getSkillRank(skills.creativity)}</span>
                </div>
                <div class="skill-bar"><div class="skill-fill" style="width: ${Math.min(skills.creativity * 10, 100)}%"></div></div>
            </div>
        `;
    }

    function updateReminders() {
        const reminderList = document.getElementById('reminder-list');
        if (!reminderList) return;

        const events = JSON.parse(localStorage.getItem('calendar_events')) || [];
        const today = new Date();
        today.setHours(0,0,0,0);

        // Filter upcoming events (next 14 days)
        const upcoming = events.filter(e => {
            const eventDate = new Date(e.date + 'T00:00:00'); // Fix timezone issue
            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays >= 0 && diffDays <= 14;
        }).sort((a, b) => {
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return new Date(`${a.date}T${timeA}`) - new Date(`${b.date}T${timeB}`);
        });

        if (upcoming.length === 0) {
            reminderList.innerHTML = '<div class="empty-state">No upcoming events.</div>';
            return;
        }

        let html = '';
        upcoming.slice(0, 4).forEach(e => {
            const timeDisplay = e.time ? ` @ ${e.time}` : '';
            html += `
                <div class="reminder-item">
                    <span class="reminder-title">${e.title}</span>
                    <span class="reminder-date">${e.date}${timeDisplay}</span>
                </div>
            `;
        });
        reminderList.innerHTML = html;
    }

    function checkAchievements() {
        const achievementGrid = document.querySelector('.achievement-grid');
        if (!achievementGrid) return;

        const achievements = [
            { id: 'level_2', title: 'Awakening', desc: 'Reach Level 2', condition: () => playerStats.level >= 2, icon: '🌱' },
            { id: 'level_5', title: 'Momentum', desc: 'Reach Level 5', condition: () => playerStats.level >= 5, icon: '🔥' },
            { id: 'level_10', title: 'High Flyer', desc: 'Reach Level 10', condition: () => playerStats.level >= 10, icon: '⭐' },
            { id: 'level_25', title: 'Mastery', desc: 'Reach Level 25', condition: () => playerStats.level >= 25, icon: '👑' },
            { id: 'level_50', title: 'Legend', desc: 'Reach Level 50', condition: () => playerStats.level >= 50, icon: '🌌' }
        ];

        let html = '';
        achievements.forEach(ach => {
            const isUnlocked = ach.condition();
            html += `
                <div class="achievement ${isUnlocked ? 'unlocked' : ''}" title="${ach.desc}">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-title">${ach.title}</div>
                </div>
            `;
        });
        achievementGrid.innerHTML = html;
    }

    const aiBtn = document.querySelector('.dashboard-card.ai-sidekick .action-btn');
    const aiMessage = document.querySelector('.ai-message p');
    const aiQuotes = ["Small progress is still progress.", "Discipline equals freedom.", "What would Level 100 you do?"];

    if (aiBtn && aiMessage) {
        aiBtn.addEventListener('click', () => {
            const quote = aiQuotes[Math.floor(Math.random() * aiQuotes.length)];
            aiMessage.textContent = `"${quote}"`;
        });
    }

    updateStatsUI();
    updateVisionStats();
    updateSkillTree();
    updateReminders();
    checkAchievements();

    // --- Quest Counter & Interactive List Logic ---
    function updateQuestCounter() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        // Use 'active_quests' to match quests.js
        const activeQuests = JSON.parse(localStorage.getItem('active_quests')) || [];
            
        const activeCount = activeQuests.length;
        
        // Bar represents "Workload Capacity" (e.g., max 10 active quests before "full")
        const maxCapacity = 10;
        const loadPercent = Math.min((activeCount / maxCapacity) * 100, 100);

        // Turn Red if too many active quests (Threshold: 5)
        const isOverloaded = activeCount >= 5;
        const barColor = isOverloaded ? '#ff3333' : 'var(--secondary)';
        const glow = isOverloaded ? '0 0 15px #ff3333' : '0 0 8px var(--secondary)';

        let html = `
            <div class="quest-item">
                <div class="quest-title">Pending Missions ${isOverloaded ? '⚠️' : ''}</div>
                <div class="quest-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${loadPercent}%; background: ${barColor}; box-shadow: ${glow};"></div>
                    </div>
                    <span>${activeCount} Active</span>
                </div>
            </div>
            <div class="mini-quest-list">
        `;

        // Show top 3 active quests
        activeQuests.slice(0, 3).forEach(q => {
            html += `
                <div class="quest-preview-item">
                    <span class="quest-name">${q.text}</span>
                    <button class="complete-btn-mini" data-id="${q.id}" title="Complete Quest">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
        });

        if (activeCount === 0) {
            html += `<div class="empty-state">All systems nominal.</div>`;
        }

        html += `</div>`;
        questList.innerHTML = html;

        // Attach event listeners to new buttons
        document.querySelectorAll('.complete-btn-mini').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                completeQuest(id);
            });
        });
    }
    
    function completeQuest(questId) {
        let quests = JSON.parse(localStorage.getItem('active_quests')) || [];
        const questIndex = quests.findIndex(q => q.id === questId);
        
        if (questIndex !== -1) {
            const quest = quests[questIndex];
            
            // Remove from list
            quests.splice(questIndex, 1);
            localStorage.setItem('active_quests', JSON.stringify(quests));
            
            // Add XP based on difficulty
            const xpReward = parseInt(quest.xp) || 10;
            addXP(xpReward);

            // Increase Productivity
            let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
            skills.productivity = parseFloat((skills.productivity + 0.5).toFixed(1));
            localStorage.setItem('skill_levels', JSON.stringify(skills));
            showNotification(`Productivity Increased! (Lv. ${skills.productivity})`);
            updateSkillTree();

            // Update completed count
            playerStats.questsCompleted = (playerStats.questsCompleted || 0) + 1;
            updateStatsUI(); // Saves stats and checks achievements

            // Refresh UI
            updateQuestCounter();
        }
    }

    updateQuestCounter();
    window.addEventListener('pageshow', () => {
        updateQuestCounter();
        updateVisionStats();
        updateSkillTree();
        checkAchievements();
        updateReminders();
    });
    window.addEventListener('focus', () => {
        updateQuestCounter();
        updateVisionStats();
        updateSkillTree();
        checkAchievements();
        updateReminders();
    });
    window.addEventListener('storage', (e) => {
        if (e.key === 'active_quests') updateQuestCounter();
        if (e.key === 'vision_board_items') { updateVisionStats(); checkAchievements(); }
        if (e.key === 'skill_levels') { updateSkillTree(); checkAchievements(); }
        if (e.key === 'calendar_events') updateReminders();
    });

    // --- Daily Challenges Logic ---
    const challengePool = [
        { text: "Drink 8 glasses of water", xp: 10 },
        { text: "Exercise for 30 mins", xp: 20 },
        { text: "Read 10 pages", xp: 15 },
        { text: "Meditate for 10 mins", xp: 15 },
        { text: "No sugar today", xp: 25 },
        { text: "Walk 5000 steps", xp: 20 },
        { text: "Write a journal entry", xp: 15 },
        { text: "Learn something new", xp: 30 },
        { text: "Clean your workspace", xp: 10 },
        { text: "Sleep before 11 PM", xp: 20 }
    ];

    function loadDailyChallenges() {
        const stored = JSON.parse(localStorage.getItem('daily_challenges'));
        const today = new Date().toDateString();

        if (!stored || stored.date !== today) {
            generateDailyChallenges();
        } else {
            renderChallenges(stored.challenges);
        }
    }

    function generateDailyChallenges() {
        // Pick 3 random unique challenges
        const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(c => ({ ...c, completed: false }));
        
        const data = {
            date: new Date().toDateString(),
            challenges: selected
        };
        localStorage.setItem('daily_challenges', JSON.stringify(data));
        renderChallenges(selected);
    }

    function renderChallenges(challenges) {
        const list = document.getElementById('challenge-list');
        if (!list) return;
        list.innerHTML = '';
        
        challenges.forEach((challenge, index) => {
            const item = document.createElement('div');
            item.className = `challenge-item ${challenge.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <span>${challenge.text}</span>
                <span class="reward">+${challenge.xp} XP</span>
            `;
            
            item.addEventListener('click', function() {
                if (this.classList.contains('completed')) return;
                
                // Update state in storage
                const stored = JSON.parse(localStorage.getItem('daily_challenges'));
                if (stored && stored.challenges[index]) {
                    stored.challenges[index].completed = true;
                    localStorage.setItem('daily_challenges', JSON.stringify(stored));
                }

                this.classList.add('completed');
                addXP(challenge.xp);
                
                // Increase Health
                let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
                skills.health = parseFloat((skills.health + 0.5).toFixed(1));
                localStorage.setItem('skill_levels', JSON.stringify(skills));
                updateSkillTree();

                showNotification(`Health Up! (Lv. ${skills.health}) | +${challenge.xp} XP`);
            });
            
            list.appendChild(item);
        });
    }

    const refreshChallengesBtn = document.getElementById('refresh-challenges-btn');
    if (refreshChallengesBtn) {
        refreshChallengesBtn.addEventListener('click', generateDailyChallenges);
        loadDailyChallenges(); 
    }

    // --- Theme / Mood Switcher ---
    const moodBtns = document.querySelectorAll('.mood-btn');
    
    function setTheme(themeName) {
        // Remove existing theme classes
        document.documentElement.classList.remove('theme-dreamy', 'theme-cozy', 'theme-epic');
        if (themeName !== 'epic') {
            document.documentElement.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem('site_theme', themeName);
        
        // Update button states
        moodBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === themeName);
        });

        // Update Icons and Animation
        if (window.updateThemeIcons) window.updateThemeIcons();
        window.dispatchEvent(new Event('themeChanged'));
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('site_theme') || 'epic';
    setTheme(savedTheme);

    moodBtns.forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.mood)));

    // --- MODAL LOGIC ---
    
    // 1. Skill Tree Modal
    const skillModal = document.getElementById('skill-modal');
    const skillBtn = document.getElementById('skill-tree-btn');
    const skillForm = document.getElementById('skill-modal-form');

    if (skillBtn) {
        skillBtn.addEventListener('click', () => {
            // Prefill modal with current levels
            let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
            
            const updateInput = (name, val) => {
                const input = skillForm.elements[name];
                if(input) {
                    input.value = val;
                    // Update display numbers and ranks
                    if(input.nextElementSibling) input.nextElementSibling.textContent = val;
                    if(input.nextElementSibling.nextElementSibling) input.nextElementSibling.nextElementSibling.textContent = getSkillRank(val);
                }
            };

            updateInput('prod_consistency', skills.productivity);
            updateInput('health_rating', skills.health);
            updateInput('creat_rating', skills.creativity);

            skillModal.classList.add('open');
        });
    }

    if (skillForm) {
        skillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(skillForm);
            const prod = parseInt(formData.get('prod_consistency'));
            const health = parseInt(formData.get('health_rating'));
            const creat = parseInt(formData.get('creat_rating'));

            // Set levels directly based on slider input
            let skills = { productivity: prod, health: health, creativity: creat };

            localStorage.setItem('skill_levels', JSON.stringify(skills));
            localStorage.setItem('last_skill_assessment', new Date().toISOString());
            
            // Optional: Award XP for updating
            showNotification("Skill Levels Updated!");
            
            updateSkillTree();
            checkAchievements();
            skillModal.classList.remove('open');
        });
    }

    // 2. Quest Board Modal
    const questModal = document.getElementById('quest-modal');
    const openQuestBtn = document.getElementById('open-quests-btn');
    const modalQuestList = document.getElementById('modal-quest-list');
    const modalAddQuestBtn = document.getElementById('modal-add-quest-btn');
    const modalQuestInput = document.getElementById('modal-quest-input');
    const modalQuestDiff = document.getElementById('modal-quest-difficulty');

    if (openQuestBtn) {
        openQuestBtn.addEventListener('click', () => {
            renderModalQuests();
            questModal.classList.add('open');
        });
    }

    function renderModalQuests() {
        const quests = JSON.parse(localStorage.getItem('active_quests')) || [];
        modalQuestList.innerHTML = '';
        
        if (quests.length === 0) {
            modalQuestList.innerHTML = '<div class="empty-state">No active quests. Add one!</div>';
            return;
        }

        quests.forEach(q => {
            const item = document.createElement('div');
            item.className = 'quest-preview-item';
            item.innerHTML = `
                <div style="display:flex; flex-direction:column;">
                    <span style="color:var(--text); font-weight:bold;">${q.text}</span>
                    <span style="font-size:0.75rem; color:var(--text-dim);">+${q.xp} XP</span>
                </div>
                <button class="complete-btn-mini" title="Complete">
                    <i class="fas fa-check"></i>
                </button>
            `;
            
            item.querySelector('button').addEventListener('click', () => {
                completeQuest(q.id); // Re-use existing function
                renderModalQuests(); // Re-render list
            });
            
            modalQuestList.appendChild(item);
        });
    }

    if (modalAddQuestBtn) {
        modalAddQuestBtn.addEventListener('click', () => {
            const text = modalQuestInput.value.trim();
            if (!text) return;
            
            const xp = modalQuestDiff.value;
            const quests = JSON.parse(localStorage.getItem('active_quests')) || [];
            quests.push({ id: Date.now(), text, xp });
            localStorage.setItem('active_quests', JSON.stringify(quests));
            
            modalQuestInput.value = '';
            renderModalQuests();
            updateQuestCounter(); // Update dashboard widget
        });
    }

    // Close Modals Logic
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('open');
        });
    });
});