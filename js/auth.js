// Sistema de autenticación de usuarios
let users = JSON.parse(localStorage.getItem('nocturneUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('nocturneCurrentUser')) || null;

// Guardar usuarios en localStorage
function saveUsers() {
    localStorage.setItem('nocturneUsers', JSON.stringify(users));
}

// Guardar usuario actual en localStorage
function saveCurrentUser() {
    localStorage.setItem('nocturneCurrentUser', JSON.stringify(currentUser));
}

// Registrar nuevo usuario
function registerUser(username, email, password) {
    // Validar usuario
    if (username.length < 3) {
        Swal.fire({
            icon: 'error',
            title: 'Usuario inválido',
            text: 'El usuario debe tener al menos 3 caracteres'
        });
        return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Email inválido',
            text: 'Por favor, ingresa un email válido'
        });
        return false;
    }

    // Validar contraseña
    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña débil',
            text: 'La contraseña debe tener al menos 6 caracteres'
        });
        return false;
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        Swal.fire({
            icon: 'warning',
            title: 'Email en uso',
            text: 'Este email ya está registrado'
        });
        return false;
    }

    // Verificar si el nombre de usuario ya existe
    const existingUsername = users.find(user => user.username === username);
    if (existingUsername) {
        Swal.fire({
            icon: 'warning',
            title: 'Usuario en uso',
            text: 'Este nombre de usuario ya está en uso'
        });
        return false;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password, // En producción se debería encriptar
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();
    Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Ya puedes iniciar sesión con tu cuenta'
    });
    return true;
}

// Iniciar sesión
function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Guardar email para precarga en próximos accesos
        localStorage.setItem('nocturneLastEmail', email);
        
        currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            loginAt: new Date().toISOString()
        };
        saveCurrentUser();
        updateAuthUI();
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${user.username}`,
            timer: 2000,
            showConfirmButton: false
        });
        return true;
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error de acceso',
            text: 'Email o contraseña incorrectos'
        });
        return false;
    }
}

// Cerrar sesión
function logoutUser() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: "¿Estás seguro de que quieres salir?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            currentUser = null;
            localStorage.removeItem('nocturneCurrentUser');
            updateAuthUI();
            Swal.fire({
                icon: 'success',
                title: 'Sesión cerrada',
                text: '¡Hasta pronto!',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// Verificar si hay usuario logeado
function isUserLoggedIn() {
    return currentUser !== null;
}

// Obtener usuario actual
function getCurrentUser() {
    return currentUser;
}

// Actualizar interfaz según estado de autenticación
function updateAuthUI() {
    const userNameDisplay = document.querySelector('.user-name-display');
    const userEmailDisplay = document.querySelector('.user-email-display');
    const loginSection = document.querySelector('.login-section');
    const logoutBtn = document.querySelector('.logout-btn');
    const userInfoSection = document.querySelector('.user-info-section');

    if (isUserLoggedIn()) {
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username || 'Usuario';
        if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email;
        if (loginSection) loginSection.style.display = 'none';
        if (userInfoSection) userInfoSection.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (userInfoSection) userInfoSection.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Mostrar modal de login
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Cerrar modal de login
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Mostrar modal de registro
function showRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Cerrar modal de registro
function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Manejar login desde modal
function handleModalLogin(event) {
    event.preventDefault();
    const email = document.getElementById('modal-email').value;
    const password = document.getElementById('modal-password').value;
    
    if (loginUser(email, password)) {
        closeLoginModal();
        // Continuar con el checkout
        proceedWithCheckout();
    }
}

// Continuar con el proceso de compra
function proceedWithCheckout() {
    if (typeof checkout === 'function') {
        checkout();
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar UI según estado de autenticación
    updateAuthUI();

    // Precargar último email usado en localStorage (si existe)
    const lastEmail = localStorage.getItem('nocturneLastEmail');
    const loginEmailInput = document.getElementById('login-email');
    if (lastEmail && loginEmailInput) {
        loginEmailInput.value = lastEmail;
        loginEmailInput.placeholder = 'Email guardado';
    }

    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas no coinciden'
                });
                return;
            }

            if (registerUser(username, email, password)) {
                registerForm.reset();
                closeRegisterModal();
            }
        });
    }

    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (loginUser(email, password)) {
                loginForm.reset();
            }
        });
    }

    // Formulario de login en modal
    const modalLoginForm = document.getElementById('modal-login-form');
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', handleModalLogin);
    }

    // Botón de logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Cerrar modal al hacer clic fuera
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === registerModal) {
                closeRegisterModal();
            }
        });
    }

    // Botones de cerrar modal
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeLoginModal();
            closeRegisterModal();
        });
    });
});
