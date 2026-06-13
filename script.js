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

    // --- Language / RTL Toggle (3 States) ---
    const htmlTag = document.documentElement;
    const langBtns = document.querySelectorAll('.lang-btn');
    
    function setLanguage(lang) {
        // Update html tag
        htmlTag.setAttribute('lang', lang);
        if (lang === 'he') {
            htmlTag.setAttribute('dir', 'rtl');
            document.title = "אנה בולמבך זסלבסקי | פורטפוליו קליני";
        } else if (lang === 'en') {
            htmlTag.setAttribute('dir', 'ltr');
            document.title = "Anna Bolembakh Zaslavsky | Clinical Portfolio";
        } else if (lang === 'ru') {
            htmlTag.setAttribute('dir', 'ltr');
            document.title = "Анна Болембах Заславски | Клиническое Портфолио";
        }
        
        // Update active button state
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Save preference
        localStorage.setItem('preferredLang', lang);
    }

    // Initialize from local storage or default to 'he'
    const savedLang = localStorage.getItem('preferredLang') || 'he';
    setLanguage(savedLang);

    // Add click listeners to buttons
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetLang = btn.getAttribute('data-lang');
            setLanguage(targetLang);
        });
    });

});

// Image Modal Logic
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    if (modal && modalImg) {
        modalImg.src = imageSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeImageModal(event) {
    // Only close if clicking the background or the close button
    if (event.target.id === 'imageModal' || event.target.classList.contains('image-modal-close')) {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Clear src after transition ends to avoid flickering
            setTimeout(() => {
                const modalImg = document.getElementById('imageModalImg');
                if (modalImg) modalImg.src = '';
            }, 300);
        }
    }
}

// Add escape key support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('imageModal');
        if (modal && modal.classList.contains('active')) {
            closeImageModal({ target: modal });
        }
    }
});
