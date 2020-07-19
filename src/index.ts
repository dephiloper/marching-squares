import * as PIXI from "pixi.js";
import { makeNoise3D } from "open-simplex-noise";

const app = new PIXI.Application({width: 600, height: 400, antialias: false, backgroundColor: 0xb0b0b0, clearBeforeRender: true});
document.body.appendChild(app.view);

const resolution = 10;
const columns: number = 1 + app.view.width / resolution;
const rows: number = 1 + app.view.height / resolution;
const fields: number[][] = [];
const noise3D = makeNoise3D(Date.now());
let zoff = 0;

class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

}

function calculateState(ul: number, ur: number, br: number, bl: number) {
    return (ul << 3) + (ur << 2) + (br << 1) + bl;
}

function drawCorner(col: number, row: number, val: number) {
    const circle = new PIXI.Graphics();
    let color = Math.round(val * 255)
    color = (color << 16) + (color << 8) + color;
    circle.beginFill(color);
    circle.drawCircle(col * resolution, row * resolution, 2);
    circle.endFill();
    app.stage.addChild(circle);
}

function drawLine(a: Vector2, b: Vector2) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, 0xffffff);
    line.moveTo(a.x, a.y);
    line.lineTo(b.x, b.y);
    app.stage.addChild(line);
}

function drawLines(col: number, row: number, state: number) {
    const x = col * resolution;
    const y = row * resolution;
    const a = new Vector2(x + resolution * 0.5, y); // top edge
    const b = new Vector2(x + resolution, y + resolution * 0.5); // right edge
    const c = new Vector2(x + resolution * 0.5, y + resolution); // bottom edge
    const d = new Vector2(x, y + resolution * 0.5); // left edge
    
    // look up state configuration
    switch (state) {
        case 1:
        case 14:
            drawLine(c, d);
            break;
        case 2:
        case 13:
            drawLine(b, c);
            break;
        case 3:
        case 12:
            drawLine(b, d);
            break;
        case 4:
        case 11:
            drawLine(a, b);
            break;
        case 5:
            drawLine(a, d);
            drawLine(b, c);
            break;
        case 6:
        case 9:
            drawLine(a, c);
            break;
        case 7:
        case 8:
            drawLine(a, d);
            break;
        case 10:
            drawLine(a, b);
            drawLine(c, d);
            break;
    }
}

function gameLoop(_delta: number) {
    app.stage.removeChildren();
    let xoff = 0;
    for (let col = 0; col < columns; col++) {
        let yoff = 0;
        fields[col] = [];
        for (let row = 0; row < rows; row++) {
            fields[col][row] = noise3D(xoff, yoff, zoff);
            drawCorner(col, row, fields[col][row]);
            yoff += 0.1;
            if (col > 0 && row > 0) {
                const state = calculateState(Math.ceil(fields[col - 1][row - 1]), Math.ceil(fields[col][row - 1]), Math.ceil(fields[col][row]), Math.ceil(fields[col - 1][row]));
                drawLines(col - 1, row - 1, state);
            }
        }
        xoff += 0.1;
    }

    zoff += 0.01 * _delta;
}

app.ticker.add(delta => gameLoop(delta));