import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class HealthBar {
    constructor() { this.Initialize() }

    Initialize() {
        this._element = document.createElement("canvas");
        this._ctx = this._element.getContext("2d");
        this._ctx.canvas.width = 100;
        this._ctx.canvas.height = 5;
        this._ctx.fillStyle = "#FF0000";
        this._ctx.textAlign = "center";
        this._x = 0;
        this._y = 0;
        this._width = 100;
        this._height = 2;

        this._sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(this._ctx.canvas),
                color: 0xFFFFFF
            })
        );
        this._sprite.scale.set(4, 1, 1);
    }

    Draw(healthAmount) {
        const hp = this._width * (healthAmount * 0.01);
        this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
        this._ctx.beginPath();
        this._ctx.rect(this._x, this._y, hp, this._height);
        this._ctx.closePath();
        this._ctx.fill();
        this._sprite.material.map.needsUpdate = true;
    }

    Dispose() {
        this._sprite.traverse(c => {
            if (c.material) {
                let materials = c.material;
                if (!(c.material instanceof Array)) {
                    materials = [c.material];
                }
                for (let i = 0; i < materials.length; i++) materials[i].dispose();
            }

            if (c.geometry) c.geometry.dispose();
        });
    }
}

export default HealthBar;