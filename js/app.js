// Get element position:
function getOffset(el) {
	return {
		top: el.offsetTop,
		left: el.offsetLeft,
		bottom: el.offsetTop + el.offsetHeight,
		right: el.offsetLeft + el.offsetWidth
	};
}

// Which keys are pressed:
var keys = {
	left: false,
	right: false,
	up: false,
	down: false
};

// Keydown listener
document.body.addEventListener('keydown', function(e) {
	e = e.keyCode;
	if (e === 37) keys.left  = true;
	if (e === 39) keys.right = true;
	if (e === 38) keys.up    = true;
	if (e === 40) keys.down  = true;
});

// Keyup listener
document.body.addEventListener('keyup', function(e) {
	e = e.keyCode;
	if (e === 37) keys.left  = false;
	if (e === 39) keys.right = false;
	if (e === 38) keys.up    = false;
	if (e === 40) keys.down  = false;
});


// Game constructor:
var Game = function(viewportEl) {
	var cs = getComputedStyle(viewportEl);

	// Starting values:
	this.score = 0;
	this.finished = false;
	this.player = {};
	this.step = 2;

	// Viewport element & dimensions:
	this.viewport = {
		el: viewportEl,
		width:  parseInt(cs.width,  10),
		height: parseInt(cs.height, 10)
	};

	// Grab necessary game elements:
	this.solidEls  = qsa('.solid',  viewportEl);
	this.coinEls   = qsa('.coin',   viewportEl);
	this.scoreEls  = qsa('.score',  viewportEl);
	this.finishI  =  sudo.indexOf(this.solidEls, qs(".finish", viewportEl));
	this.player.el =  qs(".player", viewportEl);
	
	// Cache positions of solids:
	this.solids = sudo.map(this.solidEls, getOffset);
	
	// Cache coin positions:
	this.coins = sudo.map(this.coinEls, getOffset);

	// Cache player position:
	this.player.pos = getOffset(this.player.el);

	// Setup interval. Delay controlls tickrate:
	this.frameRefresher = createInterval(function() {
		this.movTick();
	}, 10, this);
	
	this.frameRefresher.start();
};


// Update score:
Game.prototype.setScore = function(method, amount) {
	if (method === 'add') this.score += amount;
	else                  this.score -= amount;

	sudo.forEach(this.scoreEls, function(scoreEl) {
		scoreEl.textContent = this.score;
	}, this);
};


// Checks if an element is inside its viewport:
Game.prototype.insideGameArea = function(offset) {
	return !(
		offset.left < 0 ||
		offset.top  < 0 ||
		offset.right  > this.viewport.width ||
		offset.bottom > this.viewport.height
	);
};

// Checks if element a overlaps element b
Game.prototype.elOverlap = function(a, b) {	
	// a and b overlap if a is not left, right, above, or below b:
	return !(
		// Is a to the left of b?
		a.right <= b.left ||
		//b.left >= a.right ||

		// Is a to the right of b?
		b.right <= a.left ||

		// Is a above b?
		a.bottom <= b.top ||
		//b.top >= a.bottom ||

		// Is a below b?
		b.bottom <= a.top
	);
};


// Move one pixel for each direction and check if move is valid.
Game.prototype.movTick = function() {
	var moved = false;
	var t = this;
	
	var offset = {
		top: t.player.pos.top,
		left: t.player.pos.left,
		bottom: t.player.pos.bottom,
		right: t.player.pos.right
	};

	if (!(keys.up && keys.down)) {
		if      (keys.up)    { offset.top -= t.step; offset.bottom -= t.step; moved = true; }
		else if (keys.down)  { offset.top += t.step; offset.bottom += t.step; moved = true; }
	}
	if (!(keys.left && keys.right)) {
		if      (keys.left)  { offset.left -= t.step; offset.right -= t.step; moved = true; }
		else if (keys.right) { offset.left += t.step; offset.right += t.step; moved = true; }
	}

	if (!moved) return;
	var moveAllowed = true;

	// Check if move is inside the game area:
	if (t.insideGameArea(offset)) {

		// Solid collision:
		sudo.forEach(t.solids, function(solidPos, i) {
			if (this.elOverlap(offset, solidPos)) {
				moveAllowed = false; // Checks if there is any overlap on a solid object.

				// Finish collision:
				if (!this.finished && i === this.finishI) {
					this.setScore('add', 250);
					this.finished = true;
				}
			}
		}, t);

		// Coin collision:
		sudo.forEach(t.coins, function(coinPos, i) {
			if (this.elOverlap(offset, coinPos)) {
				this.setScore('add', 50);
				delete this.coins[i];
				this.coinEls[i].parentNode.removeChild(this.coinEls[i]);
			}
		}, t);

	} else {
		moveAllowed = false;
	}

	var ps = t.player.el.style;
	if (moveAllowed) { // Move player:
		ps.left = offset.left + 'px';
		ps.top  = offset.top + 'px';
		t.player.pos = offset;
	}
};


// Create a game:
var game = new Game(qs(".game"));