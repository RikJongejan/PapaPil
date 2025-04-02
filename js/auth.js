/**
 * MediBuddy Authenticatiesysteem
 * Beheert inlog- en registratiefunctionaliteit
 */

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // INITIALISATIE
    // =====================
    
    // Initialiseer thema-schakelaar voor gebruikerservaring
    initTheme();
    
    // Identificeer welk formulier aanwezig is op de pagina
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const currentForm = loginForm || signupForm;
    const isSignup = !!signupForm;
    
    // Stop vroegtijdig als er geen formulier is
    if (!currentForm) return;
    
    // Configureer formulierfunctionaliteit voor gebruikers
    setupPasswordToggles();
    setupFormValidation();
    
    // =====================
    // THEMABEHEER
    // =====================
    
    // Initialiseer themafunctionaliteit voor licht/donker modus
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        if (!themeToggle || !themeIcon) return;
        
        // Maak overlay voor overgangen
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        document.body.appendChild(overlay);
        
        // Initialiseer thema op basis van opgeslagen voorkeur of systeeminstelling
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
        
        // Wissel thema bij klik
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            
            // Animatieklassen
            themeToggle.classList.add('animate');
            overlay.classList.add('active');
            document.body.classList.add('theme-transitioning');
            
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Verwijder animatieklassen na overgang
            setTimeout(() => {
                themeToggle.classList.remove('animate');
                overlay.classList.remove('active');
                document.body.classList.remove('theme-transitioning');
            }, 500);
        });
        
        // Luister naar systeemthemawijzigingen als er geen handmatige voorkeur is ingesteld
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    // Stel thema in en werk icoon bij
    function setTheme(theme) {
        const themeIcon = document.getElementById('theme-icon');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    }
    
    // =====================
    // WACHTWOORDZICHTBAARHEID
    // =====================
    
    // Configureer wachtwoordschakelaar voor beter gebruiksgemak
    function setupPasswordToggles() {
        document.querySelectorAll('[id$="password"]').forEach(input => {
            const toggleBtn = input.nextElementSibling;
            if (toggleBtn && toggleBtn.classList.contains('toggle-password')) {
                // Wissel tussen tekst en wachtwoordweergave voor gebruikersgemak
                toggleBtn.addEventListener('click', () => {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    toggleBtn.textContent = type === 'password' ? '👁️' : '🔒';
                });
            }
        });
    }
    
    // =====================
    // FORMULIERVALIDATIE
    // =====================
    
    // Configureer formuliervalidatie en verzending
    function setupFormValidation() {
        currentForm.addEventListener('submit', e => {
            // Voorkom standaard verzendgedrag voor eigen validatie
            e.preventDefault();
            
            let isValid = true;
            
            // Gemeenschappelijke validaties voor beide formulieren
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            
            // E-mailvalidatie met reguliere expressie
            if (!validateEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Wachtwoordvalidatie voor minimale lengte
            if (password.value.length < 6) {
                showError(password, 'Password must be at least 6 characters');
                isValid = false;
            }
            
            // Registratie-specifieke validaties voor extra velden
            if (isSignup) {
                const username = document.getElementById('username');
                const confirmPassword = document.getElementById('confirm-password');
                const terms = document.getElementById('terms');
                
                // Gebruikersnaamvalidatie
                if (username.value.length < 3) {
                    showError(username, 'Username must be at least 3 characters');
                    isValid = false;
                }
                
                // Wachtwoordbevestiging
                if (confirmPassword.value !== password.value) {
                    showError(confirmPassword, 'Passwords do not match');
                    isValid = false;
                }
                
                // Voorwaarden akkoord
                if (!terms.checked) {
                    alert('You must agree to the terms of service');
                    isValid = false;
                }
            }
            
            // Als formulier geldig is, simuleer verzending
            if (isValid) {
                submitForm();
            }
        });
        
        // Wis foutmeldingen bij invoer voor betere gebruikerservaring
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', function() {
                clearError(this);
            });
        });
    }
    
    // =====================
    // HULPFUNCTIES
    // =====================
    
    // Valideer e-mailformaat met reguliere expressie
    function validateEmail(email) {
        return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Toon foutmelding bij een veld
    function showError(field, message) {
        field.classList.add('error');
        
        // Vind geschikte oudercontainer
        const container = field.closest('.form-group');
        if (!container) return;
        
        // Maak foutmelding als deze niet bestaat
        let errorMsg = container.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            container.appendChild(errorMsg);
        }
        
        errorMsg.textContent = message;
    }
    
    // Wis fout bij een veld
    function clearError(field) {
        field.classList.remove('error');
        
        const container = field.closest('.form-group');
        if (!container) return;
        
        const errorMsg = container.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }
    
    // Verzend formulier (simuleer API-aanroep)
    function submitForm() {
        // Verkrijg verzendknop voor status-updates
        const submitBtn = currentForm.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Toon laadstatus voor gebruikersfeedback
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        
        // Simuleer API-aanroepduur voor demonstratie
        setTimeout(() => {
            // Herstel knopstatus na verwerking
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            submitBtn.textContent = originalText;
            
            // Toon succesmelding op basis van formuliertype
            if (isSignup) {
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                showSuccessMessage(`Account successfully created for ${username} (${email})!`);
            } else {
                const email = document.getElementById('email').value;
                showSuccessMessage(`Successfully logged in as ${email}!`);
            }
            
            // Doorsturen na korte vertraging
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 1800);
    }
    
    // Toon succesmelding voor gebruikersfeedback
    function showSuccessMessage(message) {
        // Maak een succesberichtelement
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = message;
        
        // Style het bericht als het nog niet in de stylesheet staat
        if (!document.querySelector('#success-message-style')) {
            const style = document.createElement('style');
            style.id = 'success-message-style';
            style.textContent = `
                .success-message {
                    background-color: var(--success-color);
                    color: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                    text-align: center;
                    animation: fadeIn 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Voeg toe aan de formuliercontainer
        const container = currentForm.closest('.login-form-container');
        if (container) {
            container.insertBefore(successMsg, currentForm);
            currentForm.style.display = 'none';
        }
    }
});
