import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.0/examples/jsm/loaders/GLTFLoader.js';

class Environment {
    constructor(scene) {
        this._scene = scene;
        this._loader = new GLTFLoader();
    
        Models.Tree.mesh.traverse(c => {
            if (c.isMesh) {
                c.receiveShadow = true;
                c.castShadow = true;
            }
        });

        this.AddTrees();
    }

    RandInt(min, max) {
        return Math.random() * (max - min) + min;
    }

    SpawnTree(position) {
        const tree = Models.Tree.mesh.clone();
        tree.scale.multiplyScalar(this.RandInt(2, 3));
        tree.position.copy(position);
        this._scene.add(tree);
    }

    AddTrees() {
        /* Front */
        for (let i = 0; i < 15; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(-100, -50), 0, this.RandInt(-35, -50)));
        }
        for (let i = 0; i < 15; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(-50, 0), 0, this.RandInt(-35, -50)));
        }
        for (let i = 0; i < 15; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(0, 50), 0, this.RandInt(-35, -50)));
        }
        for (let i = 0; i < 15; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(50, 100), 0, this.RandInt(-35, -50)));
        }
        /* Left */
        for (let i = 0; i < 20; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(-100, -40), 0, this.RandInt(-30, -10)));
        }
        for (let i = 0; i < 20; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(-100, -40), 0, this.RandInt(0, 30)));
        }
        /* Right */
        for (let i = 0; i < 20; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(45, 100), 0, this.RandInt(-30, -10)));
        }
        for (let i = 0; i < 20; i++) {
            this.SpawnTree(new THREE.Vector3(this.RandInt(45, 100), 0, this.RandInt(0, 30)));
        }
    }
}

export default Environment;