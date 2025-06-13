let players = JSON.parse(localStorage.getItem('players')) || [];
let teamsData = JSON.parse(localStorage.getItem('teams')) || [];

const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-names');
const generateBtn = document.getElementById('generate-teams');
const teamModal = document.getElementById('team-modal');
const teamCountInput = document.getElementById('team-count');
const confirmTeamsBtn = document.getElementById('confirm-teams');
const teamsOutput = document.getElementById('teams-output');
const rankingOutput = document.getElementById('ranking-output');

updatePlayersDisplay();
if (players.length >= 2) generateBtn.disabled = false;

playerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    localStorage.setItem('players', JSON.stringify(players));
    updatePlayersDisplay();
    playerNameInput.value = '';
  }
  if (players.length >= 2) generateBtn.disabled = false;
});

function updatePlayersDisplay() {
  playersList.textContent = players.join(' - ');
}

document.getElementById('undo-btn').addEventListener('click', () => {
    players.pop();
    localStorage.setItem('players', JSON.stringify(players));
    updatePlayersDisplay();
    generateBtn.disabled = players.length < 2;
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Supprimer tous les joueurs ?')) {
    players = [];
    localStorage.removeItem('players');
    updatePlayersDisplay();
    generateBtn.disabled = true;
  }
});

generateBtn.addEventListener('click', () => {
  teamModal.classList.remove('hidden');
});

confirmTeamsBtn.addEventListener('click', () => {
  const numTeams = parseInt(teamCountInput.value);
  if (!numTeams || numTeams < 2 || numTeams > players.length) {
    alert("Nombre d'équipes invalide.");
    return;
  }

  const shuffled = [...players].sort(() => 0.5 - Math.random());
  teamsData = Array.from({ length: numTeams }, () => ({ name: '', members: [], score: 0 }));

  shuffled.forEach((player, i) => {
    teamsData[i % numTeams].members.push(player);
    teamsData[i % numTeams].name = `Équipe ${i % numTeams + 1}`;
  });

  localStorage.setItem('teams', JSON.stringify(teamsData));
  saveTeamsToBackend();
  displayTeams();
  teamModal.classList.add('hidden');
  showView('teams-view');
});

function displayTeams() {
  teamsOutput.innerHTML = '';
  teamsData.forEach((team, index) => {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded shadow';

    div.innerHTML = `
      <h3 contenteditable="true" oninput="updateTeamName(${index}, this.textContent)"
          class="text-lg font-bold text-blue-700 mb-2 cursor-pointer">${team.name}</h3>
      <ul class="mb-2">${team.members.map(p => `<li>${p}</li>`).join('')}</ul>
      <div class="flex items-center space-x-2">
        <button onclick="changeScore(${index}, -1)" class="bg-red-500 text-white px-2 py-1 rounded">-</button>
        <input type="number" value="${team.score}" onchange="updateScore(${index}, this.value)"
               class="w-16 text-center border rounded"/>
        <button onclick="changeScore(${index}, 1)" class="bg-green-500 text-white px-2 py-1 rounded">+</button>
      </div>
    `;
    teamsOutput.appendChild(div);
  });
  updateRanking();
}

function updateTeamName(index, name) {
  teamsData[index].name = name;
  localStorage.setItem('teams', JSON.stringify(teamsData));
  saveTeamsToBackend();
  updateRanking();
}

function changeScore(index, delta) {
  teamsData[index].score += delta;
  localStorage.setItem('teams', JSON.stringify(teamsData));
  saveTeamsToBackend();
  displayTeams();
}

function updateScore(index, value) {
  teamsData[index].score = parseInt(value || 0);
  localStorage.setItem('teams', JSON.stringify(teamsData));
  saveTeamsToBackend();
  displayTeams();
}

function updateRanking() {
  const sorted = [...teamsData].sort((a, b) => b.score - a.score);
  rankingOutput.innerHTML = '';
    sorted.forEach((t, idx) => {
      const div = document.createElement('div');
      div.className = 'bg-white p-3 rounded shadow cursor-pointer';

      const header = document.createElement('div');
      header.className = 'flex justify-between items-center';
      header.innerHTML = `<strong>${t.name}</strong> <span>${t.score} pts</span>`;
      div.appendChild(header);

      const membersList = document.createElement('ul');
      membersList.className = 'mt-2 text-sm text-gray-600 hidden';
      membersList.innerHTML = t.members.map(m => `<li>${m}</li>`).join('');
      div.appendChild(membersList);

      div.addEventListener('click', () => {
        membersList.classList.toggle('hidden');
      });
      rankingOutput.appendChild(div);
    });
}

function showView(id) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (id === 'teams-view') displayTeams();
  if (id === 'ranking-view') updateRanking();
}

function saveTeamsToBackend() {
  fetch('backend/save.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teams: teamsData })
  });
}