document.addEventListener('DOMContentLoaded', () => {
    const peer = new Peer(); // Use a public PeerJS server or your own
    let conn;
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let isMyTurn = false;

    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const startGameButton = document.getElementById('startGame');
    const joinGameButton = document.getElementById('joinGame');
    const resetGameButton = document.getElementById('resetGame');
    const connectionIdInput = document.getElementById('connectionId');

    function initializeBoard() {
        boardElement.innerHTML = '';
        board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.addEventListener('click', () => makeMove(index));
            boardElement.appendChild(cellElement);
        });
    }

    function makeMove(index) {
        if (board[index] || !isMyTurn) return;
        board[index] = currentPlayer;
        updateBoard();
        checkGameStatus();
        isMyTurn = false;
        conn.send({ board, currentPlayer });
    }

    function updateBoard() {
        board.forEach((cell, index) => {
            boardElement.children[index].textContent = cell;
        });
    }

    function checkGameStatus() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const [a, b, c] of winningCombinations) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                statusElement.textContent = `Player ${board[a]} wins!`;
                return;
            }
        }

        if (board.every(cell => cell)) {
            statusElement.textContent = 'Draw!';
        } else {
            statusElement.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function resetGame() {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        isMyTurn = currentPlayer === 'X'; // Set the initial turn
        updateBoard();
        statusElement.textContent = `Player ${currentPlayer}'s turn`;
        if (conn) {
            conn.send({ board, currentPlayer, reset: true });
        }
    }

    startGameButton.addEventListener('click', () => {
        const id = peer.id;
        statusElement.textContent = `Your ID: ${id}`;
        isMyTurn = true;
        currentPlayer = 'X';
    });

    joinGameButton.addEventListener('click', () => {
        const id = connectionIdInput.value;
        conn = peer.connect(id);
        conn.on('open', () => {
            statusElement.textContent = 'Connected!';
            isMyTurn = false;
            currentPlayer = 'O';
            conn.on('data', (data) => {
                if (data.reset) {
                    board = data.board;
                    currentPlayer = data.currentPlayer;
                    updateBoard();
                    statusElement.textContent = `Player ${currentPlayer}'s turn`;
                    isMyTurn = currentPlayer === 'O';
                } else {
                    board = data.board;
                    currentPlayer = data.currentPlayer === 'X' ? 'O' : 'X';
                    updateBoard();
                    checkGameStatus();
                    isMyTurn = true;
                }
            });
        });
    });

    peer.on('connection', (connection) => {
        conn = connection;
        conn.on('data', (data) => {
            if (data.reset) {
                board = data.board;
                currentPlayer = data.currentPlayer;
                updateBoard();
                statusElement.textContent = `Player ${currentPlayer}'s turn`;
                isMyTurn = currentPlayer === 'O';
            } else {
                board = data.board;
                currentPlayer = data.currentPlayer === 'X' ? 'O' : 'X';
                updateBoard();
                checkGameStatus();
                isMyTurn = true;
            }
        });
    });

    resetGameButton.addEventListener('click', resetGame);

    initializeBoard();
});