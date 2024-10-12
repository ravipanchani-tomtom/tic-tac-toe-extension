const peer = new Peer();
let conn;
let playerSymbol;
let isMyTurn = false;

peer.on('open', id => {
    document.getElementById('peer-id').innerText = id;
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
    document.getElementById('peer-id').innerText = peer.id;
});

document.getElementById('connect').addEventListener('click', () => {
    const opponentId = document.getElementById('opponent-id').value;
    conn = peer.connect(opponentId);
    playerSymbol = 'X';
    isMyTurn = true;
    updateStatus("Connected! Your Turn", "fas fa-gamepad");
    setupConnection();
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

// Function to dynamically update status text and icon
function updateStatus(message, iconClass) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<i class="${iconClass}"></i> ${message}`;
}
