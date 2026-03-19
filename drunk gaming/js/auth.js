// ========================================
// AUTHENTICATION SYSTEM - PHP + MySQL
// ========================================

// Check if user is logged in (from server)
function checkAuth() {
    fetch('php/check_session.php', {
        credentials: 'include' // 👈 Importante
    })
        .then(response => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.error('Respuesta no JSON:', text);
                    return { loggedIn: false };
                });
            }
        })
        .then(data => {
            console.log('Auth check result:', data); // 👈 Debug
            
            if (data.loggedIn) {
                document.body.classList.remove('logged-out');
                document.body.classList.add('logged-in');
                
                // Mostrar menú de usuario
                const authButtons = document.getElementById('authButtons');
                const userMenu = document.getElementById('userMenu');
                
                if (authButtons) authButtons.style.display = 'none';
                if (userMenu) {
                    userMenu.style.display = 'flex';
                    userMenu.classList.add('active');
                }
                
                updateUserInfo(data.user);
                
                // Load admin config if exists
                if (data.adminConfig) {
                    loadAdminConfig(data.adminConfig);
                }
            } else {
                document.body.classList.remove('logged-in');
                document.body.classList.add('logged-out');
                
                // Mostrar botones de auth
                const authButtons = document.getElementById('authButtons');
                const userMenu = document.getElementById('userMenu');
                
                if (authButtons) authButtons.style.display = 'flex';
                if (userMenu) {
                    userMenu.style.display = 'none';
                    userMenu.classList.remove('active');
                }
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
            // Asumir que no está logueado si hay error
            document.body.classList.remove('logged-in');
            document.body.classList.add('logged-out');
        });
}

// Update user info in navbar
function updateUserInfo(userData) {
    console.log('Updating user info:', userData); // 👈 Debug
    
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName && userData.username) {
        userName.textContent = userData.username;
    }
    
    if (userAvatar && userData.username) {
        userAvatar.textContent = userData.username.charAt(0).toUpperCase();
    }
    
    // Cargar notificaciones y mensajes
    if (typeof loadNotifications === 'function') {
        loadNotifications();
    }
    if (typeof loadMessages === 'function') {
        loadMessages();
    }
}





// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    fetch('php/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            rememberMe: rememberMe
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to index
            window.location.href = 'index.html';
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Handle Register
// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const passConfirm = document.getElementById('regPassConfirm').value;
    
    if (password !== passConfirm) {
        alert('❌ Las contraseñas no coinciden');
        return;
    }
    
    fetch('php/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // 👈 Importante para cookies de sesión
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            passwordConfirm: passConfirm
        })
    })
    .then(response => {
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            return response.json();
        } else {
            // Si no es JSON, hay un error de PHP
            return response.text().then(text => {
                throw new Error('Error del servidor: ' + text);
            });
        }
    })
    .then(data => {
        if (data.success) {
            // 👇 Forzar recarga completa para actualizar sesión
            window.location.href = 'index.html?logged=1';
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión: ' + error.message);
    });
}

// Logout
function logout() {
    fetch('php/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Load admin config
function loadAdminConfig(config) {
    const csTagInput = document.getElementById('csTag');
    const demoSelect = document.getElementById('demoRecording');
    const adminCsTagInput = document.getElementById('adminCsTag');
    const adminDemoSelect = document.getElementById('adminDemoRecord');
    
    if (csTagInput && config.cs_tag) {
        csTagInput.value = config.cs_tag;
    }
    if (demoSelect && config.demo_recording) {
        demoSelect.value = config.demo_recording;
    }
    if (adminCsTagInput && config.cs_tag) {
        adminCsTagInput.value = config.cs_tag;
    }
    if (adminDemoSelect && config.demo_recording) {
        adminDemoSelect.value = config.demo_recording;
    }
}

// Save admin settings
function saveAdminSettings() {
    const csTag = document.getElementById('csTag').value;
    const password = document.getElementById('adminPassword').value;
    const demoRecording = document.getElementById('demoRecording').value;
    
    if (!csTag) {
        alert('⚠️ Por favor ingresa un Tag CS');
        return;
    }
    
    fetch('php/save_admin_config.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            csTag: csTag,
            password: password,
            demoRecording: demoRecording
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Configuración guardada exitosamente');
            
            // Close admin panel
            const adminPanel = document.getElementById('adminDropdown');
            if (adminPanel) {
                adminPanel.classList.remove('active');
            }
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Toggle user menu dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
    
    // Close admin panel
    const adminPanel = document.getElementById('adminDropdown');
    if (adminPanel) {
        adminPanel.classList.remove('active');
    }
}

// Toggle admin panel dropdown
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminDropdown');
    if (adminPanel) {
        adminPanel.classList.toggle('active');
    }
    
    // Close user menu
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.remove('active');
    }
}

// Show notifications
function showNotifications() {
    alert('📬 Tienes 3 notificaciones nuevas:\n\n• Nuevo evento este fin de semana\n• Actualización en el servidor #01\n• Mensaje del staff');
}

// Show messages
function showMessages() {
    alert('✉️ Tienes 1 mensaje nuevo:\n\nDe: Admin\nAsunto: Bienvenido al servidor');
}

// Show profile
// Mostrar perfil
function showProfile() {
    window.location.href = 'profile.html';
}

// Mostrar configuración
function showSettings() {
    window.location.href = 'settings.html';
}
// Cargar mensajes
function loadMessages() {
    fetch('php/get_messages.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Actualizar badge
                const badge = document.getElementById('msgBadge');
                if (badge && data.unreadCount > 0) {
                    badge.textContent = data.unreadCount;
                    badge.style.display = 'inline';
                } else if (badge) {
                    badge.style.display = 'none';
                }
                
                // Guardar mensajes para mostrarlos
                window.messages = data.messages;
            }
        })
        .catch(error => console.error('Error loading messages:', error));
}

// Mostrar notificaciones
function showNotifications() {
    if (!window.notifications) {
        alert('🔔 No hay notificaciones');
        return;
    }
    
    if (window.notifications.length === 0) {
        alert('🔔 No hay notificaciones para mostrar');
        return;
    }
    
    let text = '🔔 NOTIFICACIONES\n\n';
    window.notifications.forEach((notif, index) => {
        const icon = {
            'success': '✅',
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌'
        }[notif.type] || '📬';
        
        text += `${icon} ${notif.title}\n${notif.message}\n\n`;
    });
    
    alert(text);
    
    // Marcar como leídas
    fetch('php/mark_notification_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}



function loadNotifications() {
    fetch('php/get_notifications.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Actualizar badge
                const badge = document.getElementById('notifBadge');
                if (badge && data.unreadCount > 0) {
                    badge.textContent = data.unreadCount;
                    badge.style.display = 'inline';
                } else if (badge) {
                    badge.style.display = 'none';
                }
                
                // Guardar notificaciones para mostrarlas
                window.notifications = data.notifications;
            }
        })
        .catch(error => console.error('Error loading notifications:', error));
}






// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const adminPanel = document.querySelector('.admin-panel');
    const userDropdown = document.querySelector('.dropdown');
    
    if (adminPanel && !event.target.closest('.admin-panel')) {
        const adminDropdown = document.getElementById('adminDropdown');
        if (adminDropdown) {
            adminDropdown.classList.remove('active');
        }
    }
    
    if (userDropdown && !event.target.closest('.dropdown')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});
