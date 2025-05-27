const CLIENT_ID = '1376180153654448180'; // Discord App Client ID
const REDIRECT_URI = 'https://fallaimanager.netlify.app/';
const API_URL = 'http://2.58.113.163:5001'; // Dein Backend

const SCOPE = 'identify guilds';
const DISCORD_API = 'https://discord.com/api';

// Access-Token aus der URL holen
function getAccessTokenFromUrl() {
  const hash = window.location.hash.replace('#', '');
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

// Discord Login starten
function loginWithDiscord() {
  const url = `${DISCORD_API}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;
  window.location.href = url;
}

// Logout
function logout() {
  window.location.hash = '';
  window.location.reload();
}

// Discord Userdaten holen
async function fetchUserData(token) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// Discord Guilds des Users holen
async function fetchUserGuilds(token) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// Bot-Guilds vom Backend holen (muss ein Array von IDs sein!)
async function fetchBotGuilds() {
  const res = await fetch(`${API_URL}/api/botguilds`);
  return res.json();
}

// Hauptfunktion
async function main(token) {
  const user = await fetchUserData(token);
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  document.getElementById('user-info').style.display = 'flex';

  document.getElementById('user-name').textContent = `${user.username}#${user.discriminator}`;
  document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  // Daten holen
  const userGuilds = await fetchUserGuilds(token);
  const botGuilds = await fetchBotGuilds();

  // Debugging-Ausgaben
  console.log("User Guilds:", userGuilds);
  console.log("Bot Guilds:", botGuilds);

  // Nur IDs vergleichen!
  const sharedGuilds = userGuilds.filter(g => botGuilds.includes(g.id));
  console.log("Shared Guilds:", sharedGuilds);

  const serversDiv = document.getElementById('servers');
  serversDiv.innerHTML = '';
  if (sharedGuilds.length === 0) {
    serversDiv.innerHTML = '<p>No mutual servers found.</p>';
    return;
  }

  sharedGuilds.forEach((g, i) => {
    // Icon-URL fallback
    const iconUrl = g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';
    const card = document.createElement('div');
    card.className = 'server-card';
    card.innerHTML = `
      <div class="server-info">
        <img class="server-icon" src="${iconUrl}" />
        <div class="server-name">${g.name}</div>
      </div>
      <button class="control-btn" onclick="openControl('${g.id}', '${g.name}')">Manage</button>
    `;
    serversDiv.appendChild(card);
  });
}

// Login-Button verbinden
document.getElementById('login-btn').onclick = loginWithDiscord;

// Wenn Token vorhanden, Dashboard anzeigen
const token = getAccessTokenFromUrl();
if (token) main(token);

// Dummy-Funktion für das Control-Panel
window.openControl = function(guildId, guildName) {
  alert(`Control panel for server: ${guildName} (${guildId})`);
}
