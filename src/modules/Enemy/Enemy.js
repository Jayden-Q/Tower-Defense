import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import HealthBar from './Healthbar.js';

class Enemy {
    constructor(points) {
        this._points = points;
        this._points_index = 0;
        this._speed = 1.0;
        this._original_health = 100;
        this._health = 100;
        this._has_reached_end = false;
        this._is_dead = false;
        this._direction = new THREE.Vector3();
        this._position_offset = new THREE.Vector3(0, 1, 0);
        this._worth = 2;
        
        this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(3, 3, 3),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        this._mesh.receiveShadow = true;
        this._mesh.castShadow = true;

        this._health_bar = new HealthBar();
        this._health_bar.Draw(this._health);
    }

    SetHealth(health) {
        this._health = health;
        this._original_health = this._health;
        this._health_bar.Draw((this._health / this._original_health) * 100);
    }

    DecreaseHealth(damage) {
        this._health -= damage;
 
        this._health_bar.Draw((this._health / this._original_health) * 100);

        if (this._health <= 0) this._is_dead = true;
    } 

    SetPosition(position) {
        const newPos = position.clone().add(this._position_offset);
        this._mesh.position.copy(newPos);
    }

    StartJourney(t) {
        if (this._has_reached_end || this._is_dead) return;
        if (this._points_index == this._points.length) {
            this._has_reached_end = true;
            return;
        }

        const point = this._points[this._points_index];
    
        this._direction.subVectors(point, this._mesh.position).normalize();
        this._direction.y = 0;

        this._mesh.position.add(this._direction.multiplyScalar(t * 10.0 * this._speed));

        this._health_bar._sprite.position.copy(this._mesh.position);
        this._health_bar._sprite.position.y += 3;

       if (this._mesh.position.distanceTo(point) <= 1.5) this._points_index++;
    }

    Dispose() {
        this._health_bar.Dispose();
        this._mesh.traverse(c => {
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

class NormalEnemy extends Enemy {
    constructor(points) {
        super(points);

        this._speed = 1.0;
        this._health = 135;
        this._worth = 2;

        this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(3, 3, 3),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
    }
}

class FastEnemy extends Enemy {
    constructor(points) {
        super(points);

        this._speed = 1.5;
        this._health = 95;
        this._worth = 1;

        this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(2.5, 2.5, 2.5),
            new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
        );
    }
}

class ToughEnemy extends Enemy {
    constructor(points) {
        super(points);

        this._speed = 0.5;
        this._health = 400;
        this._worth = 5;

        this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(4, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0xFF0000 })
        );
    }
}

export { NormalEnemy, FastEnemy, ToughEnemy };