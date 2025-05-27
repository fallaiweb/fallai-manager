const CLIENT_ID = '1376180153654448180'; // Deine Discord Client-ID
const REDIRECT_URI = 'https://fallaimanager.netlify.app/'; // exakt wie im Discord Developer Portal!
const API_URL = 'http://2.58.113.163:5001'; // Deine Backend-API

const SCOPE = 'identify guilds';
const DISCORD_API = 'https://discord.com/api';

function getAccessTokenFromUrl() {
  // Suche nach access_token in der Hash-URL, egal an welcher Stelle!
  const hash = window.location.hash.replace('#', '');
  const params = new URLSearchParams(hash.replace(/&/g, '&'));
  return params.get('access_token');
}

function loginWithDiscord() {
  const url = `${DISCORD_API}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;
  window.location.href = url;
}

function logout() {
  window.location.hash = '';
  window.location.reload();
}

async function fetchUserGuilds(token) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

document.getElementById('login-btn').onclick = loginWithDiscord;

const token = getAccessTokenFromUrl();

if (token) {
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  main(token);
}

async function main(token) {
  let guilds = await fetchUserGuilds(token);

  // Lade alle Guilds des Bots von deiner API
  const botGuildsRes = await fetch(`${API_URL}/api/botguilds`);
  const botGuilds = await botGuildsRes.json();

  // Nur gemeinsame Guilds (egal ob Admin)
  const sharedGuilds = guilds.filter(g => botGuilds.includes(g.id));

  const serversDiv = document.getElementById('servers');
  serversDiv.innerHTML = '';
  if (sharedGuilds.length === 0) {
    serversDiv.innerHTML = '<p>Kein gemeinsamer Server gefunden!</p>';
  }
  sharedGuilds.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'server-card';
    card.style.animationDelay = (i * 0.1) + 's';

    card.innerHTML = `
      <div class="server-info">
        <img class="server-icon" src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png" 
          onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <span class="server-name">${g.name}</span>
      </div>
      <button class="control-btn" onclick="openControl('${g.id}', '${g.name}')">Steuern</button>
    `;
    serversDiv.appendChild(card);
  });
}

// Beispiel für Steuerung (hier nur ein Alert)
window.openControl = function(guildId, guildName) {
  alert(`Hier kannst du den Bot auf dem Server "${guildName}" steuern!`);
};
