// Guardar configuración de admin
function saveAdminConfig() {
    const csTag = document.getElementById('adminCsTag').value;
    const password = document.getElementById('adminCsPass').value;
    const demoRecord = document.getElementById('adminDemoRecord').value;
    const authid = document.getElementById('adminSteamId') ? document.getElementById('adminSteamId').value : '';
    
    if (!csTag) {
        alert('⚠️ Por favor ingresa un Tag CS');
        return;
    }
    
    if (!authid) {
        alert('⚠️ Por favor ingresa tu SteamID');
        return;
    }
    
    fetch('php/save_admin_config.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            authid: authid,
            csTag: csTag,
            password: password,
            demoRecording: demoRecord
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ ' + data.message);
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Cargar configuración de admin
function loadAdminConfig(authid) {
    if (!authid) return;
    
    fetch('php/get_admin_config.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            authid: authid
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.config) {
            const csTagInput = document.getElementById('adminCsTag');
            const demoSelect = document.getElementById('adminDemoRecord');
            
            if (csTagInput && data.config.cs_tag) {
                csTagInput.value = data.config.cs_tag;
            }
            if (demoSelect && data.config.demo_recording) {
                demoSelect.value = data.config.demo_recording;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}