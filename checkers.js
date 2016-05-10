var myGamePieces = [];
var gameBoard = [];
var boardSize = 8;
var pieceSize = 20;
var scale = 1;
var pieceIndex = -1;
var turn = "red";
var over = false;

function startGame() {
  var size = 8;
  for (i = 0; i < boardSize; i++) {
    for (j = 0; j < boardSize; j++) {
      if ((i % 2 == 0 && j % 2 != 0) || (i % 2 != 0 && j % 2 == 0)) {
        gameBoard.push(new component(pieceSize, pieceSize, "grey", i * pieceSize, j * pieceSize));
      } else {
        gameBoard.push(new component(pieceSize, pieceSize, "white", i * pieceSize, j * pieceSize));
      }
    }
  }

  for (i = 0; i < boardSize; i++) {
    for (j = 0; j < boardSize; j++) {
      if ((i % 2 == 0 && j % 2 != 0) || (i % 2 != 0 && j % 2 == 0)) {
        if (j < 3) {
          myGamePieces.push(new component(pieceSize, pieceSize, "red", i * pieceSize, j * pieceSize));
        } else if (j > 4) {
          myGamePieces.push(new component(pieceSize, pieceSize, "black", i * pieceSize, j * pieceSize));
        }
      }
    }
  }
  myGameArea.start();
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function() {
    this.canvas.width = 480;
    this.canvas.height = 270;

    this.canvas.addEventListener("mousedown", mousedown);

    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, pieceSize);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function select_piece(mouseX, mouseY) {
  var selected_index = -1;
  var mlength = myGamePieces.length;
  for (i = 0; i < mlength; i++) {
    var d = myGamePieces[i];
    if (d.x < mouseX && d.width + d.x > mouseX && d.y < mouseY && d.height + d.y > mouseY && d.color == turn) {
      selected_index = i;
      d.highlight = true;
    } else {
      d.highlight = false;
    }
  }

  return selected_index;
}

function mousedown(e) {
  //alert("here!");
  mouseX = e.layerX; //- myGameArea.canvas.offsetLeft;
  mouseY = e.layerY; //- myGameArea.canvas.offsetTop;
  //alert(mouseX);
  var mlength = myGamePieces.length;
  var valMoves;

  if (pieceIndex == -1) {
    pieceIndex = select_piece(mouseX, mouseY);
    highlight_valid_moves(find_all_valid_moves(myGamePieces[pieceIndex]));
  } else {
    valid = false;
    myX = Math.floor((mouseX / pieceSize)) * pieceSize;
    myY = Math.floor((mouseY / pieceSize)) * pieceSize;
    valMoves = find_all_valid_moves(myGamePieces[pieceIndex]);
    var valcount = valMoves.length;
    for (i = 0; i < valcount; i++) {
      if (myY == valMoves[i].y && myX == valMoves[i].x) {
        valid = true;
      }
    }
    if (valid) {
    //first we need to remove any pieces that are being jumped
    //find if we are jumping a piece
    	var direction = 1;
      if (turn == "black") {
        direction *= -1; // black goes the opposite way
      }
    	jx = myX + ((myGamePieces[pieceIndex].x - myX) / 2);// * direction);
      jy = myY + ((myGamePieces[pieceIndex].y - myY) / 2);// * direction);
      //alert('('+ myX + ', ' + myY + ') (' + myGamePieces[pieceIndex].x + ', ' + myGamePieces[pieceIndex].y + ') (' + jx + ', ' + jy + ')');
      
      
      myGamePieces[pieceIndex].x = myX;
      myGamePieces[pieceIndex].y = myY;
      
      pieceIndex = -1;

      if (turn == "red") {
        turn = "black";
      } else {
        turn = "red";
      }

      for (i = 0; i < mlength; i++) {
        myGamePieces[i].highlight = false;
      }
      reset_board();
      
      deletePiece(jx, jy);
    } else {
      // are they trying to select another piece?
      pieceIndex = select_piece(mouseX, mouseY);
      highlight_valid_moves(find_all_valid_moves(myGamePieces[pieceIndex]));
    }

  } /**/
}

function point(x, y) {
  this.x = x;
  this.y = y;
}

function reset_board() {
  var boardCount = gameBoard.length;
  //	clear the board
  for (j = 0; j < boardCount; j++) {
    if (gameBoard[j].color == "green") {
      gameBoard[j].color = "grey";
    }
  }
}

function find_all_valid_moves(gamePiece) {
  var direction = 1;
  var validMoves = [];
  var jumpMoves = [];
  if (gamePiece.color == "black") {
    direction *= -1; // black goes the opposite way
  }

  //	all pieces, have two valid moves, by default
  validMoves.push(new point(gamePiece.x + direction * pieceSize * scale, gamePiece.y + direction * pieceSize * scale));
  validMoves.push(new point(gamePiece.x - direction * pieceSize * scale, gamePiece.y + direction * pieceSize * scale));

  var pieceCount = myGamePieces.length;
  var moveCount = validMoves.length;
  var boardCount = gameBoard.length;

  reset_board();

  var del = [];

  // remove the non valid moves and add in jumps
  for (i = 0; i < pieceCount; i++) {
    for (j = 0; j < moveCount; j++) {
      p = myGamePieces[i];
      m = validMoves[j];
      //is there a piece in the way?
      if (p.y == m.y && p.x == m.x) {
        del.push(j); // mark for delete
        // is it an unfriendly piece?
        if (p.color != gamePiece.color) {
          // check to see if we can jump it
          open = getPiece(p.x + (p.x - gamePiece.x), p.y + (p.y - gamePiece.y));
          if (open == null) {
            jumpMoves.push(new point(p.x + (p.x - gamePiece.x), p.y + (p.y - gamePiece.y)));
          }
        }
      }
    }
  }

  p = 0;
  m = 0;

  // if there are jumps they are the only valid move
  if (jumpMoves.length > 0) {
    validMoves = jumpMoves; 
  }
  else {
    for (j = 0; j < del.length; j++) {
      validMoves.splice(del[j], 1); // remove that invalid move
    }  
  }

  return validMoves;
}

function getPiece(x, y) {
	var returnPiece = null;
  var pieceCount = myGamePieces.length;
	for (k=0;k<pieceCount;k++) {
  	if (myGamePieces[k].x == x && myGamePieces[k].y == y) {
    	returnPiece = myGamePieces[k];
    }
  }
  return returnPiece;
}

function deletePiece(x, y) {
	var returnPiece = null;
  var pieceCount = myGamePieces.length;
	for (k=0;k<pieceCount;k++) {
  	if (myGamePieces[k].x == x && myGamePieces[k].y == y) {
    	myGamePieces.splice(k, 1);
    }
  }
}

function highlight_valid_moves(validMoves) {
  var moveCount = validMoves.length;
  var boardCount = gameBoard.length;

  //highlight moves
  for (i = 0; i < moveCount; i++) {
    for (j = 0; j < boardCount; j++) {
      if (gameBoard[j].x == validMoves[i].x && gameBoard[j].y == validMoves[i].y) {
        gameBoard[j].color = "green";
      }
    }
  }
  updateGameArea();
}

function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.color = color;
  this.highlight = false;
  this.update = function() {
    ctx = myGameArea.context;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.highlight) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function updateGameArea() {
  myGameArea.clear();
  var mlength = gameBoard.length;
  for (i = 0; i < mlength; i++) {
    gameBoard[i].update();
  }

  var mlength = myGamePieces.length;
  for (i = 0; i < mlength; i++) {
    myGamePieces[i].update();
  }
  
  if (!over) {
    var won = check_for_win();
    if (won != '') {
      alert('Congratulations ' + won + '! You won!');
      over = true;
    }
  }
}

function check_for_win() {
	var pieces = myGamePieces.length;
  var reds = 0;  
  var blacks = 0;
  for (i=0;i<pieces;i++) {
  	if (myGamePieces[i].color == 'red') {
    	reds++;
    }
    else {
    	blacks++;
    }
  }
  var winner = '';
  if (reds == 0) {
  	winner = 'black';
  }
  else if (blacks == 0) {
  	winner = 'red';
  }
  return winner;
}

startGame();
