import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.0/examples/jsm/loaders/FBXLoader.js';

class LoadingManager {
    constructor() {
        this._loading_manager = new THREE.LoadingManager();

        this._needs_loading = [];
    }

    AddToLoad(model) {
        this._needs_loading.push(model);
    }

    LoadAllAsynchronous(callback) {
        let i = 0;

        const load = () => {
            let loader = null;

            const ext = this._needs_loading[i].path.match(/\.[a-z]+$/i);
            
            if (ext.includes(".fbx")) loader = new FBXLoader();
            else if (ext.includes(".gltf")) loader = new GLTFLoader();

            loader.load(this._needs_loading[i].path, gltf => {
                this._needs_loading[i].mesh = gltf.scene ?? gltf;

                i++;

                if (i == this._needs_loading.length) {
                    console.log("Finished Loading Resources");
                    callback();
                    return;
                }

                load();
            });
        }

        load();
    }
}

export default LoadingManager;