
const iceman = {
	init() {
		
	},
	dispatch(event) {
		switch (event.type) {
			case "keystroke":
				switch (event.char) {
					case "up":    this.gameManager.move(0); break;
					case "down":  this.gameManager.move(2); break;
					case "left":  this.gameManager.move(3); break;
					case "right": this.gameManager.move(1); break;
				}
				break;
			case "restart":
				break;
		}
	}
};

window.exports = iceman;
