import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import Constants from '../Global/Constants.js';

import Levels from "./Levels.js";
import Node from './Node.js';
import SpawnerBuilding from '../Buildings/SpawnerBuilding.js';
import Tower from '../Buildings/Tower.js';

import CurrencyManager from '../Managers/CurrencyManager.js';
import HealthManager from '../Managers/HealthManager.js';
import WaveSpawner from './WaveSpawner.js';

class Level {
    constructor(levelID) {
        this._level = Levels.find(level => level.id == levelID);

        this._group = new THREE.Group();
        this._nodes = [];
        this._points = [];

        this.CreateLevel();
        
        this._currency_manager = new CurrencyManager(70);
        this._health_manager = new HealthManager();

        this._wave_spawner = new WaveSpawner({
            level: this._level,
            spawnerBuilding: this._spawner_building,
            points: this._points,
            currencyManager: this._currency_manager,
            healthManager: this._health_manager
        });
    }

    CreateLevel() {
        const offset = (((Constants.NODE_SIZE + Constants.SPACING) * this._level.layout.length) * 0.5) - Constants.SPACING * 2.5;

        for (let y = 0; y < this._level.layout.length; y++) {
            for (let x = 0; x < this._level.layout[y].length; x++) {
                if (this._level.layout[y][x] == 0) {
                    const node = new Node(
                        new THREE.Vector3(
                            (x * (Constants.NODE_SIZE + Constants.SPACING)) - offset,
                            1.0,
                            (y * (Constants.NODE_SIZE + Constants.SPACING)) - offset
                        )
                    );

                    this._group.add(node._mesh);
                    this._nodes.push(node);

                    continue;
                }

                if (this._level.layout[y][x] == 3) {
                    this._spawner_building = new SpawnerBuilding(new THREE.Vector3(
                        (x * (Constants.NODE_SIZE + Constants.SPACING)) - offset,
                        0,
                        (y * (Constants.NODE_SIZE + Constants.SPACING)) - offset
                    ));

                    this._group.add(this._spawner_building._mesh);
                }

                if (this._level.layout[y][x] == 4) {
                    this._tower = new Tower(new THREE.Vector3(
                        (x * (Constants.NODE_SIZE + Constants.SPACING)) - offset,
                        0,
                        (y * (Constants.NODE_SIZE + Constants.SPACING)) - offset
                    ));

                    this._group.add(this._tower._mesh);

                    continue;
                }
            }
        }

        for (let i = 0; i < this._level.points.length; i++) {
            const point = new THREE.Vector3(
                (this._level.points[i].x * (Constants.NODE_SIZE + Constants.SPACING)) - offset,
                0,
                (this._level.points[i].y * (Constants.NODE_SIZE + Constants.SPACING)) - offset
            );

            this._points.push(point);
        }
    }

    Dispose() {
        this._spawner_building.Dispose();
        this._tower.Dispose();
        this._nodes.forEach(node => node.Dispose());
        this._wave_spawner.Dispose();
    }
}

export default Level;