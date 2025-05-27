const CLIENT_ID = '1376180153654448180'; // Replace with your Discord Client ID
const REDIRECT_URI = 'https://fallaimanager.netlify.app/'; // Make sure it matches Discord Developer Portal
const API_URL = 'http://2.58.113.163:5001'; // Your backend API

const DISCORD_API = 'https://discord.com/api';
const SCOPE = 'identify guilds';

function getAccessTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

function loginWithDiscord() {
  const authUrl = `${DISCORD_API}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;
  window.location.href = authUrl;
}

function logout() {
  window.location.hash = '';
  window.location.reload();
}

async function fetchUserGuilds(token) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("User Guilds:", data);
  return data;
}

async function fetchBotGuilds() {
  const res = await fetch(`${API_URL}/api/botguilds`);
  const data = await res.json();
  console.log("Bot Guilds:", data);
  return data;
}

function showSharedGuilds(guilds, botGuilds) {
  const sharedGuilds = guilds.filter(g => botGuilds.includes(g.id));
  const container = document.getElementById('servers');
  container.innerHTML = '';

  if (sharedGuilds.length === 0) {
    container.innerHTML = '<p>No shared servers found.</p>';
    return;
  }

  sharedGuilds.forEach(guild => {
    const card = document.createElement('div');
    card.className = 'server-card';
    card.innerHTML = `
      <div class="server-info">
        <img class="server-icon" src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" 
             onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <span class="server-name">${guild.name}</span>
      </div>
      <button class="control-btn" onclick="openControl('${guild.id}', '${guild.name}')">Manage</button>
    `;
    container.appendChild(card);
  });
}

window.openControl = function(guildId, guildName) {
  alert(`Control panel for "${guildName}" coming soon.`);
}

document.getElementById('login-btn').addEventListener('click', loginWithDiscord);

const token = getAccessTokenFromUrl();

if (token) {
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  (async () => {
    try {
      const userGuilds = await fetchUserGuilds(token);
      const botGuilds = await fetchBotGuilds();
      showSharedGuilds(userGuilds, botGuilds);
    } catch (err) {
      console.error('Failed to fetch guilds:', err);
    }
  })();
}
