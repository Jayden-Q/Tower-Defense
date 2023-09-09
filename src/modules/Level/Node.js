import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import Constants from '../Global/Constants.js';

class Node {
    constructor(position) {
        this._position = position;
        this._has_turret = false;
        
        this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(Constants.NODE_SIZE, 1, Constants.NODE_SIZE),
            new THREE.MeshStandardMaterial({ color: 0xcccccc })
        );
        this._mesh.position.copy(position);
        this._mesh.receiveShadow = true;
        this._mesh.castShadow = true;
        this._mesh.userData.NODE = this;
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

export default Node;