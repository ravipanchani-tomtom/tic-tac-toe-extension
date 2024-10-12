const peer = new Peer();
let conn;
let playerSymbol;
let isMyTurn = false;
const storageKey = "TIC_TAC_TOE_PEER_MAP";

let friendlyName;

peer.on('open', id => {
    friendlyName = generateFriendlyName();
    savePeerId(friendlyName, id);
    document.getElementById('friendly-name').innerText = friendlyName;
    updateStatus("Waiting for opponent...", "fas fa-spinner fa-pulse");
});

peer.on('connection', connection => {
    if (!conn) {
        conn = connection;
        playerSymbol = 'O';
        isMyTurn = false;
        updateStatus("Connected! Opponent's Turn", "fas fa-handshake");
        setupConnection();
    }
});

document.getElementById('new-game').addEventListener('click', () => {
    resetBoard();
    updateStatus("Waiting for opponent...", "fas fa-spinner fa-pulse");
    friendlyName = generateFriendlyName();
    savePeerId(friendlyName, peer.id);
    document.getElementById('friendly-name').innerText = friendlyName;
});

document.getElementById('connect').addEventListener('click', () => {
    const opponentName = document.getElementById('opponent-name').value;
    const peerId = retrievePeerId(opponentName);
    if (peerId) {
        conn = peer.connect(peerId);
        playerSymbol = 'X';
        isMyTurn = true;
        updateStatus("Connected! Your Turn", "fas fa-gamepad");
        setupConnection();
    } else {
        alert(`No peer found with friendly game ID: ${opponentName}`);
    }
});

const cells = document.querySelectorAll('.cell');

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.innerText === '' && isMyTurn) {
            cell.innerText = playerSymbol;
            sendMove(cell.dataset.index);
            if (checkWin()) {
                updateStatus("You Win!", "fas fa-trophy");
                isMyTurn = false;
            } else if (isBoardFull()) {
                updateStatus("It's a Draw!", "fas fa-handshake");
            } else {
                isMyTurn = false;
                updateStatus("Opponent's Turn", "fas fa-user-clock");
            }
        }
    });
});

function setupConnection() {
    conn.on('open', () => {
        console.log('Connected to peer');
        conn.on('data', handleIncomingData);
    });
}

function sendMove(index) {
    conn.send({ index, symbol: playerSymbol });
}

function handleIncomingData(data) {
    const cell = document.querySelector(`.cell[data-index="${data.index}"]`);
    cell.innerText = data.symbol;
    if (checkWin()) {
        updateStatus("You Lose!", "fas fa-sad-tear");
        isMyTurn = false;
    } else if (isBoardFull()) {
        updateStatus("It's a Draw!", "fas fa-handshake");
    } else {
        isMyTurn = true;
        updateStatus("Your Turn", "fas fa-gamepad");
    }
}

function resetBoard() {
    cells.forEach(cell => {
        cell.innerText = '';
    });
    document.getElementById('status').innerText = "Waiting for opponent...";
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return cells[a].innerText === playerSymbol &&
               cells[a].innerText === cells[b].innerText &&
               cells[a].innerText === cells[c].innerText;
    });
}

function isBoardFull() {
    return [...cells].every(cell => cell.innerText !== '');
}

// Helper function to generate a friendly name
function generateFriendlyName() {
    const adjectives = ["Amazing", "Brave", "Calm", "Delightful", "Eager", "Fancy", "Generous"];
    const nouns = ["Lion", "Tiger", "Bear", "Elephant", "Wombat", "Giraffe", "Panda"];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    // Combining adjective, noun, and a random number for more uniqueness
    return `${randomAdjective}${randomNoun}${Math.floor(1000 + Math.random() * 9000)}`;
}

// Save peer ID mapped to a friendly name to local storage
function savePeerId(friendlyName, peerId) {
    let peerMap = JSON.parse(localStorage.getItem(storageKey)) || {};
    peerMap[friendlyName] = peerId;
    localStorage.setItem(storageKey, JSON.stringify(peerMap));
}

// Retrieve peer ID using a friendly name from local storage
function retrievePeerId(friendlyName) {
    const peerMap = JSON.parse(localStorage.getItem(storageKey)) || {};
    return peerMap[friendlyName];
}

// Function to dynamically update status text and icon
function updateStatus(message, iconClass) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<i class="${iconClass}"></i> ${message}`;
}

