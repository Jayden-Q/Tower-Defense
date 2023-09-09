import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class CameraController {
    constructor(camera) {
        this._camera = camera;

        this._pan_speed = 1.0;
        this._keys = {};
        this._scroll_amount = 0;
        this._should_scroll = false;

        this._forward = new THREE.Vector3(0, 0, -1);
        this._sideways = new THREE.Vector3(1, 0, 0);
        this._direction = new THREE.Vector3();

        window.addEventListener("keydown", e => this._keys[e.code] = true);
        window.addEventListener("keyup", e => this._keys[e.code] = false);
        window.addEventListener("wheel", e => this.Zoom(e));
    }

    Zoom(e) {
        const amount = -e.deltaY;

        const direction = this.GetForwardVector().multiplyScalar(amount * 10.0);
        const newPos = this._camera.position.clone().add(direction);
        this._camera.position.lerp(newPos, 0.001);
    }

    GetForwardVector() {
        this._camera.getWorldDirection(this._direction);
        this._direction.normalize();
        return this._direction;
    }

    Update(t) {
        const direction = new THREE.Vector3();

        if (this._keys["KeyW"]) direction.add(this._forward);
        if (this._keys["KeyS"]) direction.sub(this._forward);
        if (this._keys["KeyA"]) direction.sub(this._sideways);
        if (this._keys["KeyD"]) direction.add(this._sideways);

        this._camera.position.add(direction.normalize().multiplyScalar(25.0 * t * this._pan_speed));
    }
}

export default CameraController;