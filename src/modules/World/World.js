import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import Constants from '../Global/Constants.js';
import Environment from './Environment.js';

class World {
    constructor(scene, csm) {
        this._scene = scene;
        this._csm = csm;

        this.CreateMap();
        this.CreateSkybox();
        this.CreateLights();

        this._environment = new Environment(this._scene);
    }

    CreateMap() {
        /* Materials */
        const ground_mat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const path_mat = new THREE.MeshStandardMaterial({ color: 0x111111 });

        if (this._csm) {
            this._csm.setupMaterial(ground_mat);
            this._csm.setupMaterial(path_mat);
        }

        /* Ground */
        const ground = new THREE.Mesh(
            new THREE.BoxBufferGeometry(400, 1, 100),
            ground_mat
        );
        ground.receiveShadow = true;

        /* Path */
        const path = new THREE.Mesh(
            new THREE.BoxBufferGeometry((Constants.NODE_SIZE + Constants.SPACING) * 14, 0.2, (Constants.NODE_SIZE + Constants.SPACING) * 14),
            path_mat
        )
        path.position.set(0, 0.6, 0);
        path.castShadow = true;
        path.receiveShadow = true;

        /* Add To Scene */
        this._scene.add(ground, path);
    }

    CreateSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            "../../resources/skybox/miramar_lf.jpg",
            "../../resources/skybox/miramar_rt.jpg",
            "../../resources/skybox/miramar_up.jpg",
            "../../resources/skybox/miramar_dn.jpg",
            "../../resources/skybox/miramar_ft.jpg",
            "../../resources/skybox/miramar_bk.jpg",
        ]);
        this._scene.background = texture;
    }

    CreateLights() {
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        directionalLight.position.set(-1, -1, -1);
        directionalLight.shadow.bias = -0.001;

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
        this._scene.add(directionalLight, ambientLight);

        const l = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        l.position.set(0, 40, 40);
        l.shadow.bias = -0.001;

        this._scene.add(l);
    }
}

export default World;