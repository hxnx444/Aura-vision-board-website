const themeAssets = {
        epic: {
            dashboard: { emoji: '🔮', icon: 'fa-microchip' },
            vision: { emoji: '🌌', icon: 'fa-palette' },
            roadmap: { emoji: '🚀', icon: 'fa-route' },
            monthly: { emoji: '🌙', icon: 'fa-calendar-alt' },
            yearly: { emoji: '🪐', icon: 'fa-calendar-check' },
            avatar: '🧙‍♀️'
        },
        dreamy: {
            dashboard: { emoji: '🌸', icon: 'fa-star' },
            vision: { emoji: '✨', icon: 'fa-magic' },
            roadmap: { emoji: '🏰', icon: 'fa-chess-rook' },
            monthly: { emoji: '🧚', icon: 'fa-moon' },
            yearly: { emoji: '🌈', icon: 'fa-map' },
            avatar: '🦄'
        },
        cozy: {
            dashboard: { emoji: '☕', icon: 'fa-mug-hot' },
            vision: { emoji: '🧶', icon: 'fa-pen-nib' },
            roadmap: { emoji: '🍂', icon: 'fa-leaf' },
            monthly: { emoji: '🕯️', icon: 'fa-calendar' },
            yearly: { emoji: '🏡', icon: 'fa-home' },
            avatar: '🧸'
        }
    };

window.updateThemeIcons = function() {
        const theme = localStorage.getItem('site_theme') || 'epic';
        const assets = themeAssets[theme];

        // 1. Update Navigation Links (Sidebar & Home Grid)
        const map = {
            'dashboard.html': 'dashboard',
            'vision.html': 'vision',
            'yearly-roadmap.html': 'roadmap',
            'monthly-calendar.html': 'monthly',
            'yearly-calendar.html': 'yearly'
        };

        for (const [file, key] of Object.entries(map)) {
            // Update Home Grid Emojis (index.html)
            const cardIcon = document.querySelector(`a[href="${file}"] .icon`);
            if (cardIcon) cardIcon.textContent = assets[key].emoji;

            // Update Sidebar Icons (FontAwesome)
            const navIcon = document.querySelector(`a[href="${file}"] i`);
            if (navIcon) {
                // Remove old icon classes
                navIcon.className = 'fas'; 
                navIcon.classList.add(assets[key].icon);
            }
        }

        // 2. Update Avatar
        const avatarEl = document.getElementById('player-avatar');
        if (avatarEl) avatarEl.textContent = assets.avatar;
    };

document.addEventListener('DOMContentLoaded', () => {
    window.updateThemeIcons();

    let currentTheme = localStorage.getItem('site_theme') || 'epic';

    // --- Background Animation Logic ---
    let canvas = document.getElementById('star-rain');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'star-rain';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let particles = [];
    
    function initParticles() {
        currentTheme = localStorage.getItem('site_theme') || 'epic';
        particles = [];
        const particleCount = currentTheme === 'epic' ? 100 : (currentTheme === 'dreamy' ? 50 : 80);
        
        for(let i=0; i<particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * (currentTheme === 'epic' ? 8 : 2) + 1,
                opacity: Math.random() * 0.5 + 0.1,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.05,
                length: Math.random() * 20 + 10, // For blood
                sway: Math.random() * 2 // For petals
            });
        }
    }

    // Re-init particles when theme changes
    window.addEventListener('themeChanged', initParticles);
    initParticles();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            ctx.beginPath();
            
            if (currentTheme === 'dreamy') {
                // Petals Falling
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = `rgba(255, 204, 224, ${p.opacity})`; // Soft Pastel Pink
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                p.y += p.speed * 0.5;
                p.x += Math.sin(p.y * 0.02) * p.sway;
                p.angle += p.spin;

            } else if (currentTheme === 'cozy') {
                // Cozy: Floating Pixel Hearts (Upwards)
                ctx.fillStyle = `rgba(255, 219, 153, ${p.opacity})`; // Soft Peach
                const s = p.size;
                // Draw Heart
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.bezierCurveTo(p.x - s/2, p.y - s/2, p.x - s, p.y + s/3, p.x, p.y + s);
                ctx.bezierCurveTo(p.x + s, p.y + s/3, p.x + s/2, p.y - s/2, p.x, p.y);
                ctx.fill();
                
                p.y -= p.speed * 0.5;
                p.x += Math.sin(p.y * 0.02) * 0.5;

            } else {
                // Epic: Neon Shards (Fast Downwards)
                ctx.strokeStyle = `rgba(${Math.random()>0.5? '255,15,91' : '0,234,255'}, ${p.opacity})`; // Vibrant Crimson/Cyan
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.size, p.y + p.size * 2);
                ctx.lineTo(p.x - p.size, p.y + p.size * 2);
                ctx.closePath();
                ctx.stroke();
                
                p.y += p.speed * 3;
            }

            // Reset positions
            if (currentTheme === 'cozy') {
                // Cozy moves UP, reset if off top
                if (p.y < -50) { p.y = canvas.height + 50; p.x = Math.random() * canvas.width; }
            } else if (currentTheme === 'dreamy') {
                // Dreamy moves DOWN, reset if off bottom
                if (p.y > canvas.height + 50) { p.y = -50; p.x = Math.random() * canvas.width; }
            } else {
                // Epic moves DOWN
                if (p.y > canvas.height + 50) { p.y = -50; p.x = Math.random() * canvas.width; }
            }
            if (p.x < -50) p.x = canvas.width + 50;
        });
        requestAnimationFrame(animate);
    }
    animate();
});