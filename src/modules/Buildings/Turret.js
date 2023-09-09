import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class Turret {
    static Cost;
    static Type;

    constructor(enemiesList) {
        this._enemies_list = enemiesList;
        this._enemies_in_range = [];
        this._range = 15;
        this._shoot_delay = 500;
        this._damage = 15;
        this._can_shoot = true;
        this._projectiles = [];

        this._position_offset = new THREE.Vector3();
        this._cur_look_at = new THREE.Vector3();

        this._mesh = null;
        this._target_rotate = null;
        this._projectile = null;
        this._projectile_group = new THREE.Group();
    }

    SetPosition(position) {
        const newPos = position.clone().add(this._position_offset);
        this._mesh.position.copy(newPos);
    }

    Fire(enemy) {
        this._can_shoot = false;

        // this.CreateProjectile(enemy._mesh.position);
        enemy.DecreaseHealth(this._damage);

        setTimeout(() => this._can_shoot = true, this._shoot_delay);
    }

    CreateProjectile(targetPosition) {}

    CalculateLookAt(target) {
        const lookAt = new THREE.Vector3();
        lookAt.applyQuaternion(target.quaternion);
        lookAt.add(this._mesh.position);
        return lookAt;
    }

    Update(t) {
        if (this._enemies_list.length < 1 || !this._enemies_list) return;

        // for (let i = 0; i < this._projectiles.length; i++) {
        //     const mesh = this._projectiles[i].mesh;
        //     const targetPos = this._projectiles[i].targetPosition.clone();
        //     const dir = targetPos.sub(this._mesh.position);
        //     dir.y = 0;

        //     mesh.position.add(dir.multiplyScalar(t));
        //     if (mesh.position.distanceTo(targetPos) < 0.01) {
        //         this._projectile_group.remove(mesh);
        //         this._projectiles.splice(i, 1);
        //     }
        // }

        this._enemies_in_range = [
            ...this._enemies_list.filter(enemy => this._mesh.position.distanceTo(enemy._mesh.position) < this._range)
        ];

        if (this._enemies_in_range.length > 0) {
            const pos = this._enemies_in_range[0]._mesh.position.clone();
            pos.y = 3;

            const l = 1.0 - Math.pow(0.00001, t);

            this._cur_look_at.lerp(pos, l);

            this._target_rotate.lookAt(this._cur_look_at);

            if (this._can_shoot) this.Fire(this._enemies_in_range[0]);
        }
    }
}

class StandardTurret extends Turret {
    static Cost = 20;
    static Type = "StandardTurret";

    constructor(enemiesList) {
        super(enemiesList);

        this._range = 15;
        this._shoot_delay = 500;
        this._damage = 15;

        this._position_offset.y = 0.6;

        this._mesh = Models.StandardTurret.mesh.clone();
        this._mesh.scale.multiplyScalar(0.06);
        this._mesh.traverse(c => {
            if (c.isMesh) {
                c.receiveShadow = true;
                c.castShadow = true;
            }
        });

        this._target_rotate = this._mesh.children[1];

        this._projectile = new THREE.Mesh(
            new THREE.SphereGeometry(1, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
    }

    CreateProjectile(targetPosition) {
        const mesh = this._projectile.clone();

        this._projectile_group.add(mesh);

        this._projectiles.push({ mesh, targetPosition });
    } 
}

class MissileLauncher extends Turret {
    static Cost = 50;
    static Type = "MissileLauncher";

    constructor(enemiesList) {
        super(enemiesList);

        this._range = 20;
        this._shoot_delay = 2000;
        this._damage = 40;
        this._explosion_radius = 10;

        this._position_offset.y = 0.2;

        this._mesh = Models.MissileLauncher.mesh.clone();
        this._mesh.scale.multiplyScalar(0.009);
        this._mesh.traverse(c => {
            if (c.isMesh) {
                c.receiveShadow = true;
                c.castShadow = true;
            }
        });

        this._missile = this._mesh.children[2];
        this._mesh.remove(this._missile);
        this._target_rotate = this._mesh.children[1];
    }

    Fire(enemy) {
        this._can_shoot = false;

        enemy.DecreaseHealth(this._damage);

        this._enemies_list.filter(e => enemy._mesh.position.distanceTo(e._mesh.position) < this._explosion_radius)
            .forEach(e => e.DecreaseHealth(this._damage * 0.5));

        setTimeout(() => this._can_shoot = true, this._shoot_delay);
    }
}

class LaserBeamer extends Turret {
    static Cost = 100;
    static Type = "LaserBeamer";

    constructor(enemiesList) {
        super(enemiesList);

        this._range = 30;
        this._shoot_delay = 0;
        this._damage = 1;

        this._position_offset.y = -0.5;

        this._mesh = Models.LaserBeamer.mesh.clone();
        this._mesh.scale.multiplyScalar(0.009);
        this._mesh.traverse(c => {
            if (c.isMesh) {
                c.receiveShadow = true;
                c.castShadow = true;
            }
        });

        this._target_rotate = this._mesh.children[1];
    }

    Fire(enemy) {
        enemy.DecreaseHealth(this._damage);
        enemy._speed = 0.75;
    }
}

export { Turret, StandardTurret, MissileLauncher, LaserBeamer };