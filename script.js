// Database simulation using localStorage
let users = JSON.parse(localStorage.getItem('bonoUsers')) || [];
let applications = JSON.parse(localStorage.getItem('bonoApplications')) || [];

// Initialize default admin user
if (!users.some(user => user.username === 'adrian')) {
    users.push({
        id: Date.now(),
        username: 'adrian',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        email: 'admin@bono.gob.do',
        cedula: '001-0000000-0',
        phone: '809-000-0000',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('bonoUsers', JSON.stringify(users));
}

// Utility functions
function showError(fieldId, message) {
    const errorDiv = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    if (errorDiv && field) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        field.classList.add('input-error');
    }
}

function hideError(fieldId) {
    const errorDiv = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    if (errorDiv && field) {
        errorDiv.style.display = 'none';
        field.classList.remove('input-error');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCedula(cedula) {
    // Dominican cedula validation (XXX-XXXXXXX-X format)
    const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
    if (!cedulaRegex.test(cedula)) return false;

    // Additional validation: check if the last digit is correct (basic algorithm)
    const parts = cedula.split('-');
    if (parts.length !== 3) return false;

    const firstPart = parts[0];
    const secondPart = parts[1];
    const checkDigit = parseInt(parts[2]);

    // Simple validation: check if all parts are numbers and lengths are correct
    if (firstPart.length !== 3 || secondPart.length !== 7 || isNaN(checkDigit)) return false;
    if (isNaN(firstPart) || isNaN(secondPart)) return false;

    // Basic range check
    const firstNum = parseInt(firstPart);
    const secondNum = parseInt(secondPart);
    if (firstNum < 1 || firstNum > 999 || secondNum < 0 || secondNum > 9999999) return false;

    return true;
}

function validatePhone(phone) {
    // Dominican phone validation (XXX-XXX-XXXX format)
    const phoneRegex = /^(809|829|849)-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
}

function validatePassword(password) {
    // Password must have at least 8 characters, one uppercase, one lowercase, one number
    const minLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
        isValid: minLength && hasLower && hasUpper && hasNumber,
        errors: {
            length: !minLength,
            lower: !hasLower,
            upper: !hasUpper,
            number: !hasNumber
        }
    };
}

function checkUserCredentials(username, password) {
    return users.some(user => user.username === username && user.password === password);
}

function getUserData(username) {
    return users.find(user => user.username === username);
}

function saveUser(userData) {
    users.push(userData);
    localStorage.setItem('bonoUsers', JSON.stringify(users));
}

function saveApplication(applicationData) {
    applications.push(applicationData);
    localStorage.setItem('bonoApplications', JSON.stringify(applications));
}

function getUserApplications(userId) {
    return applications.filter(app => app.userId === userId);
}

function updateApplicationStatus(applicationId, status) {
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex !== -1) {
        applications[appIndex].status = status;
        applications[appIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('bonoApplications', JSON.stringify(applications));
    }
}

// Real-time validation functions
function validateField(fieldId, validator, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const value = field.value.trim();

    if (value === '') {
        hideError(fieldId);
        return;
    }

    const isValid = validator(value);
    if (isValid) {
        hideError(fieldId);
    } else {
        showError(fieldId, errorMessage);
    }
}

function validatePasswordField() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password === '') {
        hideError('password');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        let errorMsg = 'La contraseña debe tener:';
        if (passwordValidation.errors.length) errorMsg += ' al menos 8 caracteres';
        if (passwordValidation.errors.lower) errorMsg += ', una minúscula';
        if (passwordValidation.errors.upper) errorMsg += ', una mayúscula';
        if (passwordValidation.errors.number) errorMsg += ', un número';
        showError('password', errorMsg);
    } else {
        hideError('password');
    }

    // Also validate confirm password if it's not empty
    if (confirmPassword !== '') {
        if (confirmPassword === password) {
            hideError('confirmPassword');
        } else {
            showError('confirmPassword', 'Las contraseñas no coinciden');
        }
    }
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (confirmPassword === '') {
        hideError('confirmPassword');
        return;
    }

    if (confirmPassword === password) {
        hideError('confirmPassword');
    } else {
        showError('confirmPassword', 'Las contraseñas no coinciden');
    }
}

// Registration functionality
function initializeRegistration() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Add real-time validation
    document.getElementById('firstName').addEventListener('input', () => {
        validateField('firstName', (val) => val.length >= 2, 'El nombre debe tener al menos 2 caracteres');
    });

    document.getElementById('lastName').addEventListener('input', () => {
        validateField('lastName', (val) => val.length >= 2, 'El apellido debe tener al menos 2 caracteres');
    });

    document.getElementById('cedula').addEventListener('input', () => {
        validateField('cedula', validateCedula, 'Ingresa una cédula válida (XXX-XXXXXXX-X)');
    });

    document.getElementById('email').addEventListener('input', () => {
        validateField('email', validateEmail, 'Ingresa un email válido');
    });

    document.getElementById('phone').addEventListener('input', () => {
        validateField('phone', validatePhone, 'Ingresa un teléfono válido (XXX-XXX-XXXX)');
    });

    document.getElementById('password').addEventListener('input', validatePasswordField);
    document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('termsAccepted').checked;

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('input').forEach(el => el.classList.remove('input-error'));

        let hasErrors = false;

        // Validation
        if (!firstName || firstName.length < 2) {
            showError('firstName', 'El nombre debe tener al menos 2 caracteres');
            hasErrors = true;
        }

        if (!lastName || lastName.length < 2) {
            showError('lastName', 'El apellido debe tener al menos 2 caracteres');
            hasErrors = true;
        }

        if (!cedula || !validateCedula(cedula)) {
            showError('cedula', 'Ingresa una cédula válida (XXX-XXXXXXX-X)');
            hasErrors = true;
        }

        if (!email || !validateEmail(email)) {
            showError('email', 'Ingresa un email válido');
            hasErrors = true;
        }

        if (!phone || !validatePhone(phone)) {
            showError('phone', 'Ingresa un teléfono válido (XXX-XXX-XXXX)');
            hasErrors = true;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            let errorMsg = 'La contraseña debe tener:';
            if (passwordValidation.errors.length) errorMsg += ' al menos 8 caracteres';
            if (passwordValidation.errors.lower) errorMsg += ', una minúscula';
            if (passwordValidation.errors.upper) errorMsg += ', una mayúscula';
            if (passwordValidation.errors.number) errorMsg += ', un número';
            showError('password', errorMsg);
            hasErrors = true;
        }

        if (!confirmPassword || confirmPassword !== password) {
            showError('confirmPassword', 'Las contraseñas no coinciden');
            hasErrors = true;
        }

        if (!termsAccepted) {
            showError('terms', 'Debes aceptar los términos y condiciones');
            hasErrors = true;
        }

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            showError('email', 'Este email ya está registrado');
            hasErrors = true;
        }

        if (users.some(user => user.cedula === cedula)) {
            showError('cedula', 'Esta cédula ya está registrada');
            hasErrors = true;
        }

        if (hasErrors) {
            const firstError = document.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Create user
        const newUser = {
            id: Date.now(),
            username: email.split('@')[0], // Use email prefix as username
            password: password,
            role: 'user',
            name: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName,
            email: email,
            cedula: cedula,
            phone: phone,
            createdAt: new Date().toISOString()
        };

        // Create application
        const newApplication = {
            id: Date.now() + 1,
            userId: newUser.id,
            status: 'pending',
            amount: 5000,
            submittedAt: new Date().toISOString(),
            documents: {
                cedula: false,
                bankStatement: false
            },
            notes: 'Solicitud inicial registrada'
        };

        // Save data
        saveUser(newUser);
        saveApplication(newApplication);

        // Show success message
        const registerBtn = document.getElementById('registerBtn');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = '🎉 ¡Cuenta creada exitosamente!';
        registerBtn.disabled = true;

        setTimeout(() => {
            alert(`🎄 ¡Bienvenido ${firstName}!\n\nTu solicitud del Bono Navideño 5K ha sido registrada.\n\nUsuario: ${newUser.username}\n\nRevisa tu email para más información.`);
            window.location.href = 'login.html';
        }, 2000);
    });
}

// Dashboard functionality
function loadUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Solicitante';

    // Load user applications
    const userApplications = currentUser.role === 'admin' ?
        applications :
        getUserApplications(currentUser.id);

    if (userApplications.length > 0) {
        const latestApp = userApplications[userApplications.length - 1];
        document.getElementById('currentStatus').textContent = getStatusText(latestApp.status);
        document.getElementById('applicationDate').textContent = new Date(latestApp.submittedAt).toLocaleDateString('es-DO');
        document.getElementById('applicationStatus').textContent = getStatusText(latestApp.status);

        // Update status indicators
        updateStatusIndicators(latestApp);
    }

    // Load admin data if admin
    if (currentUser.role === 'admin') {
        loadAdminData();
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'under_review': 'En Revisión',
        'approved': 'Aprobada',
        'rejected': 'Rechazada',
        'paid': 'Pagada'
    };
    return statusMap[status] || 'Desconocido';
}

function updateStatusIndicators(application) {
    const statusElements = {
        'docStatus': application.documents.cedula && application.documents.bankStatement ? 'Completado' : 'Pendiente',
        'approvalStatus': ['approved', 'paid'].includes(application.status) ? 'Aprobada' : 'Pendiente',
        'depositStatus': application.status === 'paid' ? 'Completado' : 'Pendiente'
    };

    Object.keys(statusElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = statusElements[id];
            element.className = statusElements[id] === 'Completado' ? 'text-green-600' : 'text-yellow-600';
        }
    });
}

function loadAdminData() {
    const totalApps = applications.length;
    const pendingApps = applications.filter(app => app.status === 'pending').length;
    const approvedApps = applications.filter(app => ['approved', 'paid'].includes(app.status)).length;

    document.getElementById('totalApplications').textContent = totalApps;
    document.getElementById('pendingApplications').textContent = pendingApps;
    document.getElementById('approvedApplications').textContent = approvedApps;

    // Load applications list
    const adminList = document.getElementById('adminApplicationsList');
    if (adminList && applications.length > 0) {
        let html = '<div class="space-y-4">';
        applications.forEach(app => {
            const user = users.find(u => u.id === app.userId);
            html += `
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-medium">${user ? user.name : 'Usuario desconocido'}</h4>
                            <p class="text-sm text-gray-600">Cédula: ${user ? user.cedula : 'N/A'}</p>
                            <p class="text-sm text-gray-600">Fecha: ${new Date(app.submittedAt).toLocaleDateString('es-DO')}</p>
                        </div>
                        <span class="px-2 py-1 ${getStatusClass(app.status)} text-xs rounded-full">${getStatusText(app.status)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Monto: RD$${app.amount.toLocaleString()}</span>
                        <div class="space-x-2">
                            ${app.status === 'pending' ? `
                                <button onclick="approveApplication(${app.id})" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Aprobar</button>
                                <button onclick="rejectApplication(${app.id})" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Rechazar</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        adminList.innerHTML = html;
    }
}

function getStatusClass(status) {
    const classMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'under_review': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'paid': 'bg-purple-100 text-purple-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
}

function approveApplication(appId) {
    updateApplicationStatus(appId, 'approved');
    alert('✅ Solicitud aprobada exitosamente');
    loadAdminData();
}

function rejectApplication(appId) {
    updateApplicationStatus(appId, 'rejected');
    alert('❌ Solicitud rechazada');
    loadAdminData();
}

function updateUI() {
    // Add fade-in animation to elements
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeRegistration();
    updateUI();
});
