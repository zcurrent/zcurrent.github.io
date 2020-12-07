const canvas = document.getElementById("dungeon");
const context = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

const pressedKeys = [];
const components = [];
const itemsFound = [];
itemsFound[0] = false;

const enemies = [];
const currentItems = [];

const dungeonRooms = [
	[0, 8, 7, 0, 0],
	[0, 0, 2, 6, 0],
	[0, 4, 1, 5, 9],
	[11, 10, 3, 0, 0],
	[0, 0, 0, 0, 0],
];
sessionStorage.setItem('dungeonRooms', JSON.stringify(dungeonRooms));

window.onload = function () {
	setRoom();
	setStats();
}


// Setting up Player
var heal = parseInt(sessionStorage.getItem("health"));
var player = {
	xPos: 400 - 16,
	yPos: 250 - 24,
	width: 32,
	height: 48,
	frameX: 0,
	frameY: 0,
	speed: 9,
	direction: "down",
	moving: false,
	currentRoomX: 2,
	currentRoomY: 2,
	changingRoom: false,
	health: heal,
	equip: 0,
	attack: 0,
	defense: 0,
};

const playerSprite = new Image();
playerSprite.src = "Images/Characters/indianajones.png";

function drawPlayer(image, sX, sY, sW, sH, dX, dY, dW, dH) {
	context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);
}


// Movement

window.addEventListener("keydown", function (event) {
	if (event.keyCode == 65 || event.keyCode == 68 || event.keyCode == 83 || event.keyCode == 87) {
		pressedKeys[event.keyCode] = true;
		player.moving = true;
	}
	else if (event.keyCode == 73 || event.keyCode == 69 || event.keyCode == 32) { //check for I inventory key and interact
		pressedKeys[event.keyCode] = true;
	}
});
window.addEventListener("keyup", function (event) {
	if (event.keyCode == 65 || event.keyCode == 68 || event.keyCode == 83 || event.keyCode == 87) {
		delete pressedKeys[event.keyCode];
		player.moving = false;
	}
	else if (event.keyCode == 73 || event.keyCode == 69 || event.keyCode == 32) { //delete I key for inventory and interact
		delete pressedKeys[event.keyCode];
	}
});

function movePlayer() {

	// Left - A key
	if (pressedKeys[65] && !collisionDetect("left")) {
		player.direction = "left";
		if (player.xPos < 0) {
			player.currentRoomX -= 1;
			sessionStorage.setItem('currentRoomX', player.currentRoomX);
			player.changingRoom = true;
			setRoom();
			return;
		}
		player.xPos -= player.speed;
		player.frameY = 1;
		player.moving = true;
	}
	// Right - D key
	if (pressedKeys[68] && !collisionDetect("right")) {
		player.direction = "right";
		if (player.xPos > canvas.width - player.width) {
			player.currentRoomX += 1;
			sessionStorage.setItem('currentRoomX', player.currentRoomX);
			player.changingRoom = true;
			setRoom();
			return;
		}
		player.xPos += player.speed;
		player.frameY = 2;
		player.moving = true;
	}
	// Up - W key
	if (pressedKeys[87] && !collisionDetect("up")) {
		player.direction = "up";
		if (player.yPos < 0) {
			player.currentRoomY -= 1;
			sessionStorage.setItem('currentRoomY', player.currentRoomY);
			player.changingRoom = true;
			setRoom();
			return;
		}
		player.yPos -= player.speed;
		player.frameY = 3;
		player.moving = true;
	}
	// Down - S key
	if (pressedKeys[83] && !collisionDetect("down")) {
		player.direction = "down";
		if (player.yPos > canvas.height - player.height) {
			player.currentRoomY += 1;
			sessionStorage.setItem('currentRoomY', player.currentRoomY);
			player.changingRoom = true;
			setRoom();
			return;
		}
		player.yPos += player.speed;
		player.frameY = 0;
		player.moving = true;
	}
}

function handlePlayerFrame() {
	if (player.frameX < 3 && player.moving) {
		player.frameX++;
	} else {
		player.frameX = 0;
	}
}


// Obstacle Detection

function collisionDetect(direction) {
	let playerLeft = player.xPos;
	let playerRight = player.xPos + player.width;
	let playerTop = player.yPos;
	let playerBottom = player.yPos + player.height;
	var leftRightAdjust = 1;
	var upDownAdjust = 6;

	// Components collision
	for (let i = 0; i < components.length; i++) {
		if (components[i] != null) {
			let compLeft = components[i].x;
			let compRight = components[i].x + components[i].width;
			let compTop = components[i].y;
			let compBottom = components[i].y + components[i].height;

			if (direction == "left") {
				playerLeft -= player.speed - leftRightAdjust;
				if ((playerLeft < compRight && playerRight > compLeft) && (playerBottom > compTop && playerTop < compBottom)) {
					return true;
				}
			} else if (direction == "right") {
				playerRight += player.speed - leftRightAdjust;
				if ((playerRight > compLeft && playerLeft < compRight) && (playerBottom > compTop && playerTop < compBottom)) {
					return true;
				}
			} else if (direction == "up") {
				playerTop -= player.speed - upDownAdjust;
				if ((playerRight > compLeft && playerLeft < compRight) && (playerBottom > compTop && playerTop < compBottom)) {
					return true;
				}
			} else if (direction == "down") {
				playerBottom += player.speed - upDownAdjust;
				if ((playerRight > compLeft && playerLeft < compRight) && (playerBottom > compTop && playerTop < compBottom)) {
					return true;
				}
			}
		}
	}

	// Moveable items collision
	for (let i = 0; i < moveableItems.length; i++) {
		let moveLeft = moveableItems[i].xPos;
		let moveRight = moveableItems[i].xPos + moveableItems[i].width;
		let moveTop = moveableItems[i].yPos;
		let moveBot = moveableItems[i].yPos + moveableItems[i].height;

	 if (direction == "left") {
			if ((playerLeft < moveRight - 52 && playerRight > moveLeft) && (playerBottom > moveTop && playerTop < moveBot)) {
				moveableItems[i].xPos -= player.speed;
			}
		} else if (direction == "right") {
			if ((playerRight - 60 > moveLeft && playerLeft < moveRight) && (playerBottom > moveTop && playerTop < moveBot)) {
				moveableItems[i].xPos += player.speed;
			}
		} else if (direction == "up") {
			if ((playerRight > moveLeft && playerLeft < moveRight) && (playerBottom > moveTop && playerTop + 15 < moveBot)) {
				moveableItems[i].yPos -= player.speed;
			}
		} else if (direction == "down") {
			if ((playerRight > moveLeft && playerLeft < moveRight) && (playerBottom - 10 > moveTop && playerTop < moveBot)) {
				moveableItems[i].yPos += player.speed;
			}
		}
	}

	return false;
}


// Enemies

const crawlerSprite = new Image();
crawlerSprite.src = "Images/Characters/crawler.png";

const lizardSprite = new Image();
lizardSprite.src = "Images/Characters/lizard.png";

function Enemy(name, x, y, width, height, direction, moving, crawlerTopY, crawlerBotY) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.direction = direction;
	this.moving = moving;
	this.crawlerTopY = crawlerTopY;
	this.crawlerBotY = crawlerBotY;
	if (name == "crawler") {
		this.health = 50;
		this.attack = 30;
		this.speed = 7;
	} else if (name == "lizard") {
		this.health = 100;
		this.attack = 10;
		this.speed = 4;
	}
}

function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemy = enemies[i];
		enemySprite = new Image();

		if (enemy.name == "crawler") {
			crawlerMovement(enemy);
			enemySprite = crawlerSprite;
		}
		else if (enemy.name == "lizard") {
			lizardMovement(enemy);
			enemySprite = lizardSprite;
		}
		context.drawImage(enemySprite, 0, 0, enemy.width, enemy.height, enemy.x, enemy.y, enemy.width, enemy.height);
	}
}

function crawlerMovement(enemy) {
	enemyBelow = enemy.y - player.yPos;
	enemyAbove = player.yPos - enemy.y;
	enemyLeft = player.xPos - enemy.x;
	enemyRight = enemy.x - player.xPos;

	if (enemy.direction == "up") {
		if (enemy.y <= enemy.crawlerTopY) {
			enemy.direction = "down";
		} else {
			enemy.y -= enemy.speed;
		}
	} else {
		if (enemy.y >= enemy.crawlerBotY) {
			enemy.direction = "up";
		} else {
			enemy.y += enemy.speed;
		}
	}

	// Player collision/bounceback
	if (enemyRight <= player.speed * 3 && enemyRight >= 0 && enemyBelow <= player.speed * 3 && enemyBelow >= 0) {
		player.xPos -= player.speed * 3;
		player.yPos -= player.speed * 3;
		player.health -= enemy.attack;
	}
	else if (enemyRight <= player.speed * 3 && enemyRight >= 0 && enemyAbove <= player.speed * 3 && enemyAbove >= 0) {
		player.xPos -= player.speed * 3;
		player.yPos += player.speed * 3;
		player.health -= enemy.attack;
	}
	else if (enemyLeft <= player.speed * 3 && enemyLeft >= 0 && enemyBelow <= player.speed * 3 && enemyBelow >= 0) {
		player.xPos += player.speed * 3;
		player.yPos -= player.speed * 3;
		player.health -= enemy.attack;
	}
	else if (enemyLeft <= player.speed * 3 && enemyLeft >= 0 && enemyAbove <= player.speed * 3 && enemyAbove >= 0) {
		player.xPos += player.speed * 3;
		player.yPos += player.speed * 3;
		player.health -= enemy.attack;
	}
	sessionStorage.setItem("health", player.health);
}

function lizardMovement(enemy) {
	enemyBelow = enemy.y - player.yPos;
	enemyAbove = player.yPos - enemy.y;
	enemyLeft = player.xPos - enemy.x;
	enemyRight = enemy.x - player.xPos;

	moveDistance = 100;
	attackDistance = player.speed - 2;
	enemyMove = enemy.speed;
	playerBounceback = player.speed * 2;
	enemyBounceback = enemy.speed;

	// Right/Below the player
	if (enemyRight <= moveDistance && enemyRight >= 0 && enemyBelow <= moveDistance && enemyBelow >= 0) {
		enemy.x -= enemyMove;
		enemy.y -= enemyMove;

		// Player collision/bounceback
		if (enemyRight <= attackDistance || enemyBelow <= attackDistance) {
			player.xPos -= playerBounceback;
			player.yPos -= playerBounceback;
			player.health -= enemy.attack;

			enemy.x += enemyBounceback;
			enemy.y += enemyBounceback;
		}
	}
	// Right/Above the player
	else if (enemyRight <= moveDistance && enemyRight >= 0 && enemyAbove <= moveDistance && enemyAbove >= 0) {
		enemy.x -= enemyMove;
		enemy.y += enemyMove;

		// Player collision/bounceback
		if (enemyRight <= attackDistance || enemyAbove <= attackDistance) {
			player.xPos -= playerBounceback;
			player.yPos += playerBounceback;
			player.health -= enemy.attack;

			enemy.x += enemyBounceback;
			enemy.y -= enemyBounceback;
		}
	}
	// Left/Below the player
	else if (enemyLeft <= moveDistance && enemyLeft >= 0 && enemyBelow <= moveDistance && enemyBelow >= 0) {
		enemy.x += enemyMove;
		enemy.y -= enemyMove;

		// Player collision/bounceback
		if (enemyLeft <= attackDistance || enemyBelow <= attackDistance) {
			player.xPos += playerBounceback;
			player.yPos -= playerBounceback;
			player.health -= enemy.attack;

			enemy.x -= enemyBounceback;
			enemy.y += enemyBounceback;
		}
	}
	// Left/Above the player
	else if (enemyLeft <= moveDistance && enemyLeft >= 0 && enemyAbove <= moveDistance && enemyAbove >= 0) {
		enemy.x += enemyMove;
		enemy.y += enemyMove;

		// Player collision/bounceback
		if (enemyLeft <= attackDistance || enemyAbove <= attackDistance) {
			player.xPos += playerBounceback;
			player.yPos += playerBounceback;
			player.health -= enemy.attack;

			enemy.x -= enemyBounceback;
			enemy.y -= enemyBounceback;
		}
	}
	sessionStorage.setItem("health", player.health);
}


// Items/Moveable/Inventory

function Items(name, img, xPos, yPos, description, attack, defense, itemNum){
	this.name = name;
	this.img = new Image();
	this.img.src = img;
	this.xPos = xPos;
	this.yPos = yPos;
	this.description = description;
	this.found = false;
	this.attack = attack;
	this.defense = defense;
	this.itemNum = itemNum;
}

function itemGeneration() { //generates items on runtime after loading room
	for(let i = 0; i<currentItems.length;i++){
		var found = JSON.parse(sessionStorage.getItem("found"));
		if(!found.includes(currentItems[i].itemNum)){
			context.drawImage(currentItems[i].img, currentItems[i].xPos, currentItems[i].yPos, 25, 25);
		}
		//console.log(currentItems[0].xPos);
	}
}

//interact button checks if player is near item if so store item
function interact() {
	var found = JSON.parse(sessionStorage.getItem("found"));
	if (pressedKeys[69]) {
		for(let i = 0;i<currentItems.length;i++){
			if (itemsFound[currentItems[i].itemNum] != true && player.xPos > currentItems[i].xPos - 25 && player.yPos > currentItems[i].yPos - 25 && player.xPos < currentItems[i].xPos + 15 && player.yPos < currentItems[i].yPos + 15) {
					if(currentItems[i].itemNum==4) {
						var health = parseInt(sessionStorage.getItem("health"));
						health+=50;
						sessionStorage.setItem("health", health);
						console.log(sessionStorage.getItem("health"));
						itemsFound[currentItems[i].itemNum] = true;
					} else if(currentItems[i].itemNum==7){
						pressedKeys[69] = false;

						let code = window.prompt("Please enter the code the the treasure's lock:")

						if(code == "0723"){
							let time = parseFloat(sessionStorage.getItem("time"));
							let score = parseInt(sessionStorage.getItem("score"));
							
							//if time is greater than 10 minutes
							if(time > 600){
								score -= 500;
								
							//if time is greater than 4 minutes
							} else if(time > 240) {
								score += 500;
								
							//if time is greater than 2 minutes
							} else if(time > 120) {
								score += 1000;
								
							//if time is greater than 1 minutes
							} else if(time > 60) {
								score += 1500;
								
							//if time is greater than 45 seconds
							} else if(time > 45) {
								score += 2000;
							
							//if time is greater than 30 seconds
							} else if(time > 30) {
								score += 3000;
								
							//if time is greater than 15 seconds
							} else if(time > 15) {
								score += 5000;
								
							} else {
								score += 10000;
							}
							
							
							
							
							window.alert(score);
							var leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
							let x = {name: sessionStorage.getItem("name"), score: score};
							leaderboard.push(x);
							localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
							window.location.href = "index.html";

						} else {
							window.alert("Incorrect.");
						}

						return;
					}
					else if(currentItems[i].itemNum==9){
						if(found.includes(1)){
							components.length = components.length-1;
							drawComponents();
						}
						else{return;}
					}
					else if(currentItems[i].itemNum==8||currentItems[i].itemNum==10||currentItems[i].itemNum==11||currentItems[i].itemNum==12){
						var score = parseInt(sessionStorage.getItem("score"));
						score+=1000;
						sessionStorage.setItem("score", score);
					}
					else{

						var inventory = JSON.parse(sessionStorage.getItem("inventory"));
						var x = { name: currentItems[i].name, img: currentItems[i].img.src, stock:1, description: currentItems[i].description, attack: currentItems[i].attack, defense: currentItems[i].defense};
						inventory.push(x);
						sessionStorage.setItem("inventory", JSON.stringify(inventory));
						var score = parseInt(sessionStorage.getItem("score"));
						score+=100;
						sessionStorage.setItem("score", score);
					}
					itemsFound[currentItems[i].itemNum] = true;
					found.push(currentItems[i].itemNum);
					sessionStorage.setItem("found", JSON.stringify(found));
			}
		}
	}
	else if(pressedKeys[32]) {
		distance = player.speed * 4;

		for(let i =0; i < enemies.length; i++) {
			enemy = enemies[i];
			xDist = 0;
			yDist = 0;

			if(player.xPos - enemy.x >= 0) {
				xDist = player.xPos - enemy.x;
			} else {
				xDist = enemy.x - player.xPos;
			}
			if(player.yPos - enemy.y >= 0) {
				yDist = player.yPos - enemy.y;
			} else {
				yDist = enemy.y - player.yPos;
			}

			if(xDist <= distance && yDist <= distance) {
				enemies[i].health -= window.sessionStorage.getItem("attack");
				if(enemies[i].health <= 0) {
					// When enemy is killed, they are placed off screen
					enemies[i].x += 800;
					var score = parseInt(sessionStorage.getItem("score"));
					score+=200;
					sessionStorage.setItem("score", score);
				}
			}
		}
	}
}

var moveitem = new Image(); //moveable item image
moveitem.src = "Images/Items/grass.png";

const moveableItems = []; //moveable items array
//moveableItems[0] = new moveableItem(moveitem, 650, 350, 45, 45); //initiating a moveable item
function moveableItem(img, xPos, yPos, width, height) {
	this.img = img;
	this.xPos = xPos;
	this.yPos = yPos;
	this.width = width;
	this.height = height;
}

function moveableItemGeneration() { //draw the picture from the moveable item object
	for(let i=0;i<moveableItems.length;i++){
		context.drawImage(moveableItems[i].img, moveableItems[i].xPos, moveableItems[i].yPos, moveableItems[i].width, moveableItems[i].height);
	}
}

//inventory button
function inventoryScreenChange() {
	if (pressedKeys[73]) {
		window.location.href = 'inventory.html';
	}
}


// Room Transitioning/Background and Components

var background = new Image();

function Component(name, width, height, color, x, y, isDoor, direction) {
	this.name = name;
	this.width = width;
	this.height = height;
	this.color = color;
	this.x = x;
	this.y = y;
	this.isDoor = isDoor;
	this.direction = direction;
}

function drawComponents() {
	for (let i = 0; i < components.length; i++) {
		ctx = context;
		ctx.fillStyle = components[i].color;
		ctx.fillRect(components[i].x, components[i].y, components[i].width, components[i].height);
	}
	itemGeneration();
	moveableItemGeneration();
}

function setRoom() {
	enemies.length = 0;
	moveableItems.length = 0;
	currentItems.length = 0;
	components.length = 0;
	player.currentRoomX = Number(sessionStorage.getItem('currentRoomX'));
	player.currentRoomY = Number(sessionStorage.getItem('currentRoomY'));


	if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 1) {
		generateRoom1();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 2) {
		generateRoom2();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 3) {
		generateRoom3();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 4) {
		generateRoom4();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 5) {
		generateRoom5();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 6) {
		generateRoom6();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 7) {
		generateRoom7();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 8) {
		generateRoom8();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 9) {
		generateRoom9();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 10) {
		generateRoom10();
	} else if (dungeonRooms[player.currentRoomY][player.currentRoomX] == 11) {
		generateRoom11();
	}

	if (player.changingRoom) {
		if (player.direction == "left") {
			player.xPos = canvas.width - player.width;
		} else if (player.direction == "right") {
			player.xPos = 0;
		} else if (player.direction == "up") {
			player.yPos = canvas.height - player.height;
		} else if (player.direction == "down") {
			player.yPos = 0;
		}
		player.changingRoom = false;
	}
};

function setStats() {
	console.log(window.sessionStorage);
	if (typeof window.sessionStorage === "undefined") { return; }
	if (window.sessionStorage.getItem("equip") != null) {
		var equip = document.getElementById("equip");
		equip.innerText = "Equipped Item: " + window.sessionStorage.getItem("equip");
		var attack = document.getElementById("attack");
		attack.innerText = "Attack: " + window.sessionStorage.getItem("attack");
		var defense = document.getElementById("defense");
		defense.innerText = "Defense: " + window.sessionStorage.getItem("defense");
	var health = document.getElementById("health");
		health.innerText = "Health: " + window.sessionStorage.getItem("health");
	}
}

function generateRoom1() {
	background.src = "Images/DungeonRoomImages/greenbackground.jpg";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[3] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[4] = new Component("top wall - left", 300, 50, "black", 0, 0, false);
	components[5] = new Component("top wall - right", 300, 50, "black", 500, 0, false);
	components[6] = new Component("bottom wall - left", 300, 50, "black", 0, 450, false);
	components[7] = new Component("bottom wall - right", 300, 50, "black", 500, 450, false);

	// Enemies
	enemies[0] = new Enemy("crawler", 200, 250, 32, 48, "down", true, 60, 390);
	enemies[1] = new Enemy("crawler", 100, 300, 32, 48, "up", true, 60, 390);
	enemies[2] = new Enemy("lizard", 500, 100, 32, 48, "", false, 0, 0);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"))
	console.log(found);

	if(!found.includes("2")){
		currentItems[0] = new Items("Basic Sword", "Images/items/sword1.png", 500, 350, "Attack: 10\nDefense: 0", 10,0,2);
	}
	if(!found.includes(9)){
		currentItems.push(new Items("door", "Images/items/door.png", 100,230,"open door", 0,0,9));
		components[8] = new Component("door", 50, 100, "black", 0,200, false);
	}
	moveableItems[0] = new moveableItem(moveitem, 650, 350, 45, 45);
	moveableItems[1] = new moveableItem(moveitem, 500, 350, 45, 45);
};

function generateRoom2() {
	background.src = "Images/DungeonRoomImages/rockbackground.png";

	// Walls
	components[0] = new Component("left wall", 50, canvas.height, "black", 0, 0, false);
	components[1] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[2] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[3] = new Component("top wall - left", 300, 50, "black", 0, 0, false);
	components[4] = new Component("top wall - right", 300, 50, "black", 500, 0, false);
	components[5] = new Component("bottom wall - left", 300, 50, "black", 0, 450, false);
	components[6] = new Component("bottom wall - right", 300, 50, "black", 500, 450, false);
	components[7] = new Component("inside wall", 125, 300, "black", 175, 50, false);

	// Enemies
	enemies[0] = new Enemy("crawler", 100, 250, 32, 48, "down", true, 110, 340);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"));
	if(!found.includes("3")){
		currentItems[0] = new Items("Average Sword", "Images/items/sword2.png", 500, 350, "Attack: 20\nDefense: 0", 20,0,3);
	}
	if(!found.includes("12")){
		currentItems[1] = new Items("coins", "Images/Items/coins.png",80,80,"this coins", 0,0,12);
	}
	moveableItems[0] = new moveableItem(moveitem, 500, 350, 45, 45);
};

function generateRoom3() {
	background.src = "Images/DungeonRoomImages/sandbackground.png";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall", 50, canvas.height, "black", 750, 0, false);
	components[3] = new Component("top wall - left", 300, 50, "black", 0, 0, false);
	components[4] = new Component("top wall - right", 300, 50, "black", 500, 0, false);
	components[5] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);

	// Enemies
	enemies[0] = new Enemy("lizard", 570, 340, 32, 48, "", false, 0, 0);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"));
	if(!found.includes("4")){
		currentItems[0] = new Items("Golden Apple", "Images/items/gap.png", 500, 350, "Attack: 20\nDefense: 0", 0,0,4);
	}
};

function generateRoom4() {
	background.src = "Images/DungeonRoomImages/brownbackground.png";

	// Walls
	components[0] = new Component("left wall", 50, canvas.height, "black", 0, 0, false);
	components[1] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[2] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"));
	if(!found.includes("6")){
		currentItems[0] = new Items("Mysterious Paper", "Images/items/paper.png", 150, 150, "Code 0723", 0, 0, 6);
	}
	if(!found.includes("11")){
		currentItems[1] = new Items("coins", "Images/Items/coins.png",150,350,"this coins", 0,0,11);
	}
};

function generateRoom5() {
	background.src = "Images/DungeonRoomImages/bluebackground.png";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[3] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[4] = new Component("top wall - left", 300, 50, "black", 0, 0, false);
	components[5] = new Component("top wall - right", 300, 50, "black", 500, 0, false);
	components[6] = new Component("bottom wall", canvas.width, 150, "black", 0, 350, false);

	// Enemies
	enemies[0] = new Enemy("crawler", 260, 165, 32, 48, "down", true, 60, 275);
	enemies[1] = new Enemy("crawler", 500, 165, 32, 48, "up", true, 60, 275);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"))
	if(!found.includes("5")){
		currentItems[0] = new Items("Great Sword", "Images/items/sword3.png", 650, 100, "Attack: 30\nDefense: 0", 30,0,5);
	}
	moveableItems[0] = new moveableItem(moveitem, 650, 100, 45, 45);
};

function generateRoom6() {
	background.src = "Images/DungeonRoomImages/yellowbackground.png";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall", 50, canvas.height, "black", 750, 0, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall - left", 300, 50, "black", 0, 450, false);
	components[5] = new Component("bottom wall - right", 300, 50, "black", 500, 450, false);

	// Items
	var found = JSON.parse(sessionStorage.getItem("found"))
	if(!found.includes("7")){
		currentItems[0] = new Items("Treasure Chest", "Images/items/treasure_chest-5.png", 500, 150, "", 0,0,7);
	}
		moveableItems[0] = new moveableItem(moveitem, 450, 50, 300, 300);
};

function generateRoom7() {
	background.src = "Images/DungeonRoomImages/yellowbackground.png";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall", 50, canvas.height, "black", 750, 0, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall - left", 300, 50, "black", 0, 450, false);
	components[5] = new Component("bottom wall - right", 300, 50, "black", 500, 450, false);
}

function generateRoom8() {
	background.src = "Images/DungeonRoomImages/bluebackground.png";

	// Walls
	components[0] = new Component("left wall", 50, canvas.height, "black", 0, 0, false);
	components[1] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[2] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);

	// Enemies
	enemies[0] = new Enemy("crawler", 650, 150, 32, 48, "down", true, 60, 390);
	enemies[1] = new Enemy("crawler", 550, 150, 32, 48, "up", true, 60, 390);
	enemies[2] = new Enemy("crawler", 450, 350, 32, 48, "down", true, 60, 390);
	enemies[3] = new Enemy("crawler", 350, 100, 32, 48, "down", true, 60, 390);
	enemies[4] = new Enemy("crawler", 250, 400, 32, 48, "up", true, 60, 390);
	var found = JSON.parse(sessionStorage.getItem("found"))
	console.log(found);
	if(!found.includes("8")){
		currentItems[0] = new Items("coins", "Images/Items/coins.png",65,80,"this is key", 0,0,8);
	}
	if(!found.includes("10")){
		currentItems[1] = new Items("coins", "Images/Items/coins.png",65,400,"this is key", 0,0,10);
	}
}

function generateRoom9() {
	background.src = "Images/DungeonRoomImages/rockbackground.png";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall", 50, canvas.height, "black", 750, 0, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);

	// Enemies
	enemies[0] = new Enemy("lizard", 200, 325, 32, 48, "", false, 0, 0);
	enemies[1] = new Enemy("lizard", 200, 150, 32, 48, "", false, 0, 0);
	enemies[2] = new Enemy("lizard", 600, 100, 32, 48, "", false, 0, 0);
	enemies[3] = new Enemy("lizard", 600, 350, 32, 48, "", false, 0, 0);
}

function generateRoom10() {
	background.src = "Images/DungeonRoomImages/greenbackground.jpg";

	// Walls
	components[0] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
	components[1] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
	components[2] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[3] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[4] = new Component("top wall", canvas.width, 150, "black", 0, 0, false);
	components[5] = new Component("bottom wall", canvas.width, 150, "black", 0, 350, false);

	// Enemies
	enemies[0] = new Enemy("lizard", 400, 235, 32, 48, "", false, 0, 0);
}

function generateRoom11() {
	background.src = "Images/DungeonRoomImages/brownbackground.png";

	// Walls
	components[0] = new Component("left wall", 300, canvas.height, "black", 0, 0, false);
	components[1] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
	components[2] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
	components[3] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
	components[4] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);

	moveableItems[0] = new moveableItem(moveitem, 460, 50, 150, 150);
	moveableItems[1] = new moveableItem(moveitem, 300, 50, 150,150);
	moveableItems[2] = new moveableItem(moveitem, 620, 50, 150, 150);
	moveableItems[3] = new moveableItem(moveitem, 620, 300, 150, 150);
	moveableItems[4] = new moveableItem(moveitem, 300, 300, 150, 150);
	moveableItems[5] = new moveableItem(moveitem, 460, 300, 150, 150);

	var found = JSON.parse(sessionStorage.getItem("found"))
	console.log(found);
	if(!found.includes("1")){
		currentItems[0] = new Items("key", "Images/Items/images.png",320,80,"this is key", 5,5,1);
	}
}

function tiktok(){ //clock function
	var timespent = parseFloat(sessionStorage.getItem("time"));
	timespent+=.1;
	sessionStorage.setItem("time", timespent);
	var timer = document.getElementById("timer");
	
	
	let dateObj = new Date(timespent.toFixed(0) * 1000);
	let minutes = dateObj.getUTCMinutes();
	let seconds = dateObj.getUTCSeconds();
	
	
	
	timer.innerText = "Time: " + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
	var scorecard = document.getElementById("score");
	scorecard.innerText = "Score: " + sessionStorage.getItem("score");
	var health = document.getElementById("health");
	health.innerText = "Health: " + sessionStorage.getItem("health");
	if (sessionStorage.getItem("health") <1){
		window.location.href = 'index.html';
	}
}

// Game Framerate and Animation

let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	now = Date.now();
	elapsed = now - then;
	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		drawPlayer(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.xPos, player.yPos, player.width, player.height);
		movePlayer();
		handlePlayerFrame();
		drawComponents();
		drawEnemies();
		inventoryScreenChange();
		interact();
		tiktok();
	}
}

startAnimating(10);


/*
Walls:
components[] = new Component("left wall", 50, canvas.height, "black", 0, 0, false);
components[] = new Component("left wall - top", 50, 200, "black", 0, 0, false);
components[] = new Component("left wall - bottom", 50, 200, "black", 0, 300, false);
components[] = new Component("right wall", 50, canvas.height, "black", 750, 0, false);
components[] = new Component("right wall - top", 50, 200, "black", 750, 0, false);
components[] = new Component("right wall - bottom", 50, 200, "black", 750, 300, false);
components[] = new Component("top wall", canvas.width, 50, "black", 0, 0, false);
components[] = new Component("top wall - left", 300, 50, "black", 0, 0, false);
components[] = new Component("top wall - right", 300, 50, "black", 500, 0, false);
components[] = new Component("bottom wall", canvas.width, 50, "black", 0, 450, false);
components[] = new Component("bottom wall - left", 300, 50, "black", 0, 450, false);
components[] = new Component("bottom wall - right", 300, 50, "black", 500, 450, false);
*/
