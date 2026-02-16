document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('visionCanvas');
    const tools = document.querySelectorAll('.tool-btn');
    
    // State
    let selectedElement = null;
    let isDragging = false;
    let isResizing = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let initialWidth = 0;
    let initialHeight = 0;
    let deleteMode = false;
    let history = [];
    let historyStep = -1;

    // Notification Helper (if not globally available)
    const notify = window.showNotification || ((msg) => alert(msg));

    // --- Modal Logic ---
    const modal = document.getElementById('input-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalInput = document.getElementById('modal-input');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalUploadBtn = document.getElementById('modal-upload-btn');
    const modalCloseBtn = modal ? modal.querySelector('.close-modal') : null;
    
    let currentModalCallback = null;

    function openModal(title, placeholder, callback, showUpload = false) {
        modalTitle.textContent = title;
        modalInput.placeholder = placeholder;
        modalInput.value = '';
        currentModalCallback = callback;
        modal.classList.add('open');
        
        if (modalUploadBtn) modalUploadBtn.style.display = showUpload ? 'block' : 'none';
        
        modalInput.focus();
    }

    function closeModal() {
        if (modal) modal.classList.remove('open');
        currentModalCallback = null;
    }

    if (modal) {
        modalCloseBtn.addEventListener('click', closeModal);
        modalConfirmBtn.addEventListener('click', () => {
            if (currentModalCallback) currentModalCallback(modalInput.value);
            closeModal();
        });
        modalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') modalConfirmBtn.click();
        });
    }

    // --- Image Upload Logic ---
    const fileInput = document.getElementById('image-upload-input');
    
    if (modalUploadBtn && fileInput) {
        modalUploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgContent = `<img src="${event.target.result}" draggable="false">`;
                    // Center position
                    const x = (canvas.clientWidth / 2) - 100;
                    const y = (canvas.clientHeight / 2) - 100;
                    createElement('image', imgContent, x, y);
                    closeModal();
                };
                reader.readAsDataURL(file);
            }
            // Reset input
            fileInput.value = '';
        });
    }

    // --- Context Menu Logic ---
    const contextMenu = document.getElementById('context-menu');
    let contextElement = null;

    if (contextMenu) {
        // Hide menu on global click
        window.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        // Color selection
        contextMenu.querySelectorAll('.ctx-color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately
                if (contextElement) {
                    const color = swatch.dataset.color;
                    const type = contextElement.dataset.type;
                    
                    if (type === 'text') {
                        contextElement.style.color = color;
                    } else {
                        contextElement.style.background = color;
                        // For goals/notes, ensure text is readable if needed, or just set bg
                        if (type === 'goal') contextElement.style.borderColor = color;
                    }
                    
                    saveState();
                    contextMenu.style.display = 'none';
                    contextElement = null;
                }
            });
        });
    }

    // --- Initialization ---
    loadCanvas();

    // --- Tool Handlers ---
    tools.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            
            // Handle Delete Mode
            if (tool === 'delete') {
                deleteMode = !deleteMode;
                btn.classList.toggle('active', deleteMode);
                canvas.style.cursor = deleteMode ? 'not-allowed' : 'default';
                notify(deleteMode ? "Delete Mode ON: Click items to remove" : "Delete Mode OFF");
                return;
            }

            // Handle Creation Tools
            handleToolClick(tool);
        });
    });

    function handleToolClick(tool) {
        if (deleteMode) return;
        
        // Color tool doesn't need input
        if (tool === 'color') {
            const x = (canvas.clientWidth / 2) + (Math.random() * 100 - 50);
            const y = (canvas.clientHeight / 2) + (Math.random() * 100 - 50);
            const style = 'background: var(--primary); width: 100px; height: 100px; border-radius: 8px;';
            createElement('color', '', x, y, style);
            return;
        }

        let title = 'Add Element';
        let placeholder = 'Enter content...';

        switch(tool) {
            case 'text': title = "Add Text/Quote"; placeholder = "Enter text..."; break;
            case 'image': title = "Add Image"; placeholder = "Enter URL or Upload..."; break;
            case 'note': title = "Add Note"; placeholder = "Enter note content..."; break;
            case 'goal': title = "Add Goal"; placeholder = "Enter your goal..."; break;
            case 'inspiration': title = "Add Inspiration"; placeholder = "What inspires you?"; break;
        }

        openModal(title, placeholder, (value) => {
            if (!value) return;

            let content = value;
            let style = '';

            switch(tool) {
                case 'image':
                    content = `<img src="${value}" draggable="false">`;
                    break;
                case 'note':
                    style = 'background: #ffeb3b; color: #000; padding: 1rem; width: 150px; height: 150px; box-shadow: 2px 4px 8px rgba(0,0,0,0.2); font-family: cursive; transform: rotate(-2deg); display: flex; align-items: flex-start; justify-content: flex-start; overflow: hidden;';
                    break;
                case 'goal':
                    content = `🏆 ${value}`;
                    style = 'background: rgba(0,0,0,0.8); color: #fff; padding: 0.8rem; border: 1px solid var(--secondary); border-radius: 20px;';
                    break;
                case 'inspiration':
                    content = `💡 ${value}`;
                    style = 'border-bottom: 2px solid var(--primary); padding: 0.5rem; font-style: italic;';
                    break;
            }

            const x = (canvas.clientWidth / 2) + (Math.random() * 100 - 50);
            const y = (canvas.clientHeight / 2) + (Math.random() * 100 - 50);
            createElement(tool, content, x, y, style);
        }, tool === 'image'); // Show upload button only for image tool
    }
    function createElement(type, content, x, y, styleString = '') {
        // Remove drop zone if it exists
        const dropZone = canvas.querySelector('.canvas-drop-zone');
        if(dropZone) dropZone.remove();

        const el = document.createElement('div');
        el.className = `vision-element ${type}-element`;
        el.dataset.type = type;
        el.innerHTML = content;
        el.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; ${styleString}`;
        
        attachElementListeners(el);
        canvas.appendChild(el);
        saveState();
    }

    function attachElementListeners(el) {
        // Add Resize Handle
        if (!el.querySelector('.resize-handle')) {
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            el.appendChild(handle);
        }
        const handle = el.querySelector('.resize-handle');
        handle.addEventListener('mousedown', startResize);

        // Context Menu
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (deleteMode) return;
            
            contextElement = el;
            contextMenu.style.display = 'grid';
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
        });

        el.addEventListener('mousedown', startDrag);
        el.addEventListener('click', (e) => {
            if(deleteMode) {
                el.remove();
                saveState();
                notify("Item deleted");
            }
        });
    }

    // --- Drag Logic ---
    function startDrag(e) {
        if (deleteMode) return;
        selectedElement = e.target.closest('.vision-element');
        if (!selectedElement) return;

        isDragging = true;
        const rect = selectedElement.getBoundingClientRect();
        
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        selectedElement.style.cursor = 'grabbing';
        selectedElement.style.zIndex = 1000; // Bring to front
    }

    function startResize(e) {
        e.stopPropagation();
        if (deleteMode) return;
        
        selectedElement = e.target.closest('.vision-element');
        isResizing = true;
        
        const rect = selectedElement.getBoundingClientRect();
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        initialWidth = rect.width;
        initialHeight = rect.height;
    }

    window.addEventListener('mousemove', (e) => {
        if (isResizing && selectedElement) {
            e.preventDefault();
            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;
            
            // Minimum size check (50px)
            const newWidth = Math.max(50, initialWidth + dx);
            const newHeight = Math.max(50, initialHeight + dy);

            selectedElement.style.width = `${newWidth}px`;
            selectedElement.style.height = `${newHeight}px`;
            return;
        }

        if (!isDragging || !selectedElement) return;
        e.preventDefault();
        
        const canvasRect = canvas.getBoundingClientRect();
        let x = e.clientX - canvasRect.left - dragOffsetX;
        let y = e.clientY - canvasRect.top - dragOffsetY;

        selectedElement.style.left = `${x}px`;
        selectedElement.style.top = `${y}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isResizing && selectedElement) {
            saveState();
            isResizing = false;
            selectedElement = null;
            return;
        }

        if (isDragging && selectedElement) {
            selectedElement.style.cursor = 'grab';
            selectedElement.style.zIndex = 'auto';
            saveState();
        }
        isDragging = false;
        selectedElement = null;
    });

    // --- Save/Load/History ---
    function saveState() {
        const items = Array.from(canvas.querySelectorAll('.vision-element')).map(el => ({
            type: el.dataset.type,
            content: el.innerHTML,
            style: el.style.cssText,
            left: el.style.left,
            top: el.style.top
        }));
        
        const oldItems = JSON.parse(localStorage.getItem('vision_board_items')) || [];
        localStorage.setItem('vision_board_items', JSON.stringify(items));
        
        // History for Undo/Redo
        if (historyStep < history.length - 1) {
            history = history.slice(0, historyStep + 1);
        }
        history.push(JSON.stringify(items));
        historyStep++;

        // Skill Boost Logic (Creativity)
        if (items.length > oldItems.length) {
            let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
            skills.creativity = parseFloat((skills.creativity + 0.5).toFixed(1));
            localStorage.setItem('skill_levels', JSON.stringify(skills));
            notify(`Creativity Increased! (Lv. ${skills.creativity})`);
        }
    }

    function loadCanvas() {
        const items = JSON.parse(localStorage.getItem('vision_board_items')) || [];
        
        if (items.length > 0) {
            canvas.innerHTML = ''; // Clear drop zone
            items.forEach(item => {
                const el = document.createElement('div');
                el.className = `vision-element ${item.type}-element`;
                el.dataset.type = item.type;
                el.innerHTML = item.content;
                el.style.cssText = item.style;
                el.style.left = item.left;
                el.style.top = item.top;
                
                attachElementListeners(el);
                canvas.appendChild(el);
            });
        }
    }

    // --- Canvas Actions ---
    document.getElementById('clearCanvasBtn')?.addEventListener('click', () => {
        if(confirm('Clear entire vision board?')) {
            canvas.innerHTML = '<div class="canvas-drop-zone"><div class="drop-message"><i class="fas fa-cloud-upload-alt"></i><p>Drag & drop elements here to build your vision</p><small>Or use the tools on the left</small></div></div>';
            localStorage.removeItem('vision_board_items');
            history = [];
            historyStep = -1;
            notify("Canvas Cleared");
        }
    });

    document.getElementById('saveCanvasBtn')?.addEventListener('click', () => {
        saveState();
        
        // Increase Creativity
        let skills = JSON.parse(localStorage.getItem('skill_levels')) || { productivity: 1, health: 1, creativity: 1 };
        skills.creativity = parseFloat((skills.creativity + 0.5).toFixed(1));
        localStorage.setItem('skill_levels', JSON.stringify(skills));
        
        notify(`Vision Saved! Creativity Increased (Lv. ${skills.creativity})`);
    });

    document.getElementById('exportCanvasBtn')?.addEventListener('click', () => {
        const items = localStorage.getItem('vision_board_items');
        const blob = new Blob([items], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vision_board_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        notify("Canvas Exported");
    });
});