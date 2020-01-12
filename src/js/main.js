
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
		let vector = { ...PLAYER, timeline: [] };
		let getVector = (dir) => {
			let x = (dir === 4) ? vector.x + 1 : (dir === 2) ? vector.x - 1 : vector.x;
			let y = (dir === 3) ? vector.y + 1 : (dir === 1) ? vector.y - 1 : vector.y;
			let c = vector.board.charAt((y * 15) + x);
			if ((x == 15 || x == -1 || y == 15 || y == -1)
				|| (parseInt(c, 10) > 0 && parseInt(c, 10) < 7 && c != vector.property)) {
				return;
			}
			// update vector
			vector.x = x;
			vector.y = y;

			// check for level exit
			if (c === 'F' && vector.gems.eaten === vector.gems.needed) {
				vector.finished = true; // Level finished
				return;
			}
			
			// check for gems on path
			if (GEMS.indexOf(c) > -1) {
				let el = this.board.find(`.box[data-pos="${vector.x}-${vector.y}"]`);
				let distance = Math.abs(PLAYER.x - vector.x || PLAYER.y - vector.y);
				let pos = (vector.y * 15) + vector.x;
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

						// update toolbar
						this.toolGems.html(PLAYER.gems.eaten +" / "+ PLAYER.gems.needed);
					};

				// save for timeline
				vector.timeline.push({ el, distance, action, x: vector.x, y: vector.y });
			}
			getVector(dir);
		};
		getVector(dir);

		// calculate distance in order to calc movement speed
		vector.distance = Math.abs(PLAYER.x - vector.x || PLAYER.y - vector.y);

		PLAYER.x = vector.x;
		PLAYER.y = vector.y;
		PLAYER.el
			.cssSequence("moving", "transitionend", el => {
				el.removeClass("moving");
				PLAYER.moving = false;
				
				if (vector.finished) {
					console.log("finished")
				}
			})
			.prop({style: `--speed: ${vector.distance * PLAYER.speed}ms`})
			.css({
				top: (PLAYER.y * 30) +"px",
				left: (PLAYER.x * 30) +"px"
			});

		// eat gems timeline
		vector.timeline.map(event =>
			event.el
				.prop({style: `--delay: ${event.distance * PLAYER.speed}ms`})
				.cssSequence("vanish", "transitionend", el => event.action())
				.css({
					top: (event.y * 30) +"px",
					left: (event.x * 30) +"px"
				}));
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
				pos = GEMS.indexOf(b) > -1 ? `data-pos="${x}-${y}"` : "";

			htm.push(`<div class="box b${b}" style="top: ${y * 30}px; left: ${x * 30}px;" ${pos}></div>`);
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
