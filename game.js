const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');

let grid = [];
let score = 0;

// Creates an empty 4x4 grid filled with zeros
function createEmptyGrid() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
}

// Finds all empty cells and randomly places a 2 or 4
function spawnTile() {
  const empty = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }

  if (empty.length === 0) return; // no empty cells, do nothing

  // Pick a random empty cell
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];

  // 90% chance of 2, 10% chance of 4
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// Reads the grid array and draws tiles on the board
function render() {
  boardEl.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const value = grid[r][c];
      const cell = document.createElement('div');
      cell.classList.add('cell');

      if (value !== 0) {
        cell.classList.add('tile');
        cell.setAttribute('data-value', value);
        cell.textContent = value;
      }

      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = score;
}

// Starts a fresh game
function startGame() {
  grid = createEmptyGrid();
  score = 0;
  spawnTile();
  spawnTile(); // start with 2 tiles
  render();
}

// Hook up the restart button
document.getElementById('restart-btn').addEventListener('click', startGame);

// Start the game on page load
startGame();

// ─── MOVE LOGIC ───────────────────────────────────────

// Slides and merges a single row to the left
// Example: [0, 2, 2, 4] → [4, 4, 0, 0]
function slideRow(row) {
  // Step 1: remove all zeros, keep only tiles
  let tiles = row.filter(v => v !== 0);

  // Step 2: merge adjacent equal tiles
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] === tiles[i + 1]) {
      tiles[i] *= 2;       // double the left tile
      score += tiles[i];   // add to score
      tiles[i + 1] = 0;    // remove the right tile
    }
  }

  // Step 3: remove zeros again after merging
  tiles = tiles.filter(v => v !== 0);

  // Step 4: pad with zeros on the right to make length 4
  while (tiles.length < 4) tiles.push(0);

  return tiles;
}

// Applies slideRow to every row (moves left)
function moveLeft() {
  for (let r = 0; r < 4; r++) {
    grid[r] = slideRow(grid[r]);
  }
}

// Rotates the entire grid 90 degrees clockwise
// This lets us reuse slideRow for all 4 directions
function rotateClockwise() {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newGrid[c][3 - r] = grid[r][c];
    }
  }
  grid = newGrid;
}

// Move right = rotate 180° → move left → rotate 180° back
function moveRight() {
  rotateClockwise();
  rotateClockwise();
  moveLeft();
  rotateClockwise();
  rotateClockwise();
}

// Move up = rotate 90° counter-clockwise → move left → rotate back
function moveUp() {
  rotateClockwise();
  rotateClockwise();
  rotateClockwise();
  moveLeft();
  rotateClockwise();
}

// Move down = rotate 90° clockwise → move left → rotate back
function moveDown() {
  rotateClockwise();
  moveLeft();
  rotateClockwise();
  rotateClockwise();
  rotateClockwise();
}

// ─── WIN / LOSE ───────────────────────────────────────

// Returns true if any cell has value 2048
function hasWon() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 2048) return true;
    }
  }
  return false;
}

// Returns true if no moves are possible
function hasLost() {
  // If any cell is empty, game is not over
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
    }
  }

  // If any two adjacent cells can merge, game is not over
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false; // check right
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false; // check below
    }
  }

  return true; // no moves left
}

// ─── KEYBOARD INPUT ───────────────────────────────────

document.addEventListener('keydown', (e) => {
  // Save a copy of the grid before moving
  const before = JSON.stringify(grid);

  if (e.key === 'ArrowLeft')  moveLeft();
  if (e.key === 'ArrowRight') moveRight();
  if (e.key === 'ArrowUp')    moveUp();
  if (e.key === 'ArrowDown')  moveDown();

  // Only spawn + render if something actually changed
  const after = JSON.stringify(grid);
  if (before === after) return;

  spawnTile();
  render();

  if (hasWon()) {
    setTimeout(() => alert('You win! 🎉'), 100);
  } else if (hasLost()) {
    setTimeout(() => alert('Game over!'), 100);
  }
});
