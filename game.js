let peer = new Peer();
let conn;
let currentPlayer = 'X';
let myTurn = false;
const statusDiv = document.getElementById('status');
const boardDiv = document.getElementById('board');
const newGameBtn = document.getElementById('newGameBtn');
const peerIdInput = document.getElementById('peerId');
const connectIdInput = document.getElementById('connectId');
const connectBtn = document.getElementById('connectBtn');
const hostBtn = document.getElementById('hostBtn');
const joinBtn = document.getElementById('joinBtn');
const gameUI = document.getElementById('gameUI');
const modeSelection = document.getElementById('modeSelection');

hostBtn.addEventListener('click', () => {
  peer.on('open', (id) => {
    peerIdInput.value = id;
    statusDiv.innerText = 'Share your Peer ID with your friend to start the game!';
    modeSelection.style.display = 'none';
    gameUI.style.display = 'block';
  });

  peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
    startGame('O');
    statusDiv.innerText = 'Connected! Waiting for the opponent to make a move...';
  });

  peer.on('disconnected', () => {
    statusDiv.innerText = 'Connection lost. Please refresh and try again.';
  });
});

joinBtn.addEventListener('click', () => {
  modeSelection.style.display = 'none';
  gameUI.style.display = 'block';
  statusDiv.innerText = 'Enter the Peer ID you wish to connect to:';
});

connectBtn.addEventListener('click', () => {
  const connectId = connectIdInput.value;
  if (connectId) {
    conn = peer.connect(connectId);

    conn.on('open', () => {
      setupConnection();
      startGame('X');
      statusDiv.innerText = 'Connected! Your turn to make a move.';
    });

    conn.on('error', (err) => {
      statusDiv.innerText = `Error: ${err}`;
    });

    conn.on('close', () => {
      statusDiv.innerText = 'Connection closed.';
    });
  }
});

function setupConnection() {
  conn.on('data', (data) => {
    console.log('Received data:', data);
    if (data.type === 'move') {
      handleMove(data.cell, data.player);
    } else if (data.type === 'reset') {
      resetBoard();
    }
  });

  conn.on('close', () => {
    statusDiv.innerText = 'Connection closed. Please refresh to start a new game.';
  });

  conn.on('error', (err) => {
    statusDiv.innerText = `Connection error: ${err}`;
  });
}

function startGame(player) {
  currentPlayer = player;
  myTurn = currentPlayer === 'X';
  console.log('Starting game as:', currentPlayer);
  statusDiv.innerText = myTurn ? 'Your turn!' : "Opponent's turn.";
}

boardDiv.addEventListener('click', (e) => {
  if (myTurn && e.target.classList.contains('cell') && !e.target.innerText) {
    const cell = e.target;
    console.log('Making move:', currentPlayer);
    makeMove(cell, currentPlayer);
    conn.send({ type: 'move', cell: cell.dataset.index, player: currentPlayer });
    myTurn = false;
    statusDiv.innerText = "Opponent's turn.";
  }
});

newGameBtn.addEventListener('click', () => {
  resetBoard();
  conn.send({ type: 'reset' });
  statusDiv.innerText = myTurn ? 'Your turn!' : "Opponent's turn.";
});

function handleMove(index, player) {
  console.log('Handling move for:', player, 'at index:', index);
  const cell = document.querySelector(`[data-index='${index}']`);
  makeMove(cell, player);
  myTurn = currentPlayer === 'X';
  statusDiv.innerText = myTurn ? 'Your turn!' : "Opponent's turn.";
  console.log('myTurn set to:', myTurn);
}

function makeMove(cell, player) {
    cell.innerText = player;
    cell.classList.add(player);
    if (checkWin(player)) {
      statusDiv.innerText = `${player} wins!`;
      myTurn = false;
    } else if (isDraw()) {
      statusDiv.innerText = "It's a draw!";
      myTurn = false;
    }
  }
  
  function checkWin(player) {
    const cellElements = Array.from(document.querySelectorAll('[data-cell]'));
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], 
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6]
    ];
  
    return winningCombinations.some(combination => {
      return combination.every(index => {
        return cellElements[index].classList.contains(player);
      });
    });
  }
  
  function isDraw() {
    return [...document.querySelectorAll('[data-cell]')].every(cell => {
      return cell.innerText === 'X' || cell.innerText === 'O';
    });
  }
  
  function resetBoard() {
    const cells = document.querySelectorAll('[data-cell]');
    cells.forEach(cell => {
      cell.innerText = '';
      cell.classList.remove('X', 'O');
    });
    myTurn = currentPlayer === 'X';
    statusDiv.innerText = myTurn ? 'Your turn!' : "Opponent's turn.";
    console.log('Board reset. myTurn set to:', myTurn);
  }
  
  // Set up the indices for the cells
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.dataset.index = index;
  });
  
  // Logging for debug
  console.log('Script initialized');
  