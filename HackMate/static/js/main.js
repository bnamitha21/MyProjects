document.addEventListener('DOMContentLoaded', () => {
    // 1. Alert fading mechanism — alerts auto-dismiss after 6 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Auto fadeout after 6 seconds so users can read messages
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';
                setTimeout(() => alert.remove(), 500);
            }
        }, 6000);
    });

    // 2. Tag Input Initializer
    initializeTagInput('skills-input-wrapper', 'skills-hidden', 'skills-text-input');
    initializeTagInput('interests-input-wrapper', 'interests-hidden', 'interests-text-input');

    // 3. Confirmation dialogs for destructive actions
    //    We hook onto the FORM submit event for buttons inside forms,
    //    and onto the click event for plain <a> links with data-confirm.
    document.querySelectorAll('form').forEach(form => {
        const confirmBtn = form.querySelector('[data-confirm]');
        if (confirmBtn) {
            form.addEventListener('submit', (e) => {
                const message = confirmBtn.getAttribute('data-confirm') || 'Are you sure?';
                if (!confirm(message)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            });
        }
    });

    // For anchor links with data-confirm (not inside forms)
    document.querySelectorAll('a[data-confirm]').forEach(link => {
        link.addEventListener('click', (e) => {
            const message = link.getAttribute('data-confirm') || 'Are you sure?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // 4. Time-based greeting on dashboard welcome heading
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) {
        const hour = new Date().getHours();
        let greet = 'Good Morning';
        if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
        else if (hour >= 17) greet = 'Good Evening';
        greetingEl.textContent = greet;
    }
});

/**
 * Custom tag inputs setup (student-level helper)
 * Expects:
 * - containerId: wrapper div that acts as the styling container
 * - hiddenInputId: hidden input that will contain comma-separated values for the POST body
 * - textInputId: actual textbox the user types into
 */
function initializeTagInput(containerId, hiddenInputId, textInputId) {
    const container = document.getElementById(containerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const textInput = document.getElementById(textInputId);
    
    if (!container || !hiddenInput || !textInput) return;
    
    // Read initial tags from the hidden input (already populated by backend on edit)
    let tagsList = hiddenInput.value ? hiddenInput.value.split(',').map(t => t.trim()).filter(t => t !== '') : [];
    
    // Redraw tags list visually
    function renderTags() {
        // Clear all except the text input box
        const existingTags = container.querySelectorAll('.tag');
        existingTags.forEach(t => t.remove());
        
        // Add each tag before the input text element
        tagsList.forEach((tagText, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.innerHTML = `${escapeHTML(tagText)} <span class="remove-tag" data-index="${index}">&times;</span>`;
            
            // Append right before the textbox input
            container.insertBefore(tagEl, textInput);
        });
        
        // Update hidden input string value
        hiddenInput.value = tagsList.join(',');
        
        // Re-attach delete listeners
        container.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                tagsList.splice(index, 1);
                renderTags();
            });
        });
    }
    
    // Add tag handler
    function addTag(value) {
        const cleanValue = value.replace(/,/g, '').trim();
        if (cleanValue && !tagsList.includes(cleanValue)) {
            tagsList.push(cleanValue);
            renderTags();
        }
        textInput.value = '';
    }

    // Keypress handler (Enter and comma)
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop form submission
            addTag(textInput.value);
        } else if (e.key === ',') {
            setTimeout(() => addTag(textInput.value), 10);
        }
    });

    // Lost focus handler
    textInput.addEventListener('blur', () => {
        addTag(textInput.value);
    });

    // Make clicking the wrapper focus the text input box
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            textInput.focus();
        }
    });

    // Initial render
    renderTags();
}

// Basic HTML escaping helper to prevent XSS in client-rendered tags
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
