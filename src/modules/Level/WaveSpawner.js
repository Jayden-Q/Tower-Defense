import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { NormalEnemy, FastEnemy, ToughEnemy } from '../Enemy/Enemy.js';

class WaveSpawner {
    constructor({ level, spawnerBuilding, points, currencyManager, healthManager }) {
        this._level = level; /* Level Data */
        this._spawner_building = spawnerBuilding; /* Place Where Enemies Spawn */
        this._points = points; /* Points The Enemies Have To Travel To */
        this._currency_manager = currencyManager;
        this._health_manager = healthManager;
        
        this._waves = this._level.waves; /* Every Wave */
        this._wave_index = 0; /* Index Of The Wave Spawning */
        this._wave_spawn_delay = 5000; /* Delay Between Each Wave Spawning */

        this._has_won = false;
        this._has_lost = false;
        this._has_enemies_finished_spawning = false; /* When All Enemies In Every Wave Finished Spawning */
        this._can_spawn_next_wave = true; /* When All Enemies Are Dead */

        this._dom_element = document.querySelector(".wave-count"); /* DOM Element To Keep Track Of The Wave Count */
        this.UpdateWaveCount();

        this._enemies = []; /* All The Enemies In The Scene */
        this._enemies_group = new THREE.Group(); /* All The Enemies Meshes */
        this._health_bar_group = new THREE.Group(); /* All The Enemies Healthbars */

        /* The Amount Of Health Enemies Gain * Wave Index */
        this._health_increase_amount = [
            { type: NormalEnemy, amount: 50 },
            { type: FastEnemy, amount: 35 },
            { type: ToughEnemy, amount: 150 }
        ];
    }

    RemoveEnemyByIndex(i) {
        this._enemies_group.remove(this._enemies[i]._mesh);
        this._health_bar_group.remove(this._enemies[i]._health_bar._sprite);
        this._enemies[i].Dispose();
        this._enemies.splice(i, 1);
    }

    Delay(milliseconds) {
        return new Promise(res => setTimeout(res, milliseconds));
    }

    AddEnemy(enemy, health) {
        enemy.SetHealth(health);
        enemy.SetPosition(this._spawner_building._mesh.position);

        this._enemies.push(enemy);
        this._enemies_group.add(enemy._mesh);
        this._health_bar_group.add(enemy._health_bar._sprite);
    }
  
    /* Spawn All Enemies In A Wave */
    SpawnWaveEnemies(waveIndex) {
        /* Current Wave */
        const curWave = this._waves[waveIndex];

        function* enemiesObj(wave) {
            for (let i = 0; i < wave.length; i++) yield wave[i];
        }

        (async() => {
            let enemyObjIndex = 0;

            for (let enemyObj of enemiesObj(curWave)) {
                /* Get Matching Enemy Type */
                const EnemyType = enemyObj.type == "Normal" ? NormalEnemy :
                                enemyObj.type == "Fast" ? FastEnemy :
                                enemyObj.type == "Tough" ? ToughEnemy : null;

                if (!EnemyType) return;

                /* Spawn Same Amount Of Enemies As Count */
                for (let i = 0; i < enemyObj.count; i++) {
                    /* Add Enemy */
                    const enemy = new EnemyType(this._points);
                    const extraHealth = this._health_increase_amount.find(obj => {
                        return obj.type == EnemyType
                    }).amount * waveIndex;

                    this.AddEnemy(enemy, enemy._health + extraHealth);

                    await this.Delay((1 / enemy._speed) * 1000); /* Enemy Spawn Delay */
                }

                enemyObjIndex++;

                /* If Wave Finished Spawning */
                if (enemyObjIndex == curWave.length) {
                /* If All Waves Finished Spawning */
                    if (this._wave_index == this._waves.length) {
                        this._has_enemies_finished_spawning = true;
                        return;
                    }
                    this._can_spawn_next_wave = true;
                }
            }
        })();
    }

    SpawnWave() {
        if (this._wave_index == this._waves.length) return;

        this._can_spawn_next_wave = false;

        setTimeout(() => {
            this.SpawnWaveEnemies(this._wave_index);
            this._wave_index++;
            this.UpdateWaveCount();
        }, 2000);
    }

    UpdateWaveCount() {
        this._dom_element.innerText = `Wave: ${this._wave_index}/${this._waves.length}`;
    }

    Update(t) {
        if (this._has_won || this._has_lost) return;

        if (this._has_enemies_finished_spawning && this._enemies.length < 1) {
            this._has_won = true;
            return;
        }

        if (this._can_spawn_next_wave && this._enemies.length < 1) this.SpawnWave();

        for (let i = 0; i < this._enemies.length; i++) {
            this._enemies[i].StartJourney(t);

            /* If The Enemy Is Dead */
            if (this._enemies[i]._is_dead) {
                this._currency_manager.Increase(this._enemies[i]._worth);
                this.RemoveEnemyByIndex(i);
                return;
            }

            /* If The Enemy Reaches The End */
            if (this._enemies[i]._has_reached_end) {
                this.RemoveEnemyByIndex(i);
                if (!this._has_lost) {
                    this._health_manager.Decrease(1);

                    if (this._health_manager.Health == 0) this._has_lost = true;
                }
            }
        }
    }

    Dispose() {
        for (let i = 0; i < this._enemies.length; i++) this.RemoveEnemyByIndex(i);
    }
}

export default WaveSpawner;