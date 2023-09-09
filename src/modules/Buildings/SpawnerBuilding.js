import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.0/examples/jsm/loaders/GLTFLoader.js';

class SpawnerBuilding {
    constructor(position) {
        this._position = position;

        this._mesh = Models.SpawnerBuilding.mesh.clone();
        this._mesh.scale.multiplyScalar(1.2);
        this._mesh.rotation.y += Math.PI * 0.5;
        this._mesh.traverse(c => {
            if (c.isMesh) {
                c.receiveShadow = true;
                c.castShadow = true;
            }
        });
        this._mesh.position.copy(position);
    }

    Dispose() {
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

export default SpawnerBuilding;