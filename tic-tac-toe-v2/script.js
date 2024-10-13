document.getElementById('host-game').addEventListener('click', hostGame);
document.getElementById('join-game').addEventListener('click', joinGame);

let peer, conn;
let isHost = false;
let currentPlayer = 'X';
let gameActive = false;

function hostGame() {
    isHost = true;
    peer = new Peer();
    peer.on('open', id => {
        console.log(`Host ID: ${id}`);
        document.getElementById('status-message').innerText = `Your ID: ${id}. Share this with your opponent.`;
    });
    peer.on('connection', connection => {
        conn = connection;
        conn.on('open', () => {
            console.log('Connection established as host');
            gameActive = true;
            startGame();
        });
        conn.on('data', handleMove);
    });
    peer.on('error', err => console.error('Peer error:', err));
}

function joinGame() {
    const peerId = prompt('Enter the host ID:');
    peer = new Peer();
    conn = peer.connect(peerId);
    conn.on('open', () => {
        console.log('Connection established as joiner');
        gameActive = true;
        startGame();
    });
    conn.on('data', handleMove);
    conn.on('error', err => console.error('Connection error:', err));
}

function startGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    createBoard();
    updateStatusMessage();
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => makeMove(i));
        board.appendChild(cell);
    }
}

function makeMove(index) {
    if (!gameActive || !conn || !conn.open) return;
    const cells = document.querySelectorAll('.cell');
    if (cells[index].innerText === '' && currentPlayer === (isHost ? 'X' : 'O')) {
        cells[index].innerText = currentPlayer;
        conn.send({ index, player: currentPlayer });
        checkWin();
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatusMessage();
    }
}

function handleMove(data) {
    const cells = document.querySelectorAll('.cell');
    if (cells[data.index].innerText === '') {
        cells[data.index].innerText = data.player;
        checkWin();
        currentPlayer = data.player === 'X' ? 'O' : 'X';
        updateStatusMessage();
    }
}

function updateStatusMessage() {
    const message = gameActive ? `Current Player: ${currentPlayer}` : 'Waiting for opponent...';
    document.getElementById('status-message').innerText = message;
}

function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (cells[a].innerText && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) {
            gameActive = false;
            document.getElementById('status-message').innerText = `Player ${cells[a].innerText} wins!`;
            return;
        }
    }

    if ([...cells].every(cell => cell.innerText !== '')) {
        gameActive = false;
        document.getElementById('status-message').innerText = 'It\'s a draw!';
    }
}