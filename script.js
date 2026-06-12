document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });

    // --- Accordions for Clinical Hub ---
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            
            // Optional: Close all other accordions in the same category
            // const parent = trigger.closest('.accordion');
            // parent.querySelectorAll('.accordion-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
            
            // Toggle current
            trigger.setAttribute('aria-expanded', !isExpanded);
        });
    });

    // --- Copy to Clipboard Functionality ---
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const contentElement = document.getElementById(targetId);
            
            if (!contentElement) return;

            // Extract plain text, preserving some line breaks for readability
            let textToCopy = contentElement.innerText || contentElement.textContent;
            
            try {
                await navigator.clipboard.writeText(textToCopy.trim());
                
                // Show success state
                const originalText = button.innerHTML;
                button.innerHTML = '<i data-lucide="check"></i> Copied!';
                button.classList.add('copied');
                lucide.createIcons();
                
                // Revert after 2 seconds
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                    lucide.createIcons();
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard.');
            }
        });
    });

    // --- Language / RTL Toggle Placeholder ---
    const langToggle = document.querySelector('.lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const htmlTag = document.documentElement;
            const currentLang = htmlTag.getAttribute('lang');
            
            if (currentLang === 'en') {
                // Switch to Hebrew (RTL) simulation
                htmlTag.setAttribute('lang', 'he');
                htmlTag.setAttribute('dir', 'rtl');
                langToggle.textContent = 'HE';
                langToggle.setAttribute('title', 'Language: Hebrew');
            } else {
                // Switch to English (LTR)
                htmlTag.setAttribute('lang', 'en');
                htmlTag.setAttribute('dir', 'ltr');
                langToggle.textContent = 'EN';
                langToggle.setAttribute('title', 'Language: English');
            }
        });
    }

});
