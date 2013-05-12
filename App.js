// Array-like object to Array:
function toArray(o) {
	for (var a = [], l=o.length; l--;) a[l] = o[l];
	return a;
}

// Get elements by CSS selector
function $$(s, el) {
	return toArray( (el || document).querySelectorAll(s) );
}
function $(s, el) {
	return (el || document).querySelector(s);
}

// Event listening:
Element.prototype.on = Element.prototype.addEventListener;

// Which keys are pressed:
var keys = {
	left: false,
	right: false,
	up: false,
	down: false
};

// Keydown listener
document.body.on('keydown', function(e) {
	e = e.keyCode;
	if (e === 37) keys.left  = true;
	if (e === 39) keys.right = true;
	if (e === 38) keys.up    = true;
	if (e === 40) keys.down  = true;
});

// Keyup listener
document.body.on('keyup', function(e) {
	e = e.keyCode;
	if (e === 37) keys.left  = false;
	if (e === 39) keys.right = false;
	if (e === 38) keys.up    = false;
	if (e === 40) keys.down  = false;
});


// Game constructor:
var Game = function(viewportEl) {
	var t = this;
	var cs = getComputedStyle(viewportEl);

	// Starting values:
	t.score = 0;
	this.finished = false;
	t.player = {};

	// Viewport element & dimensions:
	t.viewport = {
		el: viewportEl,
		width:  parseInt(cs.width,  10),
		height: parseInt(cs.height, 10)
	};

	// Grab necessary game elements:
	t.solidEls  = $$('.solid',  viewportEl);
	t.coinEls   = $$('.coin',   viewportEl);
	t.scoreEls  = $$('.score',  viewportEl);
	t.finishEl  =  $(".finish", viewportEl);
	t.player.el =  $(".player", viewportEl);

	// Player position data:
	var playerCS = getComputedStyle(t.player.el);
	t.player.x = parseInt(playerCS.left, 10);
	t.player.y = parseInt(playerCS.top, 10);
	t.player.width  = parseInt(playerCS.width, 10);
	t.player.height = parseInt(playerCS.height, 10);

	// Adds a new div.tmp-move which is used to calculate whenever the player is allowed to move:
	t.tmpMovEl = document.createElement('div');
	t.tmpMovEl.className = "tmp-move";
	t.viewport.el.insertBefore(t.tmpMovEl, t.viewport.el.firstChild);
	t.tmpMovEl.style.left = t.player.x + 'px';
	t.tmpMovEl.style.top = t.player.y + 'px';
	t.tmpMovEl.style.width = t.player.width + 'px';
	t.tmpMovEl.style.height = t.player.height + 'px';

	// Setup interval. Delay controlls tickrate:
	setInterval(function() {
		t.movTick();
	}, 10);
};


// Update score:
Game.prototype.setScore = function(method, amount) {
	if (method === 'add') this.score += amount;
	else                  this.score -= amount;

	this.scoreEls.forEach(function(scoreEl) {
		scoreEl.textContent = this.score;
	}, this);
};


// Checks if a is inside b:
Game.prototype.insideGameArea = function(a, b) {

	// Player position:
	var aX = a.offsetLeft;
	var aY = a.offsetTop;

	return !(
		aX < 0 ||
		aY < 0 ||
		aX + this.player.width  > this.viewport.width ||
		aY + this.player.height > this.viewport.height
	);
};

// Checks if element a overlaps element b
Game.prototype.elOverlap = function(a, b) {
	var aX = a.offsetLeft;
	var aY = a.offsetTop;
	var bX = b.offsetLeft;
	var bY = b.offsetTop;

	// a and b overlap if a is not left, right, above, or below b:
	return !(
		// Is a to the left of b?
		bX >= aX + a.offsetWidth ||

		// Is a to the right of b?
		bX + b.offsetWidth <= aX ||

		// Is a above b?
		bY >= aY + a.offsetHeight ||

		// Is a below b?
		bY + b.offsetHeight <= aY
	);
};


// Move one pixel for each direction and check if move is valid.
Game.prototype.movTick = function() {
	var moved = false;
	var s  = this.tmpMovEl.style;
	var tCS = getComputedStyle(this.tmpMovEl);

	if (!(keys.up && keys.down)) {
		if (keys.up)    { s.top  = parseInt(tCS.top,  10) - 1 + 'px'; moved = true; }
		if (keys.down)  { s.top  = parseInt(tCS.top,  10) + 1 + 'px'; moved = true; }
	}
	if (!(keys.left && keys.right)) {
		if (keys.left)  { s.left = parseInt(tCS.left, 10) - 1 + 'px'; moved = true; }
		if (keys.right) { s.left = parseInt(tCS.left, 10) + 1 + 'px'; moved = true; }
	}

	if (!moved) return;
	var moveAllowed = true;

	// Check if move is inside the game area:
	if (!this.insideGameArea(this.tmpMovEl, this.viewport.el)) moveAllowed = false;

	// Solid collision:
	this.solidEls.forEach(function(solidEl) {
		if (this.elOverlap(this.tmpMovEl, solidEl)) moveAllowed = false; // Checks if there is any overlap on a solid object.
	}, this);

	// Coin collision:
	this.coinEls.forEach(function(coinEl) {
		if (this.elOverlap(this.tmpMovEl, coinEl)) {
			this.setScore('add', 50);
			coinEl.parentNode.removeChild(coinEl);
		}
	}, this);

	// Finish collision:
	if (!this.finished && this.elOverlap(this.tmpMovEl, this.finishEl)) {
		this.setScore('add', 250);
		this.finished = true;
	}

	var ps = this.player.el.style,
		ts = this.tmpMovEl.style;
		pCS = getComputedStyle(this.player.el);
	if (moveAllowed) { // Move player:
		ps.left = tCS.left;
		ps.top  = tCS.top;
	} else { // Reset the tmpMovEl to last location:
		ts.left = pCS.left;
		ts.top  = pCS.top;
	}
};


// Create a game:
var game = new Game($(".game"));
