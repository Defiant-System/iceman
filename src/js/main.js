
@import "test.js"


import { PLAYER, GEMS, LEVELS } from "./constants"


// default settings
const defaultSettings = {
	"level": 0,
};


const iceman = {
	init() {
		// fast references
		this.content = window.find("content");
		this.board = window.find(".board");
		this.toolLevel = window.find(".toolbar-info .level b");
		this.toolGems = window.find(".toolbar-info .gems b");

		// init settings
		this.dispatch({ type: "init-settings" });
	},
	dispatch(event) {
		let Self = iceman,
			value;
		switch (event.type) {
			// system events
			case "window.close":
				// save settings
				window.settings.setItem("settings", Self.settings);
				break;
			case "window.keystroke":
				// player already moving - wait until move finish
				if (PLAYER.moving) return;
				PLAYER.moving = true;

				switch (event.char) {
					case "up":    Self.move(1); break;
					case "down":  Self.move(3); break;
					case "left":  Self.move(2); break;
					case "right": Self.move(4); break;
				}
				break;
			// custom events
			case "init-settings":
				// get settings, if any
				Self.settings = window.settings.getItem("settings") || defaultSettings;

				PLAYER.level = Self.settings.level;
				Self.dispatch({ type: "next-level" });
				break;
			case "toggle-music":
				if (window.midi.playing) {
					window.midi.pause();
				} else {
					window.midi.play({
						path: "~/midi/Carlos Gardel - Por Una Cabeza.mid",
						reverb: "cathedral",
						loop: true,
					});
					return true;
				}
				break;
			case "level-completed":
				// next level
				Self.content.addClass("game-won");
				break;
			case "next-level":
				Self.content.addClass("hide-game-won");
				Self.board.cssSequence("black-out", "transitionend", el => {
					Self.content.removeClass("game-won hide-game-won");

					Self.settings.level = PLAYER.level;

					PLAYER.level++;
					Self.drawLevel(PLAYER.level);

					el.removeClass("black-out");
				});
				break;
			case "start-level":
			case "restart-level":
				value = event.arg || PLAYER.level;
				Self.content.removeClass("game-won hide-game-won");
				Self.drawLevel(value);
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	move(dir) {
		// look in to the "future"
		this.vector = { ...PLAYER, timeline: [] };
		this.getVector(dir);

		// calculate distance in order to calc movement speed
		this.vector.distance = Math.abs(PLAYER.x - this.vector.x || PLAYER.y - this.vector.y);
		
		// player not moving - reset
		if (!this.vector.distance) return PLAYER.moving = false;

		PLAYER.x = this.vector.x;
		PLAYER.y = this.vector.y;
		PLAYER.el
			.cssSequence("moving", "transitionend", el => {
				el.removeClass("moving");
				PLAYER.moving = false;

				// check for level exit
				if (this.vector.c === 'F' && this.vector.gems.eaten === this.vector.gems.needed) {
					PLAYER.el.cssSequence("exit", "animationend", el => {
						this.dispatch({type: "level-completed"});
					});
					return;
				}
			})
			.css({
				"--speed": `${this.vector.distance * PLAYER.speed || 1}ms`,
				top: (PLAYER.y * 30) +"px",
				left: (PLAYER.x * 30) +"px"
			});

		// playback timeline
		this.vector.timeline.map(event =>
			event.el
				.cssSequence("vanish", "transitionend", el => event.action())
				.css({
					"--delay": `${event.distance * PLAYER.speed}ms`,
					top: (event.y * 30) +"px",
					left: (event.x * 30) +"px"
				}));
	},
	getVector(dir) {
		let x = (dir === 4) ? this.vector.x + 1 : (dir === 2) ? this.vector.x - 1 : this.vector.x;
		let y = (dir === 3) ? this.vector.y + 1 : (dir === 1) ? this.vector.y - 1 : this.vector.y;
		let c = this.vector.map.charAt((y * 15) + x);
		if ((x == 15 || x == -1 || y == 15 || y == -1)
			|| (parseInt(c, 10) > 0 && parseInt(c, 10) < 7 && c != this.vector.property)) {
			return;
		}

		// update this.vector
		this.vector.x = x;
		this.vector.y = y;
		this.vector.c = c;

		if (c === "F" && this.board.find(".box.bF").hasClass("exit-open")) return;
		
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
					PLAYER.map = PLAYER.map.slice(0, pos) +"0"+ PLAYER.map.slice(pos + 1);
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
		htm.push(`<div class="box player p${level.player.property}" style="top: 210px; left: 210px;" data-start="${top},${left}"></div>`);

		// level map
		level.map.split("").map((b, i) => {
			if (b === "0") return;

			let x = i % 15,
				y = parseInt(i / 15, 10),
				gem = GEMS.indexOf(b) > -1 ? `data-gem="${y}-${x}"` : "";

			htm.push(`<div class="box b${b}" style="top: ${y * 30}px; left: ${x * 30}px;" ${gem}></div>`);
		});

		// covers
		level.map.split("").map((b, i) => {
			let x = i % 15,
				y = parseInt(i / 15, 10),
				cover = Math.max(Math.abs(7-y), Math.abs(7-x));
			
			htm.push(`<div class="cover" style="top: ${y * 30}px; left: ${x * 30}px;" data-num="${cover + 1}"></div>`);
		});

		// reset board
		this.board.html(htm.join(""));

		// uncover level map
		this.board.find(".cover").cssSequence("uncover", "animationend", el => el.remove());

		// reset player
		PLAYER.el = this.board.find(".player");
		PLAYER.y = level.player.y;
		PLAYER.x = level.player.x;
		PLAYER.level = n;
		PLAYER.moving = true;
		PLAYER.property = level.player.property;
		PLAYER.map = level.map;
		PLAYER.gems = {
			eaten: 0,
			needed: level.gems
		};
		// set user UI property
		PLAYER.el.prop({className: "box player p"+ PLAYER.property});
		
		setTimeout(() => PLAYER.el
			.cssSequence("bounce", "animationend", el => el.removeClass("bounce"))
			.cssSequence("landing", "animationend", el => {
				el.removeClass("landing");
				// game can be played
				PLAYER.moving = false;
			})
			.css({
				top: top +"px",
				left: left +"px",
			}), 60);

		// update toolbar
		this.toolLevel.html(n);
		this.toolGems.html(PLAYER.gems.eaten +" / "+ PLAYER.gems.needed);
	}
};

window.exports = iceman;
