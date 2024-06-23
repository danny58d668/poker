let players = [];
let currentPlayerIndex = 0;
let prizePool = 0;
const initialChips = 1000;
const smallBlind = 20;
const bigBlind = 40;
let currentBet = bigBlind;
let currentRound = 0; // 0: Pre-Flop, 1: Flop, 2: Turn, 3: River

const rounds = ['Pre-Flop', 'Flop', 'Turn', 'River'];

function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);

    if (playerCount < 3) {
        alert("Minimum 3 players required.");
        return;
    }

    players = [];
    prizePool = 0;
    currentBet = bigBlind;
    currentRound = 0;
    for (let i = 1; i <= playerCount; i++) {
        players.push({ id: i, chips: initialChips, folded: false, currentBet: 0 });
    }

    document.getElementById('gameArea').classList.remove('hidden');
    document.getElementById('players').innerHTML = players.map(player => `
        <div class="player" id="player${player.id}">
            <h2>Player ${player.id}</h2>
            <div class="chip-count" id="chip-count-${player.id}">${player.chips}</div>
            <div class="player-actions" id="player-actions-${player.id}"></div>
        </div>
    `).join('');

    document.getElementById('prizePool').textContent = prizePool;
    document.getElementById('currentRound').textContent = rounds[currentRound];
    updatePlayerActions();
    highlightCurrentPlayer();
}

function updatePlayerActions() {
    players.forEach(player => {
        const playerActionsElement = document.getElementById(`player-actions-${player.id}`);
        playerActionsElement.innerHTML = `
            <button onclick="raiseBet(${player.id}, 10)">Raise +10</button>
            <button onclick="raiseBet(${player.id}, 50)">Raise +50</button>
            <button onclick="call(${player.id})">Call</button>
            <button onclick="check(${player.id})">Check</button>
            <button onclick="fold(${player.id})">Fold</button>
        `;
    });
    if (currentRound > 0) {
        // Remove "Place Blind Bets" button after the Pre-Flop round
        document.querySelector('button[onclick="placeBlindBets()"]').style.display = 'none';
    }
}

function placeBlindBets() {
    if (players.length < 3) {
        alert("Game not started yet.");
        return;
    }

    const smallBlindIndex = (currentPlayerIndex + 1) % players.length;
    const bigBlindIndex = (currentPlayerIndex + 2) % players.length;

    const smallBlindPlayer = players[smallBlindIndex];
    const bigBlindPlayer = players[bigBlindIndex];

    smallBlindPlayer.chips -= smallBlind;
    bigBlindPlayer.chips -= bigBlind;
    prizePool += (smallBlind + bigBlind);
    smallBlindPlayer.currentBet = smallBlind;
    bigBlindPlayer.currentBet = bigBlind;

    document.getElementById(`chip-count-${smallBlindPlayer.id}`).textContent = smallBlindPlayer.chips;
    document.getElementById(`chip-count-${bigBlindPlayer.id}`).textContent = bigBlindPlayer.chips;
    document.getElementById('prizePool').textContent = prizePool;

    currentPlayerIndex = (bigBlindIndex + 1) % players.length;
    highlightCurrentPlayer();
}

function nextRound() {
    currentRound = (currentRound + 1) % rounds.length;
    document.getElementById('currentRound').textContent = rounds[currentRound];
    document.getElementById('roundActions').innerHTML = `
        <button onclick="nextRound()">Next Round (${rounds[currentRound]})</button>
        <button onclick="resetGame()">Reset Game</button>
    `;
    updatePlayerActions();

    if (currentRound === 3) { // River round completed
        selectWinner();
    }
}

function raiseBet(playerId, amount) {
    const player = players.find(p => p.id === playerId);
    if (player && !player.folded) {
        const raiseAmount = amount + currentBet - player.currentBet;
        if (player.chips >= raiseAmount) {
            player.chips -= raiseAmount;
            prizePool += raiseAmount;
            currentBet += amount;
            player.currentBet = currentBet;
            document.getElementById(`chip-count-${player.id}`).textContent = player.chips;
            document.getElementById('prizePool').textContent = prizePool;
            nextPlayer();
        } else {
            alert("Not enough chips.");
        }
    }
}

function call(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player && !player.folded) {
        const callAmount = currentBet - player.currentBet;
        if (player.chips >= callAmount) {
            player.chips -= callAmount;
            prizePool += callAmount;
            player.currentBet = currentBet;
            document.getElementById(`chip-count-${player.id}`).textContent = player.chips;
            document.getElementById('prizePool').textContent = prizePool;
            nextPlayer();
        } else {
            alert("Not enough chips to call.");
        }
    }
}

function check(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player && !player.folded) {
        if (player.currentBet === currentBet) {
            nextPlayer();
        } else {
            alert("Cannot check, you must call or raise.");
        }
    }
}

function fold(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.folded = true;
        document.getElementById(`player${player.id}`).classList.add('folded');
        nextPlayer();
    }
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while (players[currentPlayerIndex].folded) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
    if (isRoundComplete()) {
        alert("Round Complete. Please proceed to the next round.");
    }
    highlightCurrentPlayer();
}

function isRoundComplete() {
    const activePlayers = players.filter(player => !player.folded);
    return activePlayers.every(player => player.currentBet === currentBet || player.chips === 0);
}

function highlightCurrentPlayer() {
    players.forEach(player => {
        const playerElement = document.getElementById(`player${player.id}`);
        if (player.id === players[currentPlayerIndex].id) {
            playerElement.classList.add('current-player');
        } else {
            playerElement.classList.remove('current-player');
        }
    });
}

function selectWinner() {
    const activePlayers = players.filter(player => !player.folded);
    const winner = activePlayers.reduce((prev, current) => (prev.chips > current.chips) ? prev : current);
    document.getElementById('winner').textContent = `Winner: Player ${winner.id} with ${winner.chips} chips!`;
    document.getElementById('winner').classList.remove('hidden');
}

function resetGame() {
    players = [];
    currentPlayerIndex = 0;
    prizePool = 0;
    currentBet = bigBlind;
    currentRound = 0;
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('players').innerHTML = '';
    document.getElementById('prizePool').textContent = prizePool;
    document.getElementById('winner').classList.add('hidden');
    document.getElementById('currentRound').textContent = rounds[currentRound];
}
