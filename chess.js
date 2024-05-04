/*
CODE:
0-7: white Pawns
8:   white Bishop 1
9:   white Bishop 2
10:  white Knight 1
11:  white Knight 2
12:  white Rook 1
13:  white Rook 2
14:  white Queen
15:  white King

16-23: black Pawns
24:    black Bishop 1
25:    black Bishop 2
26:    black Knight 1
27:    black Knight 2
28:    black Rook 1
29:    black Rook 2
30:    black Queen
31:    black King
*/

// Âm thanh đặt quân cờ
var movingSound1 = document.getElementById("movingSound1");
var movingSound2 = document.getElementById("movingSound2");

// Mã màu cờ, đồng thời thể hiện hướng mà quân tốt sẽ đi (quân trắng tiến về phía số lớn hơn, quân đen ngược lại)
var white = 1;
var black = -1;

function alphabet(i) {
	return String.fromCharCode(97+i);
}
function number(c) {
	return c.charCodeAt(0) - 97;
}

function drawBoard() {
	var table = "";
	var _class = "";

	table += "<tr><td class='cornerCell'/>";
	for (let i = 0; i < 8; i++)
		table += "<td class = alphabetCell>"+alphabet(i)+"</td>";
	table += "<td class='cornerCell'/></tr>";

	for (let i = 1; i < 9; i++) {
		table += "<tr><td class = numberCell>"+(9-i)+"</td>";
		for (let j = 0; j < 8; j++) {
			if ((i + j) % 2)
				_class = "'light-cell'";
			else
				_class = "'dark-cell'";
			table += "<td id='"+alphabet(j)+(9-i)+"' class="+_class+"></td>";
		}
		table += "<td class = numberCell>"+(9-i)+"</td></tr>";
	}

	table += "<tr><td class='cornerCell'/>";
	for (let i = 0; i < 8; i++)
		table += "<td class = alphabetCell>"+alphabet(i)+"</td>";
	table += "<td class='cornerCell'/></tr>";

	var gameBoard = document.getElementById("gameBoard");
	gameBoard.innerHTML = table;
}

function highlight(piece, highlightIt = true) {
	if (highlightIt) {
		for (let validMove of piece.validMoves) {
			let cell = document.getElementById(validMove);
			if (cell.classList.contains("light-cell"))
				cell.classList.add("light-highlightCell");
			else
				cell.classList.add("dark-highlightCell");
		}
	}
	else {
		for (let validMove of piece.validMoves) {
			let cell = document.getElementById(validMove);
			cell.classList.remove("light-highlightCell");
			cell.classList.remove("dark-highlightCell");
		}
	}
}

function noValidMoves(pieces, color) {
	let range = [0, 16];
	if (color === black)
		range = [16, 32];
	for (let i = range[0]; i < range[1]; i++)
		if (pieces[i].alive && pieces[i].validMoves.length > 0)
			return false;
	return true;

}

function init() {
	var board = {};
	var pieces = []; // 0-15: white pieces; 16-31: black pieces
	var turn = white;
	var picked = "\0";

	// Hai biến bên dưới dùng để đánh dấu nước đi vừa được đi (bằng cách in đậm hai ô trên bàn cờ)
	var chosenCell1 = null;
	var chosenCell2 = null;

	drawBoard();

	function click(pos) {
		if (picked === "\0") {
			if (board[pos] !== -1 && pieces[board[pos]].color === turn) {
				picked = pos;
				highlight(pieces[board[picked]]);

				if (chosenCell1 !== null && chosenCell2 !== null) {
					chosenCell1.classList.remove("AImove-lightCell");
					chosenCell1.classList.remove("AImove-darkCell");
					chosenCell2.classList.remove("AImove-lightCell");
					chosenCell2.classList.remove("AImove-darkCell");
				}

				chosenCell1 = document.getElementById(picked);
				if (chosenCell1.classList.contains("light-cell"))
					chosenCell1.classList.add("AImove-lightCell");
				else
					chosenCell1.classList.add("AImove-darkCell");
			}
		}
		else if (pos === picked) {
			highlight(pieces[board[picked]], false);
			picked = "\0";

			chosenCell1.classList.remove("AImove-lightCell");
			chosenCell1.classList.remove("AImove-darkCell");
		}
		else if (board[pos] !== -1 && pieces[board[pos]].color === pieces[board[picked]].color) {
			highlight(pieces[board[picked]], false);
			highlight(pieces[board[pos]]);
			picked = pos;

			chosenCell1.classList.remove("AImove-lightCell");
			chosenCell1.classList.remove("AImove-darkCell");
			chosenCell1 = document.getElementById(picked);
			if (chosenCell1.classList.contains("light-cell"))
				chosenCell1.classList.add("AImove-lightCell");
			else
				chosenCell1.classList.add("AImove-darkCell");
		}
		else if (pieces[board[picked]].validMoves.includes(pos)) {
			if (turn === white)
				movingSound1.play();
			else
				movingSound2.play();
			highlight(pieces[board[picked]], false);
			move(picked, pos);
			update(board, pieces, turn);
			turn = -turn;
			picked = "\0";

			chosenCell2 = document.getElementById(pos);
			if (chosenCell2.classList.contains("light-cell"))
				chosenCell2.classList.add("AImove-lightCell");
			else
				chosenCell2.classList.add("AImove-darkCell");
		}
		else {
			highlight(pieces[board[picked]], false);
			picked = "\0";

			chosenCell1.classList.remove("AImove-lightCell");
			chosenCell1.classList.remove("AImove-darkCell");
		}
	}

	function move(pos1, pos2) {
		pieces[board[pos1]].moveOnDisplay(pos2);
		pieces[board[pos1]].moveTo(board, pieces, pos2);
	}

	function setUpGame() {
		// Tạo bàn cờ trống
		for (let i = 0; i < 8; i++)
			for (let j = 1; j < 9; j++)
				board[alphabet(i)+j] = -1;

		// Khởi tạo quân cờ
		for (let i = 0; i < 8; i++) {
			pieces[i] = new Pawn(board, white, alphabet(i)+"2", i, [alphabet(i)+"4", alphabet(i)+"3"]);
			pieces[i+16] = new Pawn(board, black, alphabet(i)+"7", i+16, [alphabet(i)+"5", alphabet(i)+"6"]);
		}

		pieces[8] = new Bishop(board, white, "c1", 8);
		pieces[9] = new Bishop(board, white, "f1", 9);
		pieces[24] = new Bishop(board, black, "c8", 24);
		pieces[25] = new Bishop(board, black, "f8", 25);

		pieces[10] = new Knight(board, white, "b1", 10, ["a3", "c3"]);
		pieces[11] = new Knight(board, white, "g1", 11, ["f3", "h3"]);
		pieces[26] = new Knight(board, black, "b8", 26, ["a6", "c6"]);
		pieces[27] = new Knight(board, black, "g8", 27, ["f6", "h6"]);

		pieces[12] = new Rook(board, white, "a1", 12);
		pieces[13] = new Rook(board, white, "h1", 13);
		pieces[28] = new Rook(board, black, "a8", 28);
		pieces[29] = new Rook(board, black, "h8", 29);

		pieces[14] = new Queen(board, white, "d1", 14);
		pieces[30] = new Queen(board, black, "d8", 30);

		pieces[15] = new King(board, white, "e1", 15);
		pieces[31] = new King(board, black, "e8", 31);

		// Đặt các quân cờ lên bàn cờ (trên màn hình)
		for (let i = 0; i < 32; i++) {
			cell = document.getElementById(pieces[i].position);
			cell.innerHTML = pieces[i].icon;
		}
	}

	function playGame() {
		// Sự kiện click vào các ô
		let move;
		let depth;
		// click("e2");
		// click("e4");
		for (let pos in board) {
			document.getElementById(pos).addEventListener("click", function() {
				click(pos);
				if (turn === black) {
					setTimeout(() => {
						if (noValidMoves(pieces, black)) {
							if (pieces[31].isChecked)
								alert("Checkmate! You won.");
							else
								alert("Draw!");
							return;
						}

						// movingSound.pause();
						// movingSound.currentTime = 0;
						let p = points(pieces, white) + points(pieces, black);
						if (p === 2000) {
							alert("Draw");
							return;
						}
						if (p < 2007)
							depth = 6;
						else if (p < 2020)
							depth = 5;
						else if (p < 2071)
							depth = 4;
						else
							depth = 3;
						console.log(p, depth);
						move = minimax(board, pieces, depth);
						console.log(move);
						click(move[0]);
						click(move[1]);

						setTimeout(() => {
							if (noValidMoves(pieces, white)) {
								if (pieces[15].isChecked)
									alert("Checkmate! You lost");
								else
									alert("Draw");
								return;
							}
							if (points(pieces, white) === 1000 && points(pieces, black) === 1000) {
								alert("Draw");
								return;
							}
						}, 50);
					}, 50);
				}
			});
		}
	}

	// while (true) {
	setUpGame();
	playGame();
	// }
}

class Pawn {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 1;
		this.notation = null;
		this.code = code;
		this.moved = false;
		this.enPassantPos = false;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackPawn.png' alt='blackPawn' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whitePawn.png' alt='whitePawn' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		// Kiểm tra xem có trực tiếp ăn quân của đối phương không
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		// Kiểm tra xem có bắt tốt qua đường (en passant) không
		else if (pos[0] !== this.position[0] && board[pos] === -1) {
			if (pieces[board[pos[0]+this.position[1]]] === undefined) {
				console.log(this.validMoves);
				console.log("color:", this.color, this.position, pos);
				console.log(pos[0]+this.position[1], board[pos[0]+this.position[1]]);
			}
			pieces[board[pos[0]+this.position[1]]].alive = false;
			board[pos[0]+this.position[1]] = -1;
		}

		// Kiểm tra xem có thể rơi vào thế En Passant không
		if (pos[1] - this.position[1] !== this.color)
			this.enPassantPos = true;

		// Cập nhật vị trí cho quân cờ
		board[pos] = board[this.position];
		board[this.position] = -1;
		this.position = pos;
		this.moved = true;

		// Kiểm tra xem có phong cấp không
		if (pos[1] === "1" || pos[1] === "8")
			pieces[this.code] = new Queen(board, this.color, this.position, this.code);
	}

	moveOnDisplay(pos) {
		// Kiểm tra xem có bắt tốt qua đường (en passant) không
		if (pos[0] !== this.position[0] && document.getElementById(pos).innerHTML === "")
			document.getElementById(pos[0]+this.position[1]).innerHTML = "";

		document.getElementById(this.position).innerHTML = "";
		if (pos[1] === "8")
			document.getElementById(pos).innerHTML = "<img src='assets/whiteQueen.png' alt='whiteQueen' class='icon'/>";
		else if (pos[1] === "1")
			document.getElementById(pos).innerHTML = "<img src='assets/blackQueen.png' alt='blackQueen' class='icon'/>";
		else
			document.getElementById(pos).innerHTML = this.icon;
	}

	updateValidMoves(board, pieces) {
		this.validMoves = [];
		let x = number(this.position[0]);
		let y = parseInt(this.position[1]);

		// Kiểm tra xem có đi thẳng được không
		if (board[alphabet(x)+(y+this.color)] === -1) {
			if (!this.moved && board[alphabet(x)+(y+this.color+this.color)] === -1)
				this.validMoves.push(alphabet(x)+(y+this.color+this.color));
			this.validMoves.push(alphabet(x)+(y+this.color));
		}

		// Kiểm tra xem có thể ăn quân của đối phương không
		let code = board[alphabet(x-1)+y];
		if (0 < x && ((board[alphabet(x-1)+(y+this.color)] !== -1 && pieces[board[alphabet(x-1)+(y+this.color)]].color !== this.color)	// ăn chéo thông thường
				  || (code !== -1 && pieces[code].color !== this.color && pieces[code].points === 1 && pieces[code].enPassantPos)))		// bắt tốt qua đường
			this.validMoves.push(alphabet(x-1)+(y+this.color));
		code = board[alphabet(x+1)+y];
		if (x < 7 && ((board[alphabet(x+1)+(y+this.color)] !== -1 && pieces[board[alphabet(x+1)+(y+this.color)]].color !== this.color)	// ăn chéo thông thường
				  || (code !== -1 && pieces[code].color !== this.color && pieces[code].points === 1 && pieces[code].enPassantPos)))		// bắt tốt qua đường
			this.validMoves.push(alphabet(x+1)+(y+this.color));
	}
}

class King {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 1000;
		this.notation = "K";
		this.code = code;
		this.moved = false;
		this.isChecked = false;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackKing.png' alt='blackKing' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whiteKing.png' alt='whiteKing' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		// Kiểm tra xem có ăn quân của đối phương không
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		// Kiểm tra nhập thành
		if (!this.moved) {
			if (pos[0] === "c")
				pieces[board["a"+pos[1]]].moveTo(board, pieces, "d"+pos[1]);
			else if (pos[0] === "g")
				pieces[board["h"+pos[1]]].moveTo(board, pieces, "f"+pos[1]);
		}

		// Cập nhật vị trí cho quân cờ
		board[pos] = board[this.position];
		board[this.position] = -1;

		this.position = pos;
		this.moved = true;
	}

	moveOnDisplay(pos) {
		document.getElementById(this.position).innerHTML = "";
		document.getElementById(pos).innerHTML = this.icon;
		// Di chuyển quân xe trên màn hình nếu nhập thành
		if (!this.moved) {
			if (pos[0] === "c") {
				document.getElementById("d"+pos[1]).innerHTML = document.getElementById("a"+pos[1]).innerHTML;
				document.getElementById("a"+pos[1]).innerHTML = "";
			}
			else if (pos[0] === "g") {
				document.getElementById("f"+pos[1]).innerHTML = document.getElementById("h"+pos[1]).innerHTML;
				document.getElementById("h"+pos[1]).innerHTML = "";
			}
		}
	}

	updateValidMoves(board, pieces) {
		this.isChecked = !isSafe(pieces, this.color, this.position);

		this.validMoves = [];
		let x = number(this.position[0]);
		let y = parseInt(this.position[1]);

		// Nước đi thông thường
		let pos;
		if (0 < x) {
			pos = alphabet(x-1)+y;
			if (board[pos] === -1 || pieces[board[pos]].color !== this.color)
				this.validMoves.push(alphabet(x-1)+y);
			pos = alphabet(x-1)+(y-1);
			if (1 < y && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
				this.validMoves.push(alphabet(x-1)+(y-1));
			pos = alphabet(x-1)+(y+1);
			if (y < 8 && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
				this.validMoves.push(alphabet(x-1)+(y+1));
		}
		if (x < 7) {
			pos = alphabet(x+1)+y;
			if (board[pos] === -1 || pieces[board[pos]].color !== this.color)
				this.validMoves.push(alphabet(x+1)+y);
			pos = alphabet(x+1)+(y-1);
			if (1 < y && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
				this.validMoves.push(alphabet(x+1)+(y-1));
			pos = alphabet(x+1)+(y+1);
			if (y < 8 && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
				this.validMoves.push(alphabet(x+1)+(y+1));
		}
		pos = alphabet(x)+(y-1);
		if (1 < y && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
			this.validMoves.push(alphabet(x)+(y-1));
		pos = alphabet(x)+(y+1);
		if (y < 8 && (board[pos] === -1 || pieces[board[pos]].color !== this.color))
			this.validMoves.push(alphabet(x)+(y+1));

		// Nhập thành
		if (!(this.moved || this.isChecked)) {
			if (!pieces[this.code-3].moved && board["b"+y] === -1 && board["c"+y] === -1 && board["d"+y] === -1 && isSafe(pieces, this.color, "c"+y) && isSafe(pieces, this.color, "d"+y))
				this.validMoves.push("c"+y);
			if (!pieces[this.code-2].moved && board["g"+y] === -1 && board["f"+y] === -1 && isSafe(pieces, this.color, "g"+y) && isSafe(pieces, this.color, "f"+y))
				this.validMoves.push("g"+y);
		}
	}
}

class Queen {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 9;
		this.notation = "Q";
		this.code = code;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackQueen.png' alt='blackQueen' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whiteQueen.png' alt='whiteQueen' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		board[pos] = board[this.position];
		board[this.position] = -1;
		this.position = pos;
	}

	moveOnDisplay(pos) {
		document.getElementById(this.position).innerHTML = "";
		document.getElementById(pos).innerHTML = this.icon;
	}

	updateValidMoves(board, pieces) {
		// Đường dọc và ngang (copy từ Rook)
		this.validMoves = [];
		let i = this.position[1];
		i++;
		while (i <= 8 && (board[this.position[0]+i] === -1 || pieces[board[this.position[0]+i]].color !== this.color)) {
			this.validMoves.push(this.position[0]+i);
			if (board[this.position[0]+i] !== -1)
				break;
			i++;
		}
		i = this.position[1];
		i--;
		while (1 <= i && (board[this.position[0]+i] === -1 || pieces[board[this.position[0]+i]].color !== this.color)) {
			this.validMoves.push(this.position[0]+i);
			if (board[this.position[0]+i] !== -1)
				break;
			i--;
		}
		i = number(this.position[0]);
		i++;
		while (i <= 7 && (board[alphabet(i)+this.position[1]] === -1 || pieces[board[alphabet(i)+this.position[1]]].color !== this.color)) {
			this.validMoves.push(alphabet(i)+this.position[1]);
			if (board[alphabet(i)+this.position[1]] !== -1)
				break;
			i++;
		}
		i = number(this.position[0]);
		i--;
		while (0 <= i && (board[alphabet(i)+this.position[1]] === -1 || pieces[board[alphabet(i)+this.position[1]]].color !== this.color)) {
			this.validMoves.push(alphabet(i)+this.position[1]);
			if (board[alphabet(i)+this.position[1]] !== -1)
				break;
			i--;
		}

		// Đường chéo (Copy từ Bishop)
		let x = number(this.position[0]);
		let y = parseInt(this.position[1]);
		i = 1;
		while (x+i <= 7 && y+i <= 8 && (board[alphabet(x+i)+(y+i)] === -1 || pieces[board[alphabet(x+i)+(y+i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y+i));
			if (board[alphabet(x+i)+(y+i)] !== -1)
				break;
			i++;
		}
		i = -1;
		while (0 <= x+i && 1 <= y+i && (board[alphabet(x+i)+(y+i)] === -1 || pieces[board[alphabet(x+i)+(y+i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y+i));
			if (board[alphabet(x+i)+(y+i)] !== -1)
				break;
			i--;
		}
		i = 1;
		while (x+i <= 7 && 1 <= y-i && (board[alphabet(x+i)+(y-i)] === -1 || pieces[board[alphabet(x+i)+(y-i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y-i));
			if (board[alphabet(x+i)+(y-i)] !== -1)
				break;
			i++;
		}
		i = -1;
		while (0 <= x+i && y-i <= 8 && (board[alphabet(x+i)+(y-i)] === -1 || pieces[board[alphabet(x+i)+(y-i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y-i));
			if (board[alphabet(x+i)+(y-i)] !== -1)
				break;
			i--;
		}
	}
}

class Rook {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 5;
		this.notation = "R";
		this.code = code;
		this.moved = false;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackRook.png' alt='blackRook' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whiteRook.png' alt='whiteRook' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		board[pos] = board[this.position];
		board[this.position] = -1;
		this.position = pos;
		this.moved = true;
	}

	moveOnDisplay(pos) {
		document.getElementById(this.position).innerHTML = "";
		document.getElementById(pos).innerHTML = this.icon;
	}

	updateValidMoves(board, pieces) {
		this.validMoves = [];
		let i = this.position[1];
		i++;
		while (i <= 8 && (board[this.position[0]+i] === -1 || pieces[board[this.position[0]+i]].color !== this.color)) { // nếu ô trong bảng, là ô trống hoặc có quân cờ khác màu
			this.validMoves.push(this.position[0]+i);
			if (board[this.position[0]+i] !== -1) // nếu ô không trống (tức là có quân cờ khác màu)
				break;
			i++;
		}
		i = this.position[1];
		i--;
		while (1 <= i && (board[this.position[0]+i] === -1 || pieces[board[this.position[0]+i]].color !== this.color)) { // nếu ô trong bảng, là ô trống hoặc có quân cờ khác màu
			this.validMoves.push(this.position[0]+i);
			if (board[this.position[0]+i] !== -1) // nếu ô không trống (tức là có quân cờ khác màu)
				break;
			i--;
		}
		i = number(this.position[0]);
		i++;
		while (i <= 7 && (board[alphabet(i)+this.position[1]] === -1 || pieces[board[alphabet(i)+this.position[1]]].color !== this.color)) { // nếu ô trong bảng, là ô trống hoặc có quân cờ khác màu
			this.validMoves.push(alphabet(i)+this.position[1]);
			if (board[alphabet(i)+this.position[1]] !== -1) // nếu ô không trống (tức là có quân cờ khác màu)
				break;
			i++;
		}
		i = number(this.position[0]);
		i--;
		while (0 <= i && (board[alphabet(i)+this.position[1]] === -1 || pieces[board[alphabet(i)+this.position[1]]].color !== this.color)) { // nếu ô trong bảng, là ô trống hoặc có quân cờ khác màu
			this.validMoves.push(alphabet(i)+this.position[1]);
			if (board[alphabet(i)+this.position[1]] !== -1) // nếu ô không trống (tức là có quân cờ khác màu)
				break;
			i--;
		}
	}
}

class Knight {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 3;
		this.notation = "N";
		this.code = code;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackKnight.png' alt='blackKnight' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whiteKnight.png' alt='whiteKnight' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		board[pos] = board[this.position];
		board[this.position] = -1;
		this.position = pos;
	}

	moveOnDisplay(pos) {
		document.getElementById(this.position).innerHTML = "";
		document.getElementById(pos).innerHTML = this.icon;
	}

	updateValidMoves(board, pieces) {
		this.validMoves = [];
		let x = number(this.position[0]);
		let y = parseInt(this.position[1]);

		for (let i = -2; i < 3; i += 4) {
			for (let j = -1; j < 2; j += 2) {
				if (0 <= x+i && x+i <= 7 && 1 <= y+j && y+j <= 8 && (board[alphabet(x+i)+(y+j)] === -1 || pieces[board[alphabet(x+i)+(y+j)]].color !== this.color))
					this.validMoves.push(alphabet(x+i)+(y+j));
				if (0 <= x+j && x+j <= 7 && 1 <= y+i && y+i <= 8 && (board[alphabet(x+j)+(y+i)] === -1 || pieces[board[alphabet(x+j)+(y+i)]].color !== this.color))
					this.validMoves.push(alphabet(x+j)+(y+i));
			}
		}
	}
}

class Bishop {
	constructor(board, color, position, code, validMoves = []) {
		this.color = color;
		this.position = position;
		this.points = 3;
		this.notation = "B";
		this.code = code;
		this.validMoves = validMoves;
		this.alive = true;
		switch (color) {
			case black:
				this.icon = "<img src='assets/blackBishop.png' alt='blackBishop' class='icon'/>";
				break;
			default:
				this.icon = "<img src='assets/whiteBishop.png' alt='whiteBishop' class='icon'/>";
				break;
		}
		board[position] = code;
	}

	moveTo(board, pieces, pos) {
		if (board[pos] !== -1)
			pieces[board[pos]].alive = false;

		board[pos] = board[this.position];
		board[this.position] = -1;
		this.position = pos;
	}

	moveOnDisplay(pos) {
		document.getElementById(this.position).innerHTML = "";
		document.getElementById(pos).innerHTML = this.icon;
	}

	updateValidMoves(board, pieces) {
		this.validMoves = [];
		let x = number(this.position[0]);
		let y = parseInt(this.position[1]);

		let i = 1;
		while (x+i <= 7 && y+i <= 8 && (board[alphabet(x+i)+(y+i)] === -1 || pieces[board[alphabet(x+i)+(y+i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y+i));
			if (board[alphabet(x+i)+(y+i)] !== -1)
				break;
			i++;
		}
		i = -1;
		while (0 <= x+i && 1 <= y+i && (board[alphabet(x+i)+(y+i)] === -1 || pieces[board[alphabet(x+i)+(y+i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y+i));
			if (board[alphabet(x+i)+(y+i)] !== -1)
				break;
			i--;
		}
		i = 1;
		while (x+i <= 7 && 1 <= y-i && (board[alphabet(x+i)+(y-i)] === -1 || pieces[board[alphabet(x+i)+(y-i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y-i));
			if (board[alphabet(x+i)+(y-i)] !== -1)
				break;
			i++;
		}
		i = -1;
		while (0 <= x+i && y-i <= 8 && (board[alphabet(x+i)+(y-i)] === -1 || pieces[board[alphabet(x+i)+(y-i)]].color !== this.color)) {
			this.validMoves.push(alphabet(x+i)+(y-i));
			if (board[alphabet(x+i)+(y-i)] !== -1)
				break;
			i--;
		}
	}
}

function isSafe(pieces, color, pos) {
	let range = [0, 16] // Khoảng chứa các quân cờ của đối phương
	if (color === white)
		range = [16, 32];
	for (let i = range[0]; i < range[1]; i++)
		if (pieces[i].alive && pieces[i].validMoves.includes(pos))
			return false;
	return true;
}

function update(board, pieces, turn, protectKing = true) {
	// Cập nhật khả năng bị ăn kiểu En Passant của các quân tốt
	if (turn === black)
		for (let i = 0; i < 8; i++)
			pieces[i].enPassantPos = false;
	else
		for (let i = 16; i < 24; i++)
			pieces[i].enPassantPos = false;

	// Cập nhật các ô mà mỗi quân còn sống có thể đi
	for (let i = 0; i < 16; i++) {
		if (pieces[i].alive)
			pieces[i].updateValidMoves(board, pieces);
		if (pieces[i+16].alive)
			pieces[i+16].updateValidMoves(board, pieces);
	}

	// Loại bỏ những nước mà sẽ tự khiến cho vua bị chiếu
	if (protectKing) {
		let boardCopied = {...board};
		let piecesCopied = pieces.map(piece => Object.assign(Object.create(Object.getPrototypeOf(piece)), piece));

		let range = [0, 16];
		if (turn === white)	// Nếu trắng vừa đi thì cập nhật cho đen (và ngược lại)
			range = [16, 32];

		for (let i = range[0]; i < range[1]; i++) {
			if (pieces[i].alive) {
				let oldPos = pieces[i].position;

				for (let j in pieces[i].validMoves) {
					// Đi thử
					let newPos = pieces[i].validMoves[j];
					piecesCopied[i].moveTo(boardCopied, piecesCopied, newPos);
					for (let piece of piecesCopied)
						if (piece.alive)
							piece.updateValidMoves(boardCopied, piecesCopied);

					// Nếu khiến vua không an toàn thì gắn cờ cho nước đi đó là không hợp lệ
					if (!isSafe(piecesCopied, -turn, piecesCopied[8*turn+23].position))	// 8*turn+23 bằng 15 nếu turn = -1 (black), bằng 31 nếu turn = 1 (white)
						pieces[i].validMoves[j] = "\0";

					// Trả bàn cờ về bước trước đó
					piecesCopied[i] = Object.assign(Object.create(Object.getPrototypeOf(pieces[i])), pieces[i]);
					if (board[newPos] !== -1)	// Nếu quân cờ ở pos bị ăn thì hồi sinh nó
						piecesCopied[board[newPos]].alive = true;	// dòng này phải dùng board vì chỉ có board mới lưu quân cờ ở vị trí đó trước khi nó bị ăn
					boardCopied[oldPos] = board[oldPos];
					boardCopied[newPos] = board[newPos];
				}

				pieces[i].validMoves = pieces[i].validMoves.filter(pos => pos !== "\0");
			}
		}
	}	
}

function points(pieces, color) {
	let p = 0;
	let range = [0, 16];
	if (color === black)
		range = [16, 32];
	for (let i = range[0]; i < range[1]; i++)
		if (pieces[i].alive)
			p += pieces[i].points;
	return p;
}

function minimax(board, pieces, depth, alpha = -1.0/0.0, beta = 1.0/0.0, turn = black) {
	// if (noValidMoves(pieces, turn)) {
	// 	if (pieces[8*turn+23].isChecked)
	// 		return ["\0", "\0", turn*(1000 - 10*depth)];
	// 	else
	// 		return ["\0", "\0", 0];
	// }
	if (points(pieces, turn) < 500)
		return ["\0", "\0", turn*(1000 - 10*depth)];

	// if (points(pieces, black) === 1000 && points(pieces, white) === 1000)
	// 	return ["\0", "\0", 0];

	if (depth === 0)
		return ["\0", "\0", points(pieces, black) - points(pieces, white)];

	let boardCopied = {...board};
	let piecesCopied = pieces.map(piece => Object.assign(Object.create(Object.getPrototypeOf(piece)), piece));

	if (turn === black) {
		let maxPoints = -1.0/0.0;
		let maxMove;

		for (let i = 16; i < 32; i++)
			if (pieces[i].alive) {
				let oldPos = pieces[i].position;

				for (let newPos of pieces[i].validMoves) {
					piecesCopied[i].moveTo(boardCopied, piecesCopied, newPos);
					update(boardCopied, piecesCopied, turn, protectKing = false);

					let result = minimax(boardCopied, piecesCopied, depth-1, alpha, beta, white);
					// Trả bàn cờ về bước trước đó
					if (pieces[i].points === 1 && newPos[0] !== oldPos[0] && board[newPos] === -1) {	// Nếu có quân cờ bị ăn kiểu en passant thì hồi sinh nó
						piecesCopied[board[newPos[0]+oldPos[1]]].alive = true;
						boardCopied[newPos[0]+oldPos[1]] = board[newPos[0]+oldPos[1]];
					}
					piecesCopied[i] = Object.assign(Object.create(Object.getPrototypeOf(pieces[i])), pieces[i]);
					if (board[newPos] !== -1)	// Nếu quân cờ ở newPos bị ăn thì hồi sinh nó
						piecesCopied[board[newPos]].alive = true;	// dòng này phải dùng board vì chỉ có board mới lưu quân cờ ở vị trí đó trước khi nó bị ăn
					boardCopied[oldPos] = board[oldPos];
					boardCopied[newPos] = board[newPos];


					if (result[2] > maxPoints) {
						maxPoints = result[2];
						maxMove = [oldPos, newPos];
					}

					if (maxPoints > alpha)
						alpha = maxPoints;
					if (alpha > beta)
						break;
				}
			}
		return [maxMove[0], maxMove[1], maxPoints];
	}

	else {
		let minPoints = 1.0/0.0;
		let minMove;

		for (let i = 0; i < 16; i++)
			if (pieces[i].alive) {
				let oldPos = pieces[i].position;

				for (let newPos of pieces[i].validMoves) {
					piecesCopied[i].moveTo(boardCopied, piecesCopied, newPos);
					update(boardCopied, piecesCopied, turn, protectKing = false);

					let result = minimax(boardCopied, piecesCopied, depth-1, alpha, beta, black);
					// Trả bàn cờ về bước trước đó
					if (pieces[i].points === 1 && newPos[0] !== oldPos[0] && board[newPos] === -1) {	// Nếu có quân cờ bị ăn kiểu en passant thì hồi sinh nó
						piecesCopied[board[newPos[0]+oldPos[1]]].alive = true;
						boardCopied[newPos[0]+oldPos[1]] = board[newPos[0]+oldPos[1]];
					}

					piecesCopied[i] = Object.assign(Object.create(Object.getPrototypeOf(pieces[i])), pieces[i]);
					if (board[newPos] !== -1)	// Nếu quân cờ ở newPos bị ăn thì hồi sinh nó
						piecesCopied[board[newPos]].alive = true;	// dòng này phải dùng board vì chỉ có board mới lưu quân cờ ở vị trí đó trước khi nó bị ăn
					boardCopied[oldPos] = board[oldPos];
					boardCopied[newPos] = board[newPos];

					if (result[2] < minPoints) {
						minPoints = result[2];
						minMove = [oldPos, newPos];
					}

					if (minPoints < beta)
						beta = minPoints;
					if (alpha > beta)
						break;
				}
			}
		return [minMove[0], minMove[1], minPoints];
	}
}

window.onload = init;