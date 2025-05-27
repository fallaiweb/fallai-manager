// ==== CONFIG ====
const CLIENT_ID = '1376180153654448180'; // <-- Deine Discord Client-ID!
const REDIRECT_URI = 'https://fallaimanager.netlify.app/'; // exakt wie im Discord Developer Portal!
const API_URL = 'http://2.58.113.163:5001'; // z.B. https://meinbotapi.onrender.com

// ==== OAUTH2 ====
const SCOPE = 'identify guilds';
const DISCORD_API = 'https://discord.com/api';

function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#access_token=MTM3NjE4MDE1MzY1NDQ0ODE4MA.GLo8EP.DOdjj79wgZwPfxHO3oDIS0OlZqFuXJi_swhi4M')) {
    const params = new URLSearchParams(hash.substr(1));
    return params.get('access_token');
  }
  return null;
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

async function fetchUser(token) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// ==== UI ====
document.getElementById('login-btn').onclick = loginWithDiscord;

const token = getAccessTokenFromUrl();
if (token) {
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  main(token);
}

async function main(token) {
  // Lade User-Info
  const user = await fetchUser(token);

  // Lade Guilds
  let guilds = await fetchUserGuilds(token);

  // Lade Bot-Guilds von deiner API (dein Bot muss eine Route bereitstellen, z.B. /api/botguilds)
  const botGuildsRes = await fetch(`${API_URL}/api/botguilds`);
  const botGuilds = await botGuildsRes.json();

  // Filtere: Nur gemeinsame Guilds, wo der User Admin ist
  const adminGuilds = guilds.filter(g =>
    (parseInt(g.permissions) & 0x8) &&
    botGuilds.includes(g.id)
  );

  // Zeige Serverliste
  const serversDiv = document.getElementById('servers');
  serversDiv.innerHTML = '';
  adminGuilds.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'server-card';
    card.style.animationDelay = (i * 0.1) + 's';

    card.innerHTML = `
      <div class="server-info">
        <img class="server-icon" src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <span class="server-name">${g.name}</span>
      </div>
      <button class="control-btn" onclick="openControl('${g.id}', '${g.name}')">Steuern</button>
    `;
    serversDiv.appendChild(card);
  });
}

// ==== Server-Steuerung (Modal) ====
window.openControl = function(guildId, guildName) {
  document.getElementById('modal-server-name').innerText = `Steuerung für ${guildName}`;
  document.getElementById('kick-user-id').value = '';
  document.getElementById('kick-reason').value = '';
  document.getElementById('kick-result').innerText = '';
  document.getElementById('server-control-modal').style.display = 'flex';

  document.getElementById('kick-form').onsubmit = function(e) {
    e.preventDefault();
    const userId = document.getElementById('kick-user-id').value;
    const reason = document.getElementById('kick-reason').value;
    fetch(`${API_URL}/api/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guild_id: guildId, user_id: userId, reason })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        document.getElementById('kick-result').innerText = 'User wurde gekickt!';
      } else {
        document.getElementById('kick-result').innerText = 'Fehler: ' + (data.msg || 'Unbekannter Fehler');
      }
    });
  };
};

document.getElementById('close-modal').onclick = function() {
  document.getElementById('server-control-modal').style.display = 'none';
};
window.onclick = function(event) {
  if (event.target == document.getElementById('server-control-modal')) {
    document.getElementById('server-control-modal').style.display = 'none';
  }
};
