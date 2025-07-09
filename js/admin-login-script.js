// Credenciales del administrador
const ADMIN_CREDENTIALS = {
    username: 'Jose',
    password: 'Jose'
};

// Configuración de sesión
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const SESSION_KEY = 'admin_session';
const REMEMBER_KEY = 'admin_remember';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    if (isAuthenticated()) {
        redirectToAdmin();
        return;
    }
    
    setupEventListeners();
    checkRememberedSession();
});

// Configurar event listeners
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Submit del formulario
    loginForm.addEventListener('submit', handleLogin);
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // Limpiar error al escribir
    document.getElementById('username').addEventListener('input', clearError);
    document.getElementById('password').addEventListener('input', clearError);
}

// Manejar login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validar credenciales
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login exitoso
        createSession(rememberMe);
        showSuccess();
        
        // Redireccionar después de un breve delay
        setTimeout(() => {
            redirectToAdmin();
        }, 1000);
    } else {
        // Login fallido
        showError('Usuario o contraseña incorrectos');
        
        // Limpiar campos
        document.getElementById('password').value = '';
        document.getElementById('username').focus();
    }
}

// Crear sesión
function createSession(remember) {
    const sessionData = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + SESSION_DURATION
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    if (remember) {
        localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
        localStorage.removeItem(REMEMBER_KEY);
    }
}

// Verificar autenticación
function isAuthenticated() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        // Verificar si la sesión ha expirado
        if (now > session.expires) {
            localStorage.removeItem(SESSION_KEY);
            return false;
        }
        
        return session.authenticated === true;
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        return false;
    }
}

// Verificar sesión recordada
function checkRememberedSession() {
    const remembered = localStorage.getItem(REMEMBER_KEY);
    if (remembered === 'true') {
        document.getElementById('rememberMe').checked = true;
    }
}

// Mostrar error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Limpiar error
function clearError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

// Mostrar éxito
function showSuccess() {
    const loginBtn = document.querySelector('.login-btn');
    const originalContent = loginBtn.innerHTML;
    
    loginBtn.innerHTML = '<i class="fas fa-check"></i> ¡Acceso concedido!';
    loginBtn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
    loginBtn.disabled = true;
}

// Redireccionar al admin
function redirectToAdmin() {
    window.location.href = 'admin.html';
}

// Función para cerrar sesión (será llamada desde admin)
function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    window.location.href = 'admin-login.html';
}

// Exportar función de logout para uso en admin
window.adminLogout = logout;