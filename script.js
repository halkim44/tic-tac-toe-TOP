let playerX, playerO;

document.addEventListener("keypress", function (e) {
  let xName = document.querySelector('#p-name-x');
  let oName = document.querySelector('#p-name-o');

  if (e.key === 'Enter') {
    if (!/^\S+$/.test(xName.value) || !/^\S+$/.test(oName.value)) {
      return "";
    }
    playerX = Player(xName.value, "X");
    playerO = Player(oName.value, "O");
    document.querySelector('.name-query-window').remove();

    if(!playerX.isHuman) {
      Gameboard.addMark(playerX.inhumanMove(Gameboard.getGrid()), GameControll.getTurn());
      GameControll.switchTurn();
    }

    document.querySelectorAll('.item').forEach((node, i) => {
      node.addEventListener('click', function () {
        Gameboard.addMark(i, GameControll.getTurn());
    
        if (GameControll.checkIfStrike(Gameboard.getGrid())) {
          GameControll.getTurn() ? playerX.win() : playerO.win();
          Gameboard.clearBoard();
    
        } else if (Gameboard.checkIfAllAreMarked()) {
          alert('draw');
          Gameboard.clearBoard();
        }
    
        GameControll.switchTurn();
      })
    })
  
  } else {
    setTimeout(function () {
      if (/^\S+$/.test(xName.value) && !/^\S+$/.test(oName.value)) {
        oName.value = "CPU";
      } else if (!/^\S+$/.test(xName.value) && /^\S+$/.test(oName.value)) {
        xName.value = "CPU";
      }
    }, 1);
  }
})

const Gameboard = (() => {
  let grid = [
    "", "", "",
    "", "", "",
    "", "", ""
  ];

  function addMark(i, isPlayerOne) {
    if (grid[i] == "") {
      grid[i] = isPlayerOne ? "X" : "O";
      render();
    }
  }

  function render() {
    grid.forEach((tile, i) => {
      if (tile == "") {
        document.querySelectorAll('.tiles')[i].classList.remove('circle');
        document.querySelectorAll('.tiles')[i].classList.remove('cross');
      } else {
        document.querySelectorAll('.tiles')[i].classList.add(tile == "X" ? 'cross' : 'circle');
      }
    })
  }

  function clearBoard() {
    grid = grid.map(function (el) {
      return el = "";
    });
    render();
  }

  function getGrid() {
    return grid.slice(0);
  }

  function checkIfAllAreMarked() {
    return grid.every(function (el) {
      return el !== "";
    })
  }

  return {
    addMark,
    clearBoard,
    getGrid,
    checkIfAllAreMarked
  }
})();

const GameControll = (() => {
  let isPlayerXturn = true;

  let possibilities = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  function switchTurn() {
    isPlayerXturn = !isPlayerXturn;
  }

  function getTurn() {
    return isPlayerXturn;
  }

  function checkIfStrike(grid) {
    return possibilities.some(function (el) {
      return grid[el[0]] !== "" &&
        (grid[el[0]] === grid[el[1]] &&
          grid[el[1]] === grid[el[2]]);
    })
  }

  return {
    getTurn,
    switchTurn,
    checkIfStrike
  }
})();

const Player = (name, xo) => {
  let score = 0;
  let playerObj = {};

    document.querySelector(`#player-${xo}-name`).textContent = name;

  playerObj.win = function () {
    alert(name + " win!");
    score++;
    document.querySelector(`#player-${xo}-score`).textContent = score;
  }
  playerObj.isHuman = true;
  if(name === "CPU") {
    playerObj.isHuman = false;
    playerObj.inhumanMove = function(grid) {
      let pos;

      do {
        pos = Math.floor(Math.random() * 9);
      } while(grid[pos] !== "");
      return pos;
    }
  }
  return playerObj;
}
