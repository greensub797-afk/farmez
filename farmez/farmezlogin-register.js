function showAlert(message, type = 'error') {
    const overlay = document.getElementById('alertOverlay');
    const alertBox = document.getElementById('alertBox');
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertButton = document.getElementById('alertButton');
    
    if (!overlay) return;
    
    // Set alert content
    alertMessage.textContent = message;
    
    if (type === 'success') {
        alertIcon.textContent = '✅';
        alertTitle.textContent = 'Success!';
        alertBox.className = 'alert-box alert-success';
    } else {
        alertIcon.textContent = '⚠️';
        alertTitle.textContent = 'Error!';
        alertBox.className = 'alert-box alert-error';
    }
    
    // Show overlay
    overlay.classList.add('active');
    
    // Button click handler
    alertButton.onclick = function() {
        overlay.classList.remove('active');
    };
    
    // Close alert when clicking outside
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 5000);
    }
}

// Form toggle functionality
function initFormToggle() {
    const toggleSignupLink = document.getElementById('toggle-signup-link');
    const signInLink = document.getElementById('signInLink');
    const container = document.getElementById('container');

    if (toggleSignupLink) {
        toggleSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            container.classList.add('active');
        });
    }

    if (signInLink) {
        signInLink.addEventListener('click', function(e) {
            e.preventDefault();
            container.classList.remove('active');
        });
    }
}

// Form validation helper (returns true if all required fields are filled)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff4444';
            input.classList.add('shake');
            setTimeout(() => {
                input.classList.remove('shake');
            }, 500);
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Login handler – redirect to admin.html after validation
function handleLogin(form) {
    if (!validateForm(form)) {
        showAlert('Please fill in all required fields.', 'error');
        return false;
    }
    
    // In a real app, you would send credentials to a backend here
    // For demo, we just redirect
    showAlert('Login successful! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'laborer.html';
    }, 1000);
    return false;
}

// Registration handler – send data to backend
function handleRegistration(form) {
    if (!validateForm(form)) {
        showAlert('Please fill in all required fields.', 'error');
        return false;
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        middle_initial: formData.get('middle_initial'),
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    console.log('Sending registration data:', data);
    
    // Send registration data to backend
    fetch('api/add_worker.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Response text:', text);
        try {
            const result = JSON.parse(text);
            if (result.status === 'success') {
                showAlert(result.message, 'success');
                
                // Clear form
                form.reset();
                
                // Switch to login view after 2 seconds
                setTimeout(() => {
                    const container = document.getElementById('container');
                    container.classList.remove('active');
                }, 2000);
            } else {
                showAlert(result.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Raw response:', text);
            showAlert('Server error: ' + text, 'error');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showAlert('Connection error: ' + error.message, 'error');
    });
    
    return false;
}

// Initialize event listeners
function initForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration(this);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFormToggle();
    initForms();
    
    // Make showAlert function globally accessible
    window.showAlert = showAlert;
    
});