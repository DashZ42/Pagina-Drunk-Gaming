// ========================================
// MAIN FUNCTIONALITY
// ========================================

// Server data
const servers = [
    {
        id: 1,
        name: '#01 ZOMBIE ESCAPE',
        mod: 'Zombie Escape',
        ip: '23.26.135.150:27050',
        description: 'Modo de juego donde los humanos deberán escapar de los zombies usando armas especiales y pasando las dificultades de cada mapa.',
        players: '0/32'
    },
    {
        id: 2,
        name: '#02 SURF TIER 1-6',
        mod: 'Surf',
        ip: '23.26.135.150:27051',
        description: 'Servidor de Surf con mapas de todos los niveles. Mejora tu técnica de movimiento y compite contra otros jugadores.',
        players: '12/32'
    },
    {
        id: 3,
        name: '#03 KREEZ RACING',
        mod: 'Kreedz',
        ip: '23.26.135.150:27052',
        description: 'Servidor de Kreedz con bloques desafiantes. Pon a prueba tus habilidades de salto y precisión.',
        players: '5/32'
    },
    {
        id: 4,
        name: '#04 GUN GAME',
        mod: 'GunGame',
        ip: '23.26.135.150:27053',
        description: 'Modo rápido y divertido donde avanzas de arma en arma con cada eliminación.',
        players: '8/32'
    }
];

// Load servers
function loadServers() {
    const serversGrid = document.getElementById('serversGrid');
    if (!serversGrid) return;
    
    serversGrid.innerHTML = servers.map(server => `
        <div class="server-card">
            <div class="server-image">
                <span>${server.name}</span>
            </div>
            <div class="server-info">
                <h3 class="server-title">${server.name}</h3>
                <p class="server-description">${server.description}</p>
                <div class="server-ip">🌐 DIRECCIÓN IP: ${server.ip}</div>
                <div class="server-actions">
                    <button class="btn-join" onclick="joinServer('${server.ip}')">🎮 Jugar al servidor</button>
                    <button class="btn-bans" onclick="showBans('${server.id}')">📋 Lista de Baneos</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Join server
function joinServer(ip) {
    // In a real app, this would use steam:// protocol
    alert(`🎮 Conectando al servidor: ${ip}\n\nEn un navegador real, esto abriría Counter-Strike automáticamente.`);
    // window.location.href = `steam://connect/${ip}`;
}

// Show bans
function showBans(serverId) {
    alert(`📋 Lista de baneos del servidor #${serverId}\n\nEsta funcionalidad se conectaría a tu base de datos de baneos.`);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadServers();
    
    // Load saved admin config if exists
    const adminConfig = localStorage.getItem('dg_admin_config');
    if (adminConfig) {
        const config = JSON.parse(adminConfig);
        const csTagInput = document.getElementById('csTag');
        const demoSelect = document.getElementById('demoRecording');
        
        if (csTagInput && config.csTag) {
            csTagInput.value = config.csTag;
        }
        if (demoSelect && config.demoRecording) {
            demoSelect.value = config.demoRecording;
        }
    }
});