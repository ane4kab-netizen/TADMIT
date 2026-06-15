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
    // Initialize language from local storage or default to 'he'
    const savedLang = localStorage.getItem('preferredLang') || 'he';
    if(window.switchLanguage) {
        window.switchLanguage(savedLang);
    }
});

// --- Language / RTL Toggle Global Function ---
window.switchLanguage = function(lang) {
    const htmlTag = document.documentElement;
    const langBtns = document.querySelectorAll('.lang-btn');
    
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
    if (langBtns) {
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Save preference
    localStorage.setItem('preferredLang', lang);
};

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
    // מערכת הלב וכלי דם ונוגדי קרישה
    { generic: "aspirin", tradeNames: ["micropirin", "cartia", "aspirin taro", "anacin", "bayer"], recommendation: "Avoid initiating for primary prevention.", rationale: "Risk of major bleeding increases markedly in older age. Lack of net benefit when initiated for primary prevention." },
    { generic: "warfarin", tradeNames: ["coumadin", "jantoven"], recommendation: "Avoid starting as initial therapy for AFib/VTE.", rationale: "Higher risk of major bleeding (intracranial) than DOACs. Prefer DOACs unless contraindicated." },
    { generic: "rivaroxaban", tradeNames: ["xarelto"], recommendation: "Avoid long-term for AFib/VTE in favor of safer alternatives.", rationale: "Higher risk of major bleeding and GI bleeding in older adults than other DOACs, particularly apixaban." },
    { generic: "dabigatran", tradeNames: ["pradaxa"], recommendation: "Use with caution for long-term treatment.", rationale: "Increased risk of GI bleeding compared with warfarin and apixaban." },
    { generic: "apixaban", tradeNames: ["eliquis"], recommendation: "Preferred DOAC; monitor renal function.", rationale: "Evidence supports safer profile in older adults, but requires regular dosage controls based on CrCl." },
    { generic: "edoxaban", tradeNames: ["lixiana", "savaysa"], recommendation: "Use with caution; adjust for renal function.", rationale: "Requires strict adherence to dosage adjustment guidelines based on creatinine clearance." },
    { generic: "enoxaparin", tradeNames: ["clexane", "lovenox"], recommendation: "Avoid if CrCl <30 mL/min or reduce dose.", rationale: "Clearance is renally dependent; significantly increased risk of major bleeding events in renal impairment." },
    { generic: "fondaparinux", tradeNames: ["arixtra"], recommendation: "Avoid if CrCl <30 mL/min.", rationale: "Increased risk of bleeding due to accumulation in older adults with decreased renal function." },
    { generic: "dipyridamole", tradeNames: ["cardoxin", "persantine", "aggrenox"], recommendation: "Avoid oral short-acting forms.", rationale: "May cause orthostatic hypotension; more effective alternatives available." },
    { generic: "doxazosin", tradeNames: ["cadex", "cardura"], recommendation: "Avoid use as an antihypertensive.", rationale: "High risk of orthostatic hypotension and associated harms/falls in older adults." },
    { generic: "prazosin", tradeNames: ["minipress", "hypovase"], recommendation: "Avoid use as an antihypertensive.", rationale: "High risk of orthostatic hypotension; not recommended for routine hypertension management." },
    { generic: "terazosin", tradeNames: ["hytrin", "iteraz"], recommendation: "Avoid use as an antihypertensive.", rationale: "High risk of orthostatic hypotension and syncopal episodes in the elderly." },
    { generic: "clonidine", tradeNames: ["clonirit", "catapres"], recommendation: "Avoid clonidine as first-line treatment for hypertension.", rationale: "High risk of adverse CNS effects, bradycardia, and severe orthostatic hypotension." },
    { generic: "guanfacine", tradeNames: ["intuniv", "estulic"], recommendation: "Avoid for hypertension treatment.", rationale: "High risk of adverse central nervous system effects and orthostatic changes." },
    { generic: "nifedipine", recommendation: "Avoid immediate release forms.", tradeNames: ["pressolat", "nifedopress", "procardia", "adalat"], rationale: "Potential for severe hypotension; risk of precipitating myocardial ischemia." },
    { generic: "amiodarone", tradeNames: ["procor", "cordarone", "pacerone"], recommendation: "Avoid as first-line for AFib unless patient has HF.", rationale: "Effective for rhythm control but has substantially greater toxicities than other antiarrhythmics." },
    { generic: "dronedarone", tradeNames: ["multaq"], recommendation: "Avoid in permanent AFib or severe/decompensated HF.", rationale: "Associated with worse clinical outcomes and increased mortality in these subgroups." },
    { generic: "digoxin", tradeNames: ["lanoxin"], recommendation: "Avoid as first-line for AFib or heart failure. Avoid doses >0.125mg/day.", rationale: "Decreased renal clearance increases toxicity risk. Safer rate control alternatives exist." },
    { generic: "cilostazol", tradeNames: ["pletal"], recommendation: "Avoid in patients with heart failure.", rationale: "Potential to increase mortality in older adults with heart failure." },
    { generic: "diltiazem", tradeNames: ["dilatam", "adizem", "tiazac", "cardizem"], recommendation: "Avoid in heart failure with reduced ejection fraction (HFrEF).", rationale: "Negative inotropic effect; potential to promote fluid retention and exacerbate heart failure." },
    { generic: "verapamil", tradeNames: ["ikacor", "verapress", "calan"], recommendation: "Avoid in heart failure with reduced ejection fraction (HFrEF).", rationale: "Negative inotropic properties; promotes fluid retention and worsens heart failure symptoms." },
    { generic: "amiloride", tradeNames: ["kaluril"], recommendation: "Avoid if CrCl <30 mL/min.", rationale: "Risk of severe hyperkalemia and hyponatremia increases with decreased kidney function." },
    { generic: "triamterene", tradeNames: ["dyrenium", "dyazide"], recommendation: "Avoid if CrCl <30 mL/min.", rationale: "Potential for hyperkalemia and hyponatremia; alternative agents have better safety profiles." },
    { generic: "spironolactone", tradeNames: ["aldactone", "spironol"], recommendation: "Avoid if CrCl <30 mL/min.", rationale: "Marked increase in the risk of severe, life-threatening hyperkalemia." },
    { generic: "dofetilide", tradeNames: ["tikosyn"], recommendation: "Avoid if CrCl <20 mL/min; reduce dose if 20-59.", rationale: "High risk of QTc prolongation and torsades de pointes in impaired renal function." },
    { generic: "methyldopa", tradeNames: ["aldomin", "aldomet"], recommendation: "Avoid; not on current standard US market lists.", rationale: "High risk of central nervous system toxicities, bradycardia, and orthostatic hypotension." },
    { generic: "reserpine", tradeNames: ["serpasil"], recommendation: "Avoid due to historical central adverse profile.", rationale: "High rate of CNS depression, sedation, and orthostatic side effects in older adults." },
    { generic: "disopyramide", tradeNames: ["rythmodan", "norpace"], recommendation: "Avoid due to potent anticholinergic profile.", rationale: "Highly anticholinergic; may precipitate heart failure, urinary retention, and delirium." },

    // אנטיהיסטמינים
    { generic: "brompheniramine", tradeNames: ["dimetane", "dimetapp"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; risk of confusion, dry mouth, constipation, falls, and delirium." },
    { generic: "chlorpheniramine", tradeNames: ["ahiston", "chlor-trimeton"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; high risk of cognitive impairment, sedation, and urinary retention." },
    { generic: "cyproheptadine", tradeNames: ["perizinal", "periactin"], recommendation: "Avoid first-generation antihistamines.", rationale: "Potent anticholinergic properties; clearance reduced with advanced age." },
    { generic: "dimenhydrinate", tradeNames: ["travamin", "dramamine"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic and sedating; significantly increases fall and fracture risks." },
    { generic: "diphenhydramine", tradeNames: ["benadryl", "unisom", "sleep aid"], recommendation: "Avoid oral use.", rationale: "Highly anticholinergic; associated with cumulative risk of delirium, falls, and cognitive decline." },
    { generic: "doxylamine", tradeNames: ["tonight", "unisom sleeplessness"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; tolerance develops when used as a hypnotic agent." },
    { generic: "hydroxyzine", tradeNames: ["atarax", "otarex", "vistaril"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic and sedating; increases total anticholinergic burden." },
    { generic: "meclizine", tradeNames: ["navidoxine", "antivert", "bonine"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; alternative safer anti-emetic or anti-vertigo agents exist." },
    { generic: "promethazine", tradeNames: ["phenergan", "prothiazine"], recommendation: "Avoid use.", rationale: "Highly anticholinergic; extrapyramidal symptom risks; poorly tolerated by older individuals." },
    { generic: "triprolidine", tradeNames: ["actifed"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; present in combinations that elevate anticholinergic burden." },
    { generic: "carbinoxamine", tradeNames: ["clistin"], recommendation: "Avoid; low usage profile.", rationale: "Highly anticholinergic properties; typically best avoided in older populations." },
    { generic: "clemastine", tradeNames: ["tavegyl"], recommendation: "Avoid; low usage profile.", rationale: "Highly anticholinergic; significant CNS depressant effects in older adults." },
    { generic: "dextrobrompheniramine", tradeNames: ["disophrol"], recommendation: "Avoid; historical low use agent.", rationale: "Highly anticholinergic; increases risk of mental status changes and urinary retention." },
    { generic: "dexchlorpheniramine", tradeNames: ["polaramine"], recommendation: "Avoid; low usage profile.", rationale: "Highly anticholinergic properties; alternatives with better safety margins exist." },
    { generic: "pyrilamine", tradeNames: ["midol component"], recommendation: "Avoid first-generation antihistamines.", rationale: "Highly anticholinergic; typically combined in over-the-counter products increasing risk." },

    // מערכת העצבים המרכזית ופסיכיאטריה
    { generic: "amitriptyline", tradeNames: ["elatrol", "elatrolet", "endep"], recommendation: "Avoid.", rationale: "Highly anticholinergic, sedating, and causes severe orthostatic hypotension." },
    { generic: "amoxapine", tradeNames: ["asendin"], recommendation: "Avoid.", rationale: "Highly anticholinergic properties; safety profile is suboptimal for older persons." },
    { generic: "clomipramine", tradeNames: ["anafranil", "maronil"], recommendation: "Avoid.", rationale: "Highly anticholinergic antidepressant; elevated risk of falls, confusion, and dry mouth." },
    { generic: "desipramine", tradeNames: ["norpramin"], recommendation: "Avoid.", rationale: "Strong anticholinergic profile; safer alternative antidepressants are available." },
    { generic: "doxepin", tradeNames: ["gilon", "sinequan", "silenor"], recommendation: "Avoid doses >6 mg/day.", rationale: "Highly anticholinergic and sedating at standard therapeutic doses." },
    { generic: "imipramine", tradeNames: ["tofranil", "primonil"], recommendation: "Avoid.", rationale: "Highly anticholinergic and orthostatic antidepressant; poorly tolerated." },
    { generic: "nortriptyline", tradeNames: ["sensival", "pamelor"], recommendation: "Avoid.", rationale: "TCA with strong anticholinergic activity; poses risk of cognitive adverse effects." },
    { generic: "paroxetine", tradeNames: ["paxil", "seroxat"], recommendation: "Avoid.", rationale: "Highly anticholinergic compared to all other SSRIs; highly sedating." },
    { generic: "mirtazapine", tradeNames: ["mirtavon", "remeron"], recommendation: "Use with caution.", rationale: "May cause or exacerbate SIADH or hyponatremia; closely monitor sodium levels." },
    { generic: "protriptyline", tradeNames: ["vivactil"], recommendation: "Avoid.", rationale: "Highly anticholinergic antidepressant; low threshold for systemic toxicity." },
    { generic: "trimipramine", tradeNames: ["surmontil"], recommendation: "Avoid.", rationale: "Highly anticholinergic properties; safety risks outweigh potential clinical benefits." },
    { generic: "aripiprazole", tradeNames: ["abilify", "arizol"], recommendation: "Avoid except for FDA indications.", rationale: "Increased risk of stroke, cognitive decline, and mortality in persons with dementia." },
    { generic: "haloperidol", tradeNames: ["peridor", "haldol"], recommendation: "Avoid except for psychoses/severe agitation.", rationale: "High risk of extrapyramidal symptoms, cognitive decline, and mortality in dementia." },
    { generic: "olanzapine", tradeNames: ["zyprexa", "zalasta"], recommendation: "Avoid except for FDA indications.", rationale: "Increased risk of stroke, mortality, and severe metabolic side effects in dementia." },
    { generic: "quetiapine", tradeNames: ["seroquel", "quetia"], recommendation: "Avoid except for FDA indications/Parkinson psychosis.", rationale: "Increased risk of mortality and stroke in dementia; lower EPS risk but still problematic." },
    { generic: "risperidone", tradeNames: ["risperdal", "rispond"], recommendation: "Avoid except for FDA indications.", rationale: "Increased risk of stroke, cognitive decline, and all-cause mortality in dementia." },
    { generic: "chlorpromazine", tradeNames: ["taroctil", "thorazine"], recommendation: "Avoid.", rationale: "Highly anticholinergic and carries a high risk of causing orthostatic hypotension." },
    { generic: "fluphenazine", tradeNames: ["anatensol", "prolixin"], recommendation: "Avoid.", rationale: "Typical antipsychotic; high risk of extrapyramidal symptoms and mortality in dementia." },
    { generic: "brexpiprazole", tradeNames: ["rexulti"], recommendation: "Avoid except for FDA indications.", rationale: "Atypical antipsychotic class risk; elevated risk of stroke and mortality in dementia." },
    { generic: "cariprazine", tradeNames: ["vraylar"], recommendation: "Avoid except for FDA indications.", rationale: "Atypical class risk; increased rate of cognitive decline and mortality in older adults with dementia." },
    { generic: "clozapine", tradeNames: ["leponex", "clozaril"], recommendation: "Avoid except for resistant schizophrenia/Parkinson psychosis.", rationale: "Highly anticholinergic; risk of agranulocytosis and severe orthostatic changes." },
    { generic: "lurasidone", tradeNames: ["latuda"], recommendation: "Avoid except for FDA indications.", rationale: "Class-wide antipsychotic risks regarding stroke and mortality in dementia apply." },
    { generic: "paliperidone", tradeNames: ["invega"], recommendation: "Avoid except for FDA indications.", rationale: "Antipsychotic class risks; increased mortality and cardiovascular events in dementia populations." },
    { generic: "pimavanserin", tradeNames: ["nuplazid"], recommendation: "Avoid except for Parkinson's disease psychosis.", rationale: "Class warnings for mortality in elderly dementia patients are maintained." },
    { generic: "ziprasidone", tradeNames: ["geodon", "zeldox"], recommendation: "Avoid except for FDA indications.", rationale: "Risk of QTc prolongation, stroke, and mortality in persons with dementia." },
    { generic: "perphenazine", tradeNames: ["pernan", "trilafon"], recommendation: "Avoid.", rationale: "Dopamine antagonist; high risk of extrapyramidal effects and class mortality in dementia." },
    { generic: "thioridazine", tradeNames: ["melleril"], recommendation: "Avoid.", rationale: "Highly anticholinergic; associated with severe, dose-dependent QTc prolongation." },
    { generic: "trifluoperazine", tradeNames: ["stelazine"], recommendation: "Avoid.", rationale: "Typical antipsychotic; high neurological side effect profile and cognitive harms." },
    { generic: "loxapine", tradeNames: ["loxane", "loxaspan"], recommendation: "Avoid.", rationale: "Typical antipsychotic profile; elevated toxicity risk in older individuals." },
    { generic: "butalbital", tradeNames: ["fioricet"], recommendation: "Avoid.", rationale: "High rate of physical dependence, rapid tolerance, and greater risk of toxicity." },
    { generic: "phenobarbital", tradeNames: ["luminal"], recommendation: "Avoid.", rationale: "High rate of physical dependence, tolerance to sleep benefits, and risk of overdose." },
    { generic: "primidone", tradeNames: ["mysoline"], recommendation: "Avoid.", rationale: "Metabolized to phenobarbital; high sedation and physical dependence profiles." },
    { generic: "alprazolam", tradeNames: ["xanax", "alprox", "frontin", "kasalm"], recommendation: "Avoid.", rationale: "Benzodiazepine; increases risk of cognitive impairment, delirium, falls, and fractures." },
    { generic: "chlordiazepoxide", tradeNames: ["librium", "nirvam"], recommendation: "Avoid.", rationale: "Long-acting benzodiazepine; prolonged clearance increases fall and sedation risks." },
    { generic: "clobazam", tradeNames: ["frisium"], recommendation: "Avoid.", rationale: "Benzodiazepine class risks apply; cognitive impairment, delirium, ataxia, and falls." },
    { generic: "clonazepam", tradeNames: ["clonex", "rivotril", "klonopin"], recommendation: "Avoid.", rationale: "Benzodiazepine; highly prone to accumulation, inducing prolonged sedation and falls." },
    { generic: "clorazepate", tradeNames: ["tranxal", "tranxene"], recommendation: "Avoid.", rationale: "Long-acting agent; active metabolites accumulate causing cognitive and motor deficits." },
    { generic: "diazepam", tradeNames: ["assival", "valium"], recommendation: "Avoid.", rationale: "Long half-life in older adults; drastically elevates risk of falls, fractures, and delirium." },
    { generic: "estazolam", tradeNames: ["prosom"], recommendation: "Avoid.", rationale: "Hypnotic benzodiazepine; unsafe sedation profile with minimal sleep benefit." },
    { generic: "lorazepam", tradeNames: ["lorivan", "ativan"], recommendation: "Avoid.", rationale: "Benzodiazepine; intermediate-acting but still poses substantial fall and delirium risks." },
    { generic: "midazolam", tradeNames: ["dormicum", "versed"], recommendation: "Avoid.", rationale: "Benzodiazepine; clearance reduced in advanced age; prolongs respiratory depression risks." },
    { generic: "oxazepam", tradeNames: ["vaben", "serax"], recommendation: "Avoid.", rationale: "Benzodiazepine; though short-acting, it still carries prominent fall and dependence risks." },
    { generic: "temazepam", tradeNames: ["restoril"], recommendation: "Avoid.", rationale: "Sedative benzodiazepine; adverse cognitive and motor events outweigh sleep benefits." },
    { generic: "triazolam", tradeNames: ["halcion"], recommendation: "Avoid.", rationale: "Short-acting hypnotic; associated with rebound insomnia and anterograde amnesia." },
    { generic: "eszopiclone", tradeNames: ["lunesta"], recommendation: "Avoid.", rationale: "Z-drug; adverse events mirror benzodiazepines (delirium, falls, motor vehicle crashes)." },
    { generic: "zaleplon", tradeNames: ["sonata"], recommendation: "Avoid.", rationale: "Z-drug; high risk of ataxia, confusion, and overnight falls with minimal sleep changes." },
    { generic: "zolpidem", tradeNames: ["stilnox", "zodorm", "ambien", "dorim"], recommendation: "Avoid.", rationale: "Z-drug; clear correlation with delirium, fractures, and emergency hospitalizations." },
    { generic: "meprobamate", tradeNames: ["miltown"], recommendation: "Avoid.", rationale: "High rate of physical dependence; extremely sedating and poorly tolerated." },
    { generic: "ergoloid mesylates", tradeNames: ["hydergine"], recommendation: "Avoid.", rationale: "Demonstrated lack of therapeutic efficacy for its intended indications." },
    { generic: "carbamazepine", tradeNames: ["tegretol", "timonil"], recommendation: "Use with caution.", rationale: "May cause or worsen SIADH or hyponatremia. Monitor sodium levels closely." },
    { generic: "oxcarbazepine", tradeNames: ["trileptal"], recommendation: "Use with caution.", rationale: "Potent inducer of hyponatremia and SIADH; requires active laboratory monitoring." },
    { generic: "levetiracetam", tradeNames: ["keppra", "levetrim"], recommendation: "Reduce dosage if CrCl <=80 mL/min.", rationale: "Associated with central nervous system adverse effects; renally cleared." },
    { generic: "pregabalin", tradeNames: ["lyrica", "pragiola"], recommendation: "Reduce dosage if CrCl <60 mL/min.", rationale: "Renal impairment increases concentration, leading to severe CNS toxicity and changes." },
    { generic: "gabapentin", tradeNames: ["neurontin", "gabagamma"], recommendation: "Reduce dosage if CrCl <60 mL/min.", rationale: "Accumulation causes profound sedation, dizziness, and gait abnormalities/falls." },
    { generic: "lithium", tradeNames: ["licarbium", "lithane"], recommendation: "Avoid in drug-drug interactions with RAS inhibitors/diuretics.", rationale: "Concurrently used agents increase lithium levels, causing severe neurotoxicity." },
    { generic: "phenytoin", tradeNames: ["dilantin", "epanutin"], recommendation: "Avoid in drug-drug interactions with trimethoprim-sulfamethoxazole.", rationale: "Displaces binding or inhibits metabolism, markedly increasing phenytoin toxicity risks." },

    // משככי כאבים, נוגדי דלקת ומרפי שרירים
    { generic: "diclofenac", tradeNames: ["voltaren", "cataflam"], recommendation: "Avoid chronic use unless alternatives fail.", rationale: "NSAID; high risk of GI bleeding, peptic ulcer disease, acute kidney injury, and hypertension." },
    { generic: "diflunisal", tradeNames: ["dolobid"], recommendation: "Avoid chronic use.", rationale: "Nonacetylated salicylate NSAID; increased potential for severe GI ulceration and AKI." },
    { generic: "etodolac", tradeNames: ["etopan"], recommendation: "Avoid chronic use.", rationale: "NSAID; promotes fluid retention, worsens heart failure, and causes renal injury." },
    { generic: "flurbiprofen", tradeNames: ["flurwood", "ansaid"], recommendation: "Avoid chronic use.", rationale: "NSAID; substantial risk of gastrointestinal toxicity and blood pressure elevations." },
    { generic: "ibuprofen", tradeNames: ["advil", "nurofen", "ibufen"], recommendation: "Avoid chronic use unless gastroprotected.", rationale: "NSAID; dose-related risks for upper GI ulcers, gross bleeding, and acute renal failure." },
    { generic: "indomethacin", tradeNames: ["indomed", "indocin"], recommendation: "Avoid.", rationale: "NSAID; highest gastrointestinal and acute kidney injury risks, plus adverse CNS effects." },
    { generic: "ketorolac", tradeNames: ["toradol"], recommendation: "Avoid.", rationale: "Oral/parenteral NSAID; extremely high risk of gastrointestinal bleeding and renal failure." },
    { generic: "meloxicam", tradeNames: ["loxicam", "mobic"], recommendation: "Avoid chronic use.", rationale: "NSAID; linked to standard class-wide renal harms and GI bleeding risks." },
    { generic: "nabumetone", tradeNames: ["relafen"], recommendation: "Avoid chronic use.", rationale: "NSAID; upper gastrointestinal ulcers and kidney damage risks continue with duration." },
    { generic: "naproxen", tradeNames: ["naxyn", "narocin", "aleve"], recommendation: "Avoid chronic use.", rationale: "NSAID; safety concerns mirror other non-selective agents regarding bleeding and AKI." },
    { generic: "oxaprozin", tradeNames: ["daypro"], recommendation: "Avoid chronic use.", rationale: "NSAID; long half-life increases the duration of risk for GI ulcers and toxicity." },
    { generic: "piroxicam", tradeNames: ["brexin", "feldene"], recommendation: "Avoid chronic use.", rationale: "NSAID; high rate of gastrointestinal adverse events and mucosal damage." },
    { generic: "sulindac", tradeNames: ["clinoril"], recommendation: "Avoid chronic use.", rationale: "NSAID; class risks for blood pressure elevation, bleeding, and renal injury apply." },
    { generic: "fenoprofen", tradeNames: ["nalfon"], recommendation: "Avoid chronic use.", rationale: "NSAID moved to low use lists but retains class warnings for GI hemorrhage and AKI." },
    { generic: "ketoprofen", tradeNames: ["profan", "orudis"], recommendation: "Avoid chronic use.", rationale: "NSAID; long-term use is highly discouraged due to mucosal and renal risks." },
    { generic: "meclofenamate", tradeNames: ["meclomen"], recommendation: "Avoid chronic use.", rationale: "NSAID; high propensity to cause gastrointestinal distress and bleeding." },
    { generic: "mefenamic acid", tradeNames: ["ponstan"], recommendation: "Avoid chronic use.", rationale: "NSAID; poorly tolerated chronially due to renal risks and systemic toxicity." },
    { generic: "tolmetin", tradeNames: ["tolectin"], recommendation: "Avoid chronic use.", rationale: "NSAID; obsolete usage but carries standard class-wide risk profiles." },
    { generic: "celecoxib", tradeNames: ["celebra", "celebrex"], recommendation: "Avoid chronic use in high-risk patients.", rationale: "COX-2 selective but still carries renal risks and can promote fluid retention in heart failure." },
    { generic: "magnesium salicylate", tradeNames: ["doan's"], recommendation: "Avoid chronic use.", rationale: "Salicylate class risks; potential for system accumulation and renal strain." },
    { generic: "meperidine", tradeNames: ["demerol"], recommendation: "Avoid.", rationale: "Neurotoxic metabolite (normeperidine) causes high risk of delirium and seizures." },
    { generic: "tramadol", tradeNames: ["tramadex", "tramal", "ultram"], recommendation: "Use with caution. Reduce dose if CrCl <30 mL/min.", rationale: "May cause or worsen SIADH or hyponatremia. Lowers seizure threshold and causes CNS effects." },
    { generic: "carisoprodol", tradeNames: ["soma"], recommendation: "Avoid.", rationale: "Muscle relaxant; poorly tolerated due to sedating effect, anticholinergic action, and fracture risk." },
    { generic: "chlorzoxazone", tradeNames: ["parafon", "muscol"], recommendation: "Avoid.", rationale: "Skeletal muscle relaxant; high rate of sedation, falls, and uncertain efficacy." },
    { generic: "cyclobenzaprine", tradeNames: ["flexeril"], recommendation: "Avoid.", rationale: "Potent anticholinergic skeletal muscle relaxant; induces confusion, dry mouth, and falls." },
    { generic: "metaxalone", tradeNames: ["skelaxin"], recommendation: "Avoid.", rationale: "Muscle relaxant; poorly tolerated; questioned effectiveness at safe geriatric dosages." },
    { generic: "methocarbamol", tradeNames: ["robaxin"], recommendation: "Avoid.", rationale: "Muscle relaxant; high risk of drowsiness, cognitive slowing, and coordinate loss/falls." },
    { generic: "orphenadrine", tradeNames: ["norflex", "muscol component"], recommendation: "Avoid.", rationale: "Highly anticholinergic skeletal muscle relaxant; adverse geriatric profile." },
    { generic: "baclofen", tradeNames: ["lioresal", "baclosal"], recommendation: "Avoid if eGFR <60 mL/min.", rationale: "Markedly increased risk for severe encephalopathy requiring hospitalization." },
    { generic: "colchicine", tradeNames: ["colchicine taro"], recommendation: "Reduce dose if CrCl <30 mL/min.", rationale: "Increased risk of gastrointestinal, neuromuscular, and bone marrow toxicities." },
    { generic: "probenecid", tradeNames: ["benemid"], recommendation: "Avoid if CrCl <30 mL/min.", rationale: "Loses therapeutic effectiveness significantly at reduced levels of renal function." },

    // אנדוקרינולוגיה וסוכרת
    { generic: "methyltestosterone", tradeNames: ["android"], recommendation: "Avoid.", rationale: "Androgen; potential for cardiac problems and oncological risks in prostate cancer." },
    { generic: "testosterone", tradeNames: ["testomax", "androgel", "nebido"], recommendation: "Avoid unless confirmed hypogonadism.", rationale: "Potential for cardiovascular events and prostatic fluid hypertrophy." },
    { generic: "estrogens", tradeNames: ["estrofem", "progynova", "premrin", "vifem"], recommendation: "Avoid systemic oral/patch forms.", rationale: "Carcinogenic potential (breast/endometrium); high risk of stroke and deep vein thrombosis." },
    { generic: "insulin", tradeNames: ["actrapid", "novorapid", "humalog", "lantus"], recommendation: "Avoid sliding scale regimens.", rationale: "Higher risk of severe hypoglycemia without improving glycemic control." },
    { generic: "gliclazide", tradeNames: ["diamicron"], recommendation: "Avoid as first- או second-line monotherapy.", rationale: "Sulfonylurea class; high risk of cardiovascular mortality and prolonged hypoglycemia." },
    { generic: "glimepiride", tradeNames: ["amaryl"], recommendation: "Avoid.", rationale: "Long-acting sulfonylurea; carries a very high risk of severe, prolonged hypoglycemia." },
    { generic: "glipizide", tradeNames: ["gluben", "glucotrol"], recommendation: "Avoid as first/second line. Preferred over glyburide if sulfonylurea mandatory.", rationale: "Shorter-acting sulfonylurea, but class-wide cardiovascular risks still apply." },
    { generic: "glyburide", tradeNames: ["daonil", "gluben", "micronase"], recommendation: "Avoid.", rationale: "Long-acting sulfonylurea; highly prone to causing severe prolonged hypoglycemic shock." },
    { generic: "desiccated thyroid", tradeNames: ["armour thyroid"], recommendation: "Avoid.", rationale: "Concerns about adverse cardiac effects (arrhythmias); safer alternatives available." },
    { generic: "megestrol", tradeNames: ["megace"], recommendation: "Avoid.", rationale: "Minimal effect on weight; significantly increases risk of thrombotic events and death." },
    { generic: "growth hormone", tradeNames: ["norditropin", "genotropin", "humatrope"], recommendation: "Avoid unless rigorously diagnosed deficiency.", rationale: "Small body composition impact; highly associated with edema, arthralgia, and hyperglycemia." },
    { generic: "pioglitazone", tradeNames: ["actos"], recommendation: "Avoid in patients with symptomatic heart failure.", rationale: "Thiazolidinedione; promotes severe fluid retention and exacerbates heart failure." },
    { generic: "rosiglitazone", tradeNames: ["avandia"], recommendation: "Avoid.", rationale: "Removed from major markets due to severe cardiovascular safety concerns." },
    { generic: "chlorpropamide", tradeNames: ["diabinese"], recommendation: "Avoid.", rationale: "Obsolete long-acting sulfonylurea; prolonged half-life causes intractable hypoglycemia." },
    { generic: "canagliflozin", tradeNames: ["invokana"], recommendation: "Use with caution.", rationale: "SGLT2 inhibitor; risk of urogenital infections and euglycemic diabetic ketoacidosis." },
    { generic: "dapagliflozin", tradeNames: ["forxiga"], recommendation: "Use with caution.", rationale: "SGLT2 inhibitor; monitor actively for mycotic infections and early ketoacidosis." },
    { generic: "empagliflozin", tradeNames: ["jardiance"], recommendation: "Use with caution.", rationale: "SGLT2 inhibitor; requires monitoring for volume depletion and urogenital track infection." },
    { generic: "ertugliflozin", tradeNames: ["steglatro"], recommendation: "Use with caution.", rationale: "SGLT2 inhibitor class concern; evaluate volume status and target side effects." },

    // מערכת העיכול
    { generic: "dexlansoprazole", tradeNames: ["kapidex", "dexilant"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; risk of C. difficile infection, bone loss, fractures, and severe kidney injury." },
    { generic: "esomeprazole", tradeNames: ["nexium", "esoral"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; chronic use is tied to bone fractures, hypomagnesemia, and C. difficile." },
    { generic: "lansoprazole", tradeNames: ["zoton", "lanzo", "prevacid"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; long term suppression risk outweighs benefit unless high-risk criteria met." },
    { generic: "omeprazole", tradeNames: ["losec", "omepradex"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; high risk of osteoporosis, fractures, pneumonia, and Clostridium difficile." },
    { generic: "pantoprazole", tradeNames: ["controloc", "protonix"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; prolonged use requires active deprescribing trials to avoid bone loss." },
    { generic: "rabeprazole", tradeNames: ["pariet"], recommendation: "Avoid scheduled use >8 weeks.", rationale: "PPI; associated with chronic gut infections and micronutrient malabsorption." },
    { generic: "metoclopramide", tradeNames: ["pramin", "reglan"], recommendation: "Avoid unless for gastroparesis <=12 weeks.", rationale: "Can cause severe extrapyramidal effects, including irreversible tardive dyskinesia." },
    { generic: "atropine", tradeNames: ["atropine injection"], recommendation: "Avoid oral/systemic use.", rationale: "Highly anticholinergic; causes delirium, severe tachycardia, and urinary retention." },
    { generic: "clidinium-chlordiazepoxide", tradeNames: ["nirvaxal", "librax"], recommendation: "Avoid.", rationale: "Highly anticholinergic antispasmodic combined with a benzodiazepine; unsafe." },
    { generic: "dicyclomine", tradeNames: ["bentyl"], recommendation: "Avoid.", rationale: "Highly anticholinergic GI antispasmodic; poorly tolerated; uncertain effectiveness." },
    { generic: "hyoscyamine", tradeNames: ["levsin", "anaspaz"], recommendation: "Avoid.", rationale: "Highly anticholinergic; risk of systemic toxicity and mental status changes." },
    { generic: "scopolamine", tradeNames: ["scopoderm", "transderm scop"], recommendation: "Avoid.", rationale: "Highly anticholinergic; high rate of visual disturbances, confusion, and dry mouth." },
    { generic: "mineral oil", tradeNames: ["paraffin oil", "kondremul"], recommendation: "Avoid oral administration.", rationale: "Potential for serious lipid aspiration pneumonia; safer laxative alternatives exist." },
    { generic: "cimetidine", tradeNames: ["tagamet"], recommendation: "Avoid in delirium/high risk states.", rationale: "H2RA with high central nervous system adverse profile and extensive drug interactions." },
    { generic: "famotidine", tradeNames: ["gastro", "pepcid"], recommendation: "Avoid in delirium/high risk states.", rationale: "H2RA; can induce or worsen cognitive impairment and confusion in vulnerable קשישים." },
    { generic: "nizatidine", tradeNames: ["axid"], recommendation: "Avoid in delirium/high risk states.", rationale: "H2RA; associated with mental status changes and central nervous system adverse events." },
    { generic: "belladonna alkaloids", tradeNames: ["donnatal"], recommendation: "Avoid.", rationale: "Highly anticholinergic combination agents; obsolete and unsafe geriatric profile." },
    { generic: "methscopolamine", tradeNames: ["pamine"], recommendation: "Avoid.", rationale: "Highly anticholinergic; high risk of precipitating acute urinary retention and delirium." },
    { generic: "propantheline", tradeNames: ["pro-banthine"], recommendation: "Avoid.", rationale: "Potent anticholinergic antispasmodic; toxic systemic profile in advanced age." },

    // אנטי זיהומיות
    { generic: "nitrofurantoin", tradeNames: ["macrodantin", "uvamin"], recommendation: "Avoid if CrCl <30 mL/min or long-term.", rationale: "Potential for serious pulmonary toxicity, hepatotoxicity, and peripheral neuropathy." },
    { generic: "ciprofloxacin", tradeNames: ["cipro", "ciprodex", "ciplox"], recommendation: "Reduce dose if CrCl <30 mL/min.", rationale: "Increased risk of central nervous system effects (seizures, confusion) and tendon rupture." },
    { generic: "trimethoprim-sulfamethoxazole", tradeNames: ["resprim", "bactrim", "septra"], recommendation: "Reduce dose if CrCl 15-29; Avoid if <15.", rationale: "High risk of worsening renal function and precipitating severe hyperkalemia." },

    // אורולוגיה
    { generic: "desmopressin", tradeNames: ["minirin", "ddavp"], recommendation: "Avoid for treatment of nocturia.", rationale: "Extremely high risk of developing severe, life-threatening hyponatremia." },
    { generic: "darifenacin", tradeNames: ["emselex"], recommendation: "Avoid for urinary incontinence if alternatives exist.", rationale: "Antimuscarinic; potential for cognitive impairment, constipation, and dry mouth." },
    { generic: "fesoterodine", tradeNames: ["toviaz"], recommendation: "Avoid for urinary incontinence.", rationale: "Bladder antimuscarinic; adds to the cumulative systemic anticholinergic burden." },
    { generic: "flavoxate", tradeNames: ["urispas"], recommendation: "Avoid.", rationale: "Antimuscarinic antispasmodic; risk of anticholinergic central side effects." },
    { generic: "oxybutynin", tradeNames: ["novitropan", "ditropan", "lyrinel"], recommendation: "Avoid.", rationale: "Highly anticholinergic antimuscarinic; clearest evidence for adverse cognitive decline." },
    { generic: "solifenacin", tradeNames: ["vesicare"], recommendation: "Avoid for urinary incontinence.", rationale: "Antimuscarinic; caution warranted due to potential for confusion and delirium." },
    { generic: "tolterodine", tradeNames: ["detrusitol"], recommendation: "Avoid for urinary incontinence.", rationale: "Antimuscarinic; high risk of aggravating dry mouth, constipation, and cognitive slowing." },
    { generic: "trospium", tradeNames: ["spasmex", "sanctura"], recommendation: "Avoid for urinary incontinence.", rationale: "Antimuscarinic bladder agent; adds to total systemic anticholinergic burden." },

    // אחר ושילובים
    { generic: "benztropine", tradeNames: ["cogentin"], recommendation: "Avoid.", rationale: "Potent anticholinergic; high neurological side effect profile, confusion, and falls." },
    { generic: "trihexyphenidyl", tradeNames: ["artane"], recommendation: "Avoid.", rationale: "Highly anticholinergic antiparkinsonian; risk of delirium and acute confusion." },
    { generic: "dextromethorphan-quinidine", tradeNames: ["nuedexta"], recommendation: "Avoid in patients with heart failure.", rationale: "Concerns regarding QT prolongation and potential fluid retention dynamics." }
];

window.searchBeers = function() {
    try {
        const inputElement = document.getElementById('beers-search-input');
        const resultDiv = document.getElementById('beers-result');

        // הגנה 1: זיהוי נתק מה-HTML
        if (!inputElement || !resultDiv) {
            console.error("שגיאת אדריכלות: חסרים אלמנטים ב-HTML.");
            return;
        }

        const searchInput = inputElement.value.trim().toLowerCase();

        // הגנה 2: קלט ריק
        if (!searchInput) {
            resultDiv.innerHTML = '<span style="color:red; font-weight:bold;">נא להזין שם תרופה לחיפוש.</span>';
            return;
        }

        // הגנה 3: חיפוש בטוח גם אם חסר שדה מסחרי או שיש שגיאת הקלדה במסד
        const found = beersDatabase.find(d => {
            const matchGeneric = d.generic && d.generic.toLowerCase() === searchInput;
            const matchTrade = d.tradeNames && Array.isArray(d.tradeNames) && d.tradeNames.some(t => t.toLowerCase() === searchInput);
            return matchGeneric || matchTrade;
        });

        // הצגת תוצאות חלקה
        if (found) {
            resultDiv.innerHTML = `
                <div style="background-color: #ffebee; border: 2px solid #c62828; padding: 15px; border-radius: 8px; color: #c62828; margin-top: 15px; text-align: left; direction: ltr;">
                    <h3 style="margin-top:0; color:#b71c1c;">⚠️ אזהרת סיכון לקשיש: ${found.generic.toUpperCase()}</h3>
                    <p><strong>Recommendation:</strong> ${found.recommendation}</p>
                    <p><strong>Rationale:</strong> ${found.rationale}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="background-color: #e8f5e9; border: 2px solid #2e7d32; padding: 15px; border-radius: 8px; color: #2e7d32; margin-top: 15px; text-align: right; direction: rtl;">
                    <h3 style="margin-top:0; color:#1b5e20;">ℹ️ התרופה לא נמצאה במאגר</h3>
                    <p>השם שהוקלד אינו מופיע במאגר ה-Beers המקומי. יש להפעיל שיקול דעת קליני.</p>
                </div>
            `;
        }
    } catch (error) {
        // הגנה 4: טיפול באסון קריסה ודיווח למשתמש
        console.error("קריסת מנוע חיפוש:", error);
        document.getElementById('beers-result').innerHTML = '<span style="color:red;">שגיאת מערכת: מסד הנתונים חסר או פגום. לחץ F12 לבדיקת ה-Console.</span>';
    }
};

window.clearBeers = function() {
    const inputElement = document.querySelector('#beers-section input[type="text"]');
    if(inputElement) inputElement.value = '';
    const resultDiv = document.getElementById('beers-result');
    if(resultDiv) {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
    }
};

window.switchTab = function(paneId, clickedBtn) {
    const targetPane = document.getElementById(paneId);
    if (!targetPane) return; // הגנה במקרה של ID שגוי
    
    // בדיקה האם הלשונית הספציפית כבר פתוחה
    const isActive = targetPane.classList.contains('active');

    // סגירת כל הלשוניות וכיבוי כל הכפתורים
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // אם הלשונית לא הייתה פתוחה, פתח אותה והדלק את הכפתור
    if (!isActive) {
        targetPane.classList.add('active');
        if (clickedBtn) clickedBtn.classList.add('active');
    }
};
