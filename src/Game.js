import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
// import { CSM } from 'https://cdn.jsdelivr.net/npm/three@0.118.0/examples/jsm/csm/CSM.js';

import World from './modules/World/World.js';
import Level from './modules/Level/Level.js';
import CameraController from './modules/Interaction/CameraController.js';
import TurretBuildManager from './modules/Interaction/TurretBuildManager.js';
import { StandardTurret, MissileLauncher, LaserBeamer } from './modules/Buildings/Turret.js';
import MessageManager from './modules/Managers/MessageManager.js';
import LoadingManager from './modules/Global/LoadingManager.js';

class Game {
    constructor(levelID, cb) {
        this._level_ID = levelID;

        /* DOM Elements */
        this._parent = document.querySelector(".game-screen");
        this._draggable_elements = document.querySelectorAll(".turret-option");
        this._lose_screen = document.querySelector(".lose-screen");
        this._win_screen = document.querySelector(".win-screen");

        /* Responsible For Loading Everything */
        this._loading_manager = new LoadingManager();
        
        /* Add Models To Load */
        Object.keys(Models).forEach(key => this._loading_manager.AddToLoad(Models[key]));

        /* Start Loading Everything */
        this._loading_manager.LoadAllAsynchronous(() => {
            this.Initialize();
            cb();
        });
    }

    Initialize() {
        /* Initialize Three JS */
        this.InitializeScene();
        this.InitializeCamera();
        this.InitializeRenderer(parent);

        /* Shadows (performance issues) */
        // this._csm = new CSM({
        //     maxFar: 1000,
        //     cascades: 3,
        //     // mode: "practical",
        //     parent: this._scene,
        //     shadowMapSize: 1024,
        //     lightDirection: new THREE.Vector3(-0.75, -1, -1),
        //     camera: this._camera,
        //     lightIntensity: 0.2
        // });
        this._csm = null;

        this._clock = new THREE.Clock();
        this._world = new World(this._scene, this._csm);
        this._camera_controller = new CameraController(this._camera);

        const img = new Image();

        this._draggable_elements.forEach(element => {
            element.addEventListener("dragstart", e => {
                e.dataTransfer.setDragImage(img, 0, 0);
            });
        });

        this.SetLevel(this._level_ID);

        window.addEventListener("resize", () => this.OnWindowResize(), false);
        window.requestAnimationFrame(() => this.Update());
    }

    InitializeScene() {
        this._scene = new THREE.Scene();
        // this._scene.fog = new THREE.Fog(0xffffff, 0.05, 200);
    }

    InitializeCamera() {
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
        this._camera.position.set(0, 35, 57);
        this._camera.lookAt(0, 0, 10);
        this._camera.rotation.order = "YXZ";
    }

    InitializeRenderer() {
        this._renderer = new THREE.WebGLRenderer({antialias: true});
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.VSMShadowMap;
        this._renderer.outputEncoding = THREE.sRGBEncoding;
        this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this._parent.appendChild(this._renderer.domElement);
    }

    OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    ShowLoseScreen() { this._lose_screen.classList.remove("hidden") }
    ShowWinScreen() { this._win_screen.classList.remove("hidden") }

    DisposeCurrentLevel() {
        if (this._turret_build_manager) {
            this._scene.remove(this._turret_build_manager._group);
            this._turret_build_manager._group = new THREE.Group();
        }

        if (this._level) {
            this._level.Dispose();
            this._scene.remove(this._level._group);
            this._scene.remove(this._level._wave_spawner._enemies_group);
            this._scene.remove(this._level._wave_spawner._health_bar_group);
        }
    }

    SetLevel(levelID) {
        /* Change Level ID To New ID */
        this._level_ID = levelID;

        /* Dispose Current Level If There Is One */
        this.DisposeCurrentLevel();

        /* Create A New Level With The New ID */
        this._level = new Level(this._level_ID);

        /* Create An Instance Of TurretBuildManager If It Doesn't Exist */
        if (!this._turret_build_manager) {
            this._message_manager = new MessageManager(); /* Displays Messages */

            /* Responsible For Building Turrets / Displaying Turret Preview */
            this._turret_build_manager = new TurretBuildManager({
                nodes: this._level._nodes,
                camera: this._camera,
                enemiesList: this._level._wave_spawner._enemies,
                currencyManager: this._level._currency_manager,
                messageManager: this._message_manager
            });

            /* Set Each Turret Type With Respectable DOM Element */
            this._turret_build_manager.AddTurret(StandardTurret, this._draggable_elements[0]);
            this._turret_build_manager.AddTurret(MissileLauncher, this._draggable_elements[1]);
            this._turret_build_manager.AddTurret(LaserBeamer, this._draggable_elements[2]);
        } else {
            /* Change Previous Values */
            this._turret_build_manager._currency_manager = this._level._currency_manager;
            this._turret_build_manager.SetTargetNodes(this._level._nodes);
            this._turret_build_manager.SetEnemiesList(this._level._wave_spawner._enemies);
        }

        /* Add Everything To The Scene */
        this._scene.add(this._level._group);
        this._scene.add(this._level._wave_spawner._enemies_group);
        this._scene.add(this._level._wave_spawner._health_bar_group);
        this._scene.add(this._turret_build_manager._group);

        /* Reset Camera Position */
        this._camera.position.set(0, 35, 47);

        /* Start Updating */
        this._should_update = true;
    }

    Pause() { this._should_update = false }
    Resume() { this._should_update = true }

    Update() {
        requestAnimationFrame(() => this.Update());
        
        /* Get Delta Time */
        const t = this._clock.getDelta();

        /* Render The Scene */
        this._renderer.render(this._scene, this._camera);

        /* Update Shadow Map */
        if (this._csm) this._csm.update();

        /* If The Game Is Paused, Don't Update Everything Else */
        if (!this._should_update || !this._level) return;

        this._turret_build_manager.Update(t); /* Update Turrets */
        this._level._wave_spawner.Update(t); /* Update Wave Spawning And Enemies */

        /* If Health Reaches 0 */
        if (this._level._wave_spawner._has_lost) {
            this._should_update = false;
            setTimeout(() => this.ShowLoseScreen(), 500);
        }

        /* If All Waves Are Cleared */
        if (this._level._wave_spawner._has_won) {
            this._should_update = false;
            setTimeout(() => this.ShowWinScreen(), 500);
        }

        this._camera_controller.Update(t);
    }
}

export default Game;