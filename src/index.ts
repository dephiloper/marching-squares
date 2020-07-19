import * as PIXI from "pixi.js";

let app = new PIXI.Application({width: 512, height: 512, antialias: true, transparent: true, backgroundColor: 0xffffff});
document.body.appendChild(app.view);
