
const iceman = {
	init() {
		// fast references
		this.board = window.find(".board");

		this.drawLevel(1);
	},
	dispatch(event) {
		switch (event.type) {
			case "keystroke":
				// player already moving - wait until move finish
				if (PLAYER.moving) return;

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
		let x = (dir === 4) ? PLAYER.x + 1 : (dir === 2) ? PLAYER.x - 1 : PLAYER.x;
		let y = (dir === 3) ? PLAYER.y + 1 : (dir === 1) ? PLAYER.y - 1 : PLAYER.y;
		let c = PLAYER.board.charAt((y * 15) + x);

		if ((x == 15 || x == -1 || y == 15 || y == -1)
			|| (parseInt(c, 10) > 0 && parseInt(c, 10) < 7 && c != PLAYER.property)) {
			PLAYER.moving = false;
			return;
		}
		
		PLAYER.moving = true;
		PLAYER.x = x;
		PLAYER.y = y;
		PLAYER.el.css({
			top: (y * 30) +"px",
			left: (x * 30) +"px"
		});

		if (~GEMS.indexOf(c)) {
			this.score(c);
		}

		setTimeout(() => iceman.move(dir), 60);
	},
	score(gem) {
		if (gem) {
			this.board.find(`.box[data-pos="${PLAYER.x}-${PLAYER.y}"]`).remove();

			PLAYER.gems.eaten++;
			PLAYER.property = parseInt(gem, 16) - 6;
			PLAYER.el.prop({
				className: "box player p"+ PLAYER.property
			});
		}
		//console.log( PLAYER.gems.eaten, PLAYER.gems.needed );
	},
	drawLevel(n) {
		let level = LEVELS[n],
			top = level.player.y * 30,
			left = level.player.x * 30,
			htm = [];

		// player element
		htm.push(`<div class="box player p${level.player.cn}" style="top: ${top}px; left: ${left}px;"></div>`);

		level.board.split("").map((b, i) => {
			if (b === "0") return;

			let x = i % 15,
				y = parseInt(i / 15, 10),
				pos = ~GEMS.indexOf(b) ? `data-pos="${x}-${y}"` : "";

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
		PLAYER.property = level.property;
		PLAYER.board = level.board;
		PLAYER.gems = {
			eaten: 0,
			needed: level.gems
		};
	}
};

window.exports = iceman;


const PLAYER = {
	el: false,
	moving: false,
	property: 0,
	x: 0,
	y: 0,
	level: 0
};

const GEMS = "789ABC";

const LEVELS = {
	1: {
		player: { x: 0, y: 0, property: 3 },
		gems: 48,
		board: "0000000000000FA10000000000000A00000000006160A00000000001A10A2AAAAAAAAAAAAAAAA0000000000402AA000000000000AAA000000000040A6A000000000040A0A000000000000A0A000000000040A0AAAAAAAAA2040A02000000000040A00000000000940A00000000944440A"
	},
	2: {
		player: { x: 14, y: 0, property: 4 },
		gems: 44,
		board: "0000000000000F010000000000000900000000006160900000000001910929999999999999999000000000040299000000000000999000000000040969000000000040909000000000000909000000000040909999999992040902000000000040A00000000000044400000000044444A"
	},
	3: {
		player: { x: 4, y: 6, property: 3 },
		gems: 15,
		board: "100000000000008100000000010000000810000010000000000810000000000000000000000000000000000100000020000000BB80000000F0000000010000000000000080000008080800808000808100010101101110000000100000000000080100000000000010100001000000000"
	},
	4: {
		player: { x: 14, y: 14, property: 3 },
		gems: 11,
		board: "600000000006000000000600000000000000AA0000000060000600000000000000600000006000000A0000000060000000000000000066660A000000060AAA06000000000066600F0000000000000000000000000000006A66000660000000AA600000000000066600060006A00600000"
	},
	5: {
		player: { x: 0, y: 0, property: 6 },
		gems: 20,
		board: "0B200000000000008000000000020008002B000000B000800000000000000000000000000000000000000000000000000000000000800000000000000008000000500000005000000000000000050000000000B0000000000B20020000000000000000000F00000000000000000500000"
	},
	6: {
		player: { x: 0, y: 0, property: 3 },
		gems: 10,
		board: "000000C0C0060030F0000000000000000002000000000C0C0090000000A00000090000000A00200090000000000000000900000000000100CCC00000000000000000050000000000000000000007000000F00A010000000000000000060000000000000000000A9A90610000000000007"
	},
	7: {
		player: { x: 14, y: 0, property: 1 },
		gems: 55,
		board: "99B080A0B080000330303303330333B0080C090C0A70055505555505505580BA0907C900800222220202222022C000C0870008000666000066666666AB0C007007000C044440444400004470B080B00C00A0011101111101101107B0909007080C0070808B0CA700B04F1010171010101"
	},
	8: {
		player: { x: 10, y: 2, property: 3 },
		gems: 28,
		board: "0A0000000200000A0A3003000900B0030C00002939B0B0000000000900B0000C0007000000000000000000A0000000000700A000000000000000A00090000000000000000000000000000000080000000C000000F000000C000000380707000C000900000030000000090000000000200"
	},
	9: {
		player: { x: 0, y: 0, property: 6 },
		gems: 12,
		board: "0000030000000B2200000040000F270200000000002010A20000000027000002000200000000000000000000000000000000000001C000050000000000A000000000040000000000000400000200000000007082090A000200000200000000020002000000200002006008000F000004A"
	},
	10: {
		player: { x: 14, y: 0, property: 1 },
		gems: 146,
		board: "999999919999990999999999999999991999999919999999991999999999991999999999999999999919991991999999999999999199991999991999999F99999199999999999991999999999999999999919919919999999999999199991999999999999999991911199999999999999"
	},
	11: {
		player: { x: 0, y: 14, property: 6 },
		gems: 20,
		board: "200000000930098A400000000000A2000000000000000000000000000000000200000000000800A000B0B20000600000240000000C00C00402000000500000420000000B00002000040000200000400200000800000000000000302A000000000A8900000000007010F60000BB0000000"
	},
	12: {
		player: { x: 10, y: 7, property: 3 },
		gems: 20,
		board: "F30000000000000020000000030000400000000000004A00000000A00010901000000100000900000000000000900000000000000900003B00000730900000000000000900000000000000908000000000000902202000000A0290B2000000300009BB200600000050B22000000000000"
	},
	13: {
		player: { x: 8, y: 18, property: 8 },
		gems: 30,
		board: "47940440B4444484774040400049994A740404500433344440441000400A400404040001000400404140004000400404400444449A0709080A08090A60606060606A6060009009090090000000002000000000000000000000003000200F002000300008200028000000300A222A00200"
	},
	14: {
		player: { x: 0, y: 0, property: 3 },
		gems: 19,
		board: "000000500000000050000000000000AF0005000000000900000000000000800000000000005000000000000000000000000005000C000000000000000000000000000000C00000000000C022000000444444492000000403A4A792000000400A10992000000409914482500000400710A"
	},
	15: {
		player: { x: 0, y: 0, property: 3 },
		gems: 5,
		board: "00555000002200F100050000020008110000000000008000060000000008A006600030000014000000330000014402200000000110000200000000333300000000000030300000000000000300000000000000010000B0005004001100000055044550000000060000050000000660000"
	},
	16: {
		player: { x: 0, y: 0, property: 6 },
		gems: 27,
		board: "06B571A40203C6C660591040203066B005719402030CC555333333333633B0930000000000811130222222262288020200000000044430204444464400030204000001022230244011161190820204010088B333302040105555C0060604018500B6603020401850660603020601B5C6F"
	},
	17: {
		player: { x: 1, y: 0, property: 2 },
		gems: 9,
		board: "C066C3333333C6600600002000000700206633333660100206000020062100228066366010100202060006010100202220F0101010020206092121010020C06660701010020600200601210020664446601010062000000206010066444444A1601600002000002006664444444444466"
	},
	18: {
		player: { x: 14, y: 14, property: 3 },
		gems: 18,
		board: "3333333A1111766003000040100500003000040100500C030000401005000090000B0100500004000055822B22C04000050100603004000050100603004000050100603C040000A010060300444444474444A0040000C050000366A666665500003005000010500003B000B0B005A444F"
	},
	19: {
		player: { x: 0, y: 0, property: 2 },
		gems: 12,
		board: "0000000200002B80000000000000020205000200000002B0000000B0000F000B20000200000000200000800002000000002000000000000B50000000002B00000000000000000000000080000002000000020020000000000000005B0000000000B000200800000005200000500000000"
	},
	20: {
		player: { x: 7, y: 8, property: 4 },
		gems: 77,
		board: "88888880000000F82222280000000088000288880CCCC007102222206666007100000006CCC007170C66666C000071770CCC0390000711170B00390000777170B50399900007170B50333900007170B50003900AA010A05BB03900A444440555039AAA4AAAA0BB50394444A00000B5099"
	}
}
