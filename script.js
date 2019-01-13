let playerX, playerO;

document.addEventListener("keypress", function (e) {
  let xName = document.querySelector('#p-name-x');
  let oName = document.querySelector('#p-name-o');

  if (e.key === 'Enter') {
    if (!/^\S+$/.test(xName.value) || !/^\S+$/.test(oName.value) || xName.value === oName.value) {
      return "";
    }
    playerX = Player(xName.value, "X");
    playerO = Player(oName.value, "O");

    document.querySelector('.main-container').classList.add('game-start');

    GameControll.playerXStart(Gameboard, playerX);

    document.querySelectorAll('.item').forEach((node, i) => {
      node.addEventListener('click', function () {
        if (Gameboard.addMark(i, GameControll.getTurn())) {

          GameControll.check(Gameboard, playerX, playerO);

          let nextPlayer = GameControll.getTurn() ? playerX : playerO;
          if (typeof nextPlayer.inhumanMove === "function") {
            Gameboard.addMark(nextPlayer.inhumanMove(Gameboard.getGrid(), GameControll), GameControll.getTurn());
            GameControll.check(Gameboard, playerX, playerO);
          }
        }
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
    if (grid[i] !== "") {
      return false;
    }
    grid[i] = isPlayerOne ? "X" : "O";
    render();
    return true;
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

  function clear() {
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
    clear,
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

  function check(board, pX, pO) {
    let winner;
    if (checkIfStrike(board.getGrid())) {
      winner = getTurn() ? pX : pO;
      window.setTimeout(function () {
        winner.win();
        board.clear();
      }, 1);

    } else if (board.checkIfAllAreMarked()) {
      winner = {};
      window.setTimeout(function () {
        alert('draw');
        board.clear();
      }, 1);
    }

    if (typeof winner !== "object") {
      switchTurn();
    } else {
      window.setTimeout(function () {
        isPlayerXturn = true;
        GameControll.playerXStart(board, pX);
      }, 2);
    }
  }

  function playerXStart(board, pX) {
    if (typeof pX.inhumanMove === "function") {
      board.addMark(pX.randomMove(board.getGrid()), getTurn());
      switchTurn();
    }
  }
  return {
    getTurn,
    switchTurn,
    check,
    playerXStart,
    checkIfStrike
  }
})();

const Player = (name, xo) => {
  let score = 0;
  let playerObj = {};

  document.querySelector(`#player-${xo}-info > .name`).textContent = name;

  playerObj.win = function () {
    alert(name + " win!");
    score++;
    document.querySelector(`#player-${xo}-info .score`).textContent = score;
  }

  playerObj.X = xo;
  if (name === "CPU") {

    let nextMove;
    //only if X is the first to start
    playerObj.randomMove = function (grid) {
      while (true) {
        let index = Math.floor(Math.random() * grid.length);
        if (grid[index] == "") {
          return index;
        }
      }
    }

    function determineMaximizingPlayer(numOfEmptySpace) {
      if (numOfEmptySpace % 2 == 0) {
        return "O";
      } else {
        return "X";
      }
    }

    function minimax(gameState, availableOpt, game) {

      if (availableOpt.length == 0 || game.checkIfStrike(gameState)) {
        if (!game.checkIfStrike(gameState)) {
          return 0;
        } else {
          if (determineMaximizingPlayer(availableOpt.length) !== xo) {
            return availableOpt.length + 1;
          } else {
            return availableOpt.length - 10;

          }
        }
      }

      let values = [];

      availableOpt.forEach(function (option, i, arr) {
        arr = arr.slice();
        arr.splice(i, 1);
        let newGameState = gameState.slice();
        newGameState[option] = determineMaximizingPlayer(availableOpt.length);
        values.push(minimax(newGameState, arr, game));
      })

      let idealValue;
      nextMoves = availableOpt[0];
      if(determineMaximizingPlayer(availableOpt.length) === xo) {
        idealValue = -Infinity;
        for(let i = 0; i < values.length; i++) {
          if(values[i] >= idealValue) {
            idealValue = values[i];
            nextMove = availableOpt[i];
          }
        }
      } else {
        idealValue = Infinity;
        for(let i = 0; i < values.length; i++) {
          if(values[i] <= idealValue) {
            idealValue = values[i];
            nextMove = availableOpt[i];
          }
        }
      }

      return idealValue;
    }

    playerObj.inhumanMove = function (grid, game) {
      let emptySquares = [];

      for (let i = 0; i < grid.length; i++) {
        if (grid[i] == "") {
          emptySquares.push(i);
        }
      }

      minimax(grid, emptySquares, game);
      console.log(nextMove);
      return nextMove;
    }
  }
  return playerObj;
}
