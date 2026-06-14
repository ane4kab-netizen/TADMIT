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

// Clinical Calculators - eGFR CKD-EPI 2021
function calculateEGFR(event) {
    event.preventDefault();
    
    const age = parseFloat(document.getElementById('egfr-age').value);
    const sex = document.getElementById('egfr-sex').value;
    const scr = parseFloat(document.getElementById('egfr-creat').value);
    
    if (!sex) {
        const lang = document.documentElement.getAttribute('lang') || 'he';
        if (lang === 'he') alert("נא לבחור מין לפני ביצוע החישוב.");
        else if (lang === 'en') alert("Please select sex before calculating.");
        else alert("Пожалуйста, выберите пол перед расчетом.");
        return;
    }
    
    if (!age || !scr) return;
    
    let k, a, sexMultiplier;
    
    if (sex === 'female') {
        k = 0.7;
        a = -0.241;
        sexMultiplier = 1.012;
    } else {
        k = 0.9;
        a = -0.302;
        sexMultiplier = 1;
    }
    
    const minScrK = Math.min(scr / k, 1);
    const maxScrK = Math.max(scr / k, 1);
    
    let egfr = 142 * Math.pow(minScrK, a) * Math.pow(maxScrK, -1.200) * Math.pow(0.9938, age) * sexMultiplier;
    egfr = Math.round(egfr);
    
    const resultDiv = document.getElementById('egfr-result');
    resultDiv.style.display = 'block';
    
    let bgColor, textColor, stage;
    if (egfr >= 60) {
        bgColor = '#d1e7dd';
        textColor = '#0f5132';
        stage = egfr >= 90 ? 'G1' : 'G2';
    } else if (egfr >= 30) {
        bgColor = '#fff3cd';
        textColor = '#664d03';
        stage = egfr >= 45 ? 'G3a' : 'G3b';
    } else {
        bgColor = '#f8d7da';
        textColor = '#842029';
        stage = egfr >= 15 ? 'G4' : 'G5';
    }
    
    resultDiv.style.backgroundColor = bgColor;
    resultDiv.style.color = textColor;
    
    let heDesc = egfr >= 60 ? 'תקין או ירידה קלה' : (egfr >= 30 ? 'ירידה בינונית' : 'ירידה קשה / אי ספיקת כליות');
    let enDesc = egfr >= 60 ? 'Normal or mildly decreased' : (egfr >= 30 ? 'Moderately decreased' : 'Severely decreased / Kidney failure');
    let ruDesc = egfr >= 60 ? 'В норме или немного снижена' : (egfr >= 30 ? 'Умеренно снижена' : 'Сильно снижена / Почечная недостаточность');

    resultDiv.innerHTML =
        'eGFR: ' + egfr + ' mL/min/1.73m² (CKD Stage: ' + stage + ')<br>' +
        '<span style="font-size: 1rem; font-weight: 400; margin-top: 0.5rem; display: block;">' +
            '<span class="he">רמת תפקוד כלייתי: ' + heDesc + '</span>' +
            '<span class="en">Renal Function: ' + enDesc + '</span>' +
            '<span class="ru">Функция почек: ' + ruDesc + '</span>' +
        '</span>';
}

window.forceClearEGFR = function() {
    document.getElementById('egfr-age').value = '';
    document.getElementById('egfr-sex').selectedIndex = 0;
    document.getElementById('egfr-creat').value = '';
    
    let resultDiv = document.getElementById('egfr-result');
    if (resultDiv) {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
    }
};

// Beers Criteria Database (Proof of Concept - Table 2)
const beersDatabase = [
    { drug: "diphenhydramine", recommendation: "Avoid", rationale: "Highly anticholinergic; clearance reduced with advanced age. Cumulative exposure increases risk of falls, delirium, and dementia." },
    { drug: "chlorpheniramine", recommendation: "Avoid", rationale: "Highly anticholinergic; risk of confusion, dry mouth, constipation, and toxicity." },
    { drug: "promethazine", recommendation: "Avoid", rationale: "Highly anticholinergic; risk of severe anticholinergic effects and toxicity in older adults." },
    { drug: "nitrofurantoin", recommendation: "Avoid if CrCl <30 mL/min or for long-term", rationale: "Potential for pulmonary toxicity, hepatoxicity, and peripheral neuropathy." },
    { drug: "amiodarone", recommendation: "Avoid as first-line for AFib", rationale: "Greater toxicities than other antiarrhythmics; avoid unless patient has heart failure or substantial left ventricular hypertrophy." },
    { drug: "digoxin", recommendation: "Avoid as first-line", rationale: "Safer and more effective alternatives exist. Higher doses increase toxicity risk without additional benefits." },
    { drug: "nifedipine", recommendation: "Avoid (immediate release)", rationale: "Potential for hypotension; risk of precipitating myocardial ischemia." },
    { drug: "clonidine", recommendation: "Avoid as first-line", rationale: "High risk of adverse CNS effects, bradycardia, and orthostatic hypotension." },
    { drug: "doxazosin", recommendation: "Avoid as antihypertensive", rationale: "High risk of orthostatic hypotension and associated harms in older adults." },
    { drug: "amitriptyline", recommendation: "Avoid", rationale: "Highly anticholinergic, sedating, and causes orthostatic hypotension." },
    { drug: "paroxetine", recommendation: "Avoid", rationale: "Highly anticholinergic compared to other SSRIs; sedating." },
    { drug: "haloperidol", recommendation: "Avoid (except specific FDA indications)", rationale: "Increased risk of stroke, cognitive decline, and mortality in persons with dementia." },
    { drug: "risperidone", recommendation: "Avoid (except specific FDA indications)", rationale: "Increased risk of stroke, cognitive decline, and mortality in persons with dementia." },
    { drug: "quetiapine", recommendation: "Avoid (except specific FDA indications)", rationale: "Increased risk of stroke, cognitive decline, and mortality in persons with dementia." },
    { drug: "olanzapine", recommendation: "Avoid (except specific FDA indications)", rationale: "Increased risk of stroke, cognitive decline, and mortality in persons with dementia." },
    { drug: "diazepam", recommendation: "Avoid", rationale: "Long-acting benzodiazepine; decreased metabolism in older adults. Increases risk of cognitive impairment, delirium, falls." },
    { drug: "alprazolam", recommendation: "Avoid", rationale: "Benzodiazepine; increases risk of cognitive impairment, delirium, falls, fractures, and motor vehicle crashes." },
    { drug: "lorazepam", recommendation: "Avoid", rationale: "Benzodiazepine; increases risk of cognitive impairment, delirium, falls, fractures, and motor vehicle crashes." },
    { drug: "clonazepam", recommendation: "Avoid", rationale: "Benzodiazepine; increases risk of cognitive impairment, delirium, falls, fractures, and motor vehicle crashes." },
    { drug: "zolpidem", recommendation: "Avoid", rationale: "Adverse events similar to benzodiazepines (delirium, falls, fractures); minimal improvement in sleep latency." },
    { drug: "eszopiclone", recommendation: "Avoid", rationale: "Adverse events similar to benzodiazepines; minimal improvement in sleep latency and duration." },
    { drug: "glimepiride", recommendation: "Avoid", rationale: "Long-acting sulfonylurea; higher risk of cardiovascular events, mortality, and prolonged hypoglycemia." },
    { drug: "glyburide", recommendation: "Avoid", rationale: "Long-acting sulfonylurea; higher risk of cardiovascular events, mortality, and prolonged hypoglycemia." },
    { drug: "glipizide", recommendation: "Avoid as first/second line", rationale: "Short-acting sulfonylurea. Class has higher CV and hypoglycemia risks than safer alternative agents." },
    { drug: "ibuprofen", recommendation: "Avoid chronic use", rationale: "Increased risk of GI bleeding, peptic ulcer disease, and acute kidney injury. Can induce blood pressure elevations." },
    { drug: "naproxen", recommendation: "Avoid chronic use", rationale: "Increased risk of GI bleeding, peptic ulcer disease, and acute kidney injury." },
    { drug: "diclofenac", recommendation: "Avoid chronic use", rationale: "Increased risk of GI bleeding, peptic ulcer disease, and acute kidney injury." },
    { drug: "indomethacin", recommendation: "Avoid", rationale: "Highest risk among NSAIDs for GI bleeding, AKI, and adverse CNS effects." },
    { drug: "ketorolac", recommendation: "Avoid", rationale: "Increased risk of GI bleeding, peptic ulcer disease, and acute kidney injury." },
    { drug: "cyclobenzaprine", recommendation: "Avoid", rationale: "Muscle relaxant; poorly tolerated by older adults due to anticholinergic effects, sedation, and fracture risk." },
    { drug: "omeprazole", recommendation: "Avoid scheduled use >8 weeks", rationale: "Risk of C. difficile infection, pneumonia, bone loss, and fractures unless high-risk indication is present." },
    { drug: "pantoprazole", recommendation: "Avoid scheduled use >8 weeks", rationale: "Risk of C. difficile infection, pneumonia, bone loss, and fractures unless high-risk indication is present." },
    { drug: "metoclopramide", recommendation: "Avoid (unless gastroparesis <12 weeks)", rationale: "Can cause extrapyramidal effects, including tardive dyskinesia; risk is greater in frail older adults." }
];

window.searchBeers = function() {
    const inputField = document.getElementById('beers-search-input');
    const query = inputField.value.trim().toLowerCase();
    const resultDiv = document.getElementById('beers-result');
    
    if (!query) return;
    
    const foundDrug = beersDatabase.find(item => item.drug.toLowerCase() === query);
    
    resultDiv.style.display = 'block';
    
    if (foundDrug) {
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.color = '#721c24';
        resultDiv.style.borderRightColor = '#dc3545';
        
        resultDiv.innerHTML = 
            <div style="font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem; text-transform: capitalize;"> + foundDrug.drug + </div>
            <div style="margin-bottom: 0.5rem;"><strong>Recommendation:</strong>  + foundDrug.recommendation + </div>
            <div><strong>Rationale:</strong>  + foundDrug.rationale + </div>
        ;
    } else {
        resultDiv.style.backgroundColor = '#d4edda';
        resultDiv.style.color = '#155724';
        resultDiv.style.borderRightColor = '#28a745';
        
        resultDiv.innerHTML = 
            <div style="font-weight: bold; margin-bottom: 0.5rem;">
                <span class="he">התרופה לא נמצאה במאגר ה-Beers המקומי כסיכון כללי (Table 2). יש להפעיל שיקול דעת קליני.</span>
                <span class="en" style="display:none;">Drug not found in the local Beers database as a general risk (Table 2). Use clinical judgment.</span>
                <span class="ru" style="display:none;">Лекарство не найдено в местной базе данных Beers как общий риск (Таблица 2). Используйте клиническое суждение.</span>
            </div>
        ;
        
        // Trigger translation update for dynamic content
        if (typeof window.setLanguage === 'function') {
            const currentLang = document.documentElement.getAttribute('lang') || 'he';
            window.setLanguage(currentLang);
        }
    }
};

window.clearBeers = function() {
    document.getElementById('beers-search-input').value = '';
    const resultDiv = document.getElementById('beers-result');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
};

window.switchTab = function(paneId, clickedBtn) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(paneId).classList.add('active');
    if(clickedBtn) clickedBtn.classList.add('active');
};
