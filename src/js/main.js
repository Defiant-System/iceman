
import { PLAYER, GEMS, LEVELS } from "./constants"

const iceman = {
	init() {
		// fast references
		this.board = window.find(".board");
		this.toolLevel = window.find(".toolbar-info .level b");
		this.toolGems = window.find(".toolbar-info .gems b");

		this.drawLevel(1);
	},
	dispatch(event) {
		switch (event.type) {
			case "keystroke":
				// player already moving - wait until move finish
				if (PLAYER.moving) return;
				PLAYER.moving = true;

				switch (event.char) {
					case "up":    this.move(1); break;
					case "down":  this.move(3); break;
					case "left":  this.move(2); break;
					case "right": this.move(4); break;
				}
				break;
			case "restart-level":
				this.drawLevel(PLAYER.level);
				break;
		}
	},
	move(dir) {
		// look in to the "future"
		this.vector = { ...PLAYER, timeline: [] };
		this.getVector(dir);

		// calculate distance in order to calc movement speed
		this.vector.distance = Math.abs(PLAYER.x - this.vector.x || PLAYER.y - this.vector.y);

		PLAYER.x = this.vector.x;
		PLAYER.y = this.vector.y;
		PLAYER.el
			.cssSequence("moving", "transitionend", el => {
				el.removeClass("moving");
				PLAYER.moving = false;

				if (this.vector.finished) {
					PLAYER.el.cssSequence("exit", "animationend", el => {
						// next level
					});
				}
			})
			.prop({style: `--speed: ${this.vector.distance * PLAYER.speed}ms`})
			.css({
				top: (PLAYER.y * 30) +"px",
				left: (PLAYER.x * 30) +"px"
			});

		// playback timeline
		this.vector.timeline.map(event =>
			event.el
				.prop({style: `--delay: ${event.distance * PLAYER.speed}ms`})
				.cssSequence("vanish", "transitionend", el => event.action())
				.css({
					top: (event.y * 30) +"px",
					left: (event.x * 30) +"px"
				}));
	},
	getVector(dir) {
		let x = (dir === 4) ? this.vector.x + 1 : (dir === 2) ? this.vector.x - 1 : this.vector.x;
		let y = (dir === 3) ? this.vector.y + 1 : (dir === 1) ? this.vector.y - 1 : this.vector.y;
		let c = this.vector.board.charAt((y * 15) + x);
		if ((x == 15 || x == -1 || y == 15 || y == -1)
			|| (parseInt(c, 10) > 0 && parseInt(c, 10) < 7 && c != this.vector.property)) {
			return;
		}

		// update this.vector
		this.vector.x = x;
		this.vector.y = y;

		// check for level exit
		if (c === 'F' && this.vector.gems.eaten === this.vector.gems.needed) {
			this.vector.finished = true; // Level finished
			return;
		}
		
		// check for gems on path
		if (GEMS.indexOf(c) > -1) {
			let el = this.board.find(`.box[data-gem="${this.vector.y}-${this.vector.x}"]`);
			let distance = Math.abs(PLAYER.x - this.vector.x || PLAYER.y - this.vector.y);
			let pos = (this.vector.y * 15) + this.vector.x;
			let action = () => {
					let property = PLAYER.property;

					// remove gem from DOM
					el.remove()

					// update player
					PLAYER.board = PLAYER.board.slice(0, pos) +"0"+ PLAYER.board.slice(pos + 1);
					PLAYER.gems.eaten++;
					PLAYER.property = parseInt(c, 16) - 6;

					// set user UI property
					PLAYER.el
						.removeClass("p"+ property)
						.addClass("p"+ PLAYER.property);

					if (PLAYER.gems.eaten === PLAYER.gems.needed) {
						this.board.find(".box.bF").addClass("exit-open");
					}

					// update toolbar
					this.toolGems.html(PLAYER.gems.eaten +" / "+ PLAYER.gems.needed);
				};

			// change vector property
			this.vector.property = parseInt(c, 16) - 6;

			// save for timeline
			this.vector.timeline.push({ el, distance, action, x: this.vector.x, y: this.vector.y });
		}
		this.getVector(dir);
	},
	drawLevel(n) {
		let level = LEVELS[n],
			top = level.player.y * 30,
			left = level.player.x * 30,
			htm = [];

		// player element
		htm.push(`<div class="box player p${level.player.property}" style="top: ${top}px; left: ${left}px;"></div>`);

		level.board.split("").map((b, i) => {
			if (b === "0") return;

			let x = i % 15,
				y = parseInt(i / 15, 10),
				gem = GEMS.indexOf(b) > -1 ? `data-gem="${y}-${x}"` : "",
				appear = Math.max(Math.abs(7-y), Math.abs(7-x));

			htm.push(`<div class="box b${b}" data-appear="${appear + 1}" style="top: ${y * 30}px; left: ${x * 30}px;" ${gem}></div>`);
		});

		// reset board
		this.board.html(htm.join(""));

		// reset player
		PLAYER.el = this.board.find(".player");
		PLAYER.y = level.player.y;
		PLAYER.x = level.player.x;
		PLAYER.level = n;
		PLAYER.moving = false;
		PLAYER.property = level.player.property;
		PLAYER.board = level.board;
		PLAYER.gems = {
			eaten: 0,
			needed: level.gems
		};
		// set user UI property
		PLAYER.el.prop({className: "box player p"+ PLAYER.property});

		// update toolbar
		this.toolLevel.html(n);
		this.toolGems.html(PLAYER.gems.eaten +" / "+ PLAYER.gems.needed);
	}
};

window.exports = iceman;
