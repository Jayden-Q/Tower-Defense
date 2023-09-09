import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class TurretBuildManager {
    constructor({ nodes, camera, enemiesList, currencyManager, messageManager }) {
        this._nodes = nodes;
        this._camera = camera;
        this._enemies_list = enemiesList;
        this._currency_manager = currencyManager;
        this._message_manager = messageManager;

        this._node_meshes = this._nodes.map(node => node._mesh);
        this._raycaster = new THREE.Raycaster();

        this._group = new THREE.Group();
    
        this._turrets = [];
        this._turret_types = [];
    }

    SetTargetNodes(nodes) {
        this._nodes = nodes;
        this._node_meshes = nodes.map(node => node._mesh);
    }

    SetEnemiesList(enemiesList) {
        this._enemies_list = enemiesList;
    }

    GetNormalizedMouseCoordinate(e) {
        return {
            x: ((e?.changedTouches?.[0]?.clientX ?? e.clientX) / window.innerWidth) * 2 - 1,
            y: -((e?.changedTouches?.[0]?.clientY ?? e.clientY) / window.innerHeight) * 2 + 1
        };
    }

    AddTurret(TurretType, domElement) {
        domElement.querySelector(".turret-cost").innerText = `$${TurretType.Cost}`;

        /* Turret Preview */
        const turretPreview = new TurretType();

        const turretData = {
            Type: TurretType,
            preview: {
                turret: turretPreview,
                range: new THREE.Mesh(
                    new THREE.CylinderGeometry(turretPreview._range, turretPreview._range, 0.1, 50, 50),
                    new THREE.MeshStandardMaterial({ color: 0xCCCCCC, transparent: true, opacity: 0.5 })
                ),
                isInPreview: false
            }
        }
        this._turret_types.push(turretData);

        /* Listeners */
        domElement.addEventListener("drag", e => this.OnDragTurret(e, turretData.preview));
        domElement.addEventListener("touchmove", e => this.OnDragTurret(e, turretData.preview));

        domElement.addEventListener("dragend", e => this.OnDropTurret(e, TurretType));
        domElement.addEventListener("touchend", e => this.OnDropTurret(e, TurretType));
    }

    OnDragTurret(e, preview) {
        const { x, y } = this.GetNormalizedMouseCoordinate(e);

        this.DisplayTurretPreview(x, y, preview);
    }

    OnDropTurret(e, TurretType) {
        const { x, y } = this.GetNormalizedMouseCoordinate(e);
        console.log(x, y);

        const node = this.GetTargetNode(x, y);

        const preview = this._turret_types.find(turret => turret.Type == TurretType).preview;

        preview.turret._mesh.position.set(-500, 0, 0);
        preview.range.position.set(-500, 0, 0);

        if (!node) return;

        this.PlaceTurret(TurretType, node);    
    }

    DisplayTurretPreview(x, y, preview) {
        const intersectionPoint = new THREE.Vector3();
        const planeNormal = new THREE.Vector3(0, 1, 0);
        const plane = new THREE.Plane();

        plane.setFromNormalAndCoplanarPoint(planeNormal, new THREE.Vector3(0, 2.6, 0));
        this._raycaster.setFromCamera(new THREE.Vector2(x, y), this._camera);
        this._raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (!preview.isInPreview) {
            preview.isInPreview = true;
            this._group.add(preview.turret._mesh, preview.range);
        }

        preview.turret._mesh.position.copy(intersectionPoint);
        preview.range.position.copy(intersectionPoint);
    }

    PlaceTurret(TurretType, node) {
        if (node.userData.NODE._has_turret) return;
        
        if (this._currency_manager._currency < TurretType.Cost) {
            this._message_manager.Display("Not Enough Currency!", "#ff0000");
            return;
        }

        const turret = new TurretType(this._enemies_list);
        turret.SetPosition(node.position);
        this._group.add(turret._mesh, turret._projectile_group);

        node.userData.NODE._has_turret = true;
        this._turrets.push(turret);

        this._currency_manager.Decrease(TurretType.Cost);
    }

    GetTargetNode(x, y) {
        this._raycaster.setFromCamera(new THREE.Vector2(x, y), this._camera);
        const intersects = this._raycaster.intersectObjects(this._node_meshes);
    
        if (intersects.length < 1) return;

        return intersects[0].object;
    }

    Update(t) {
        this._turrets.forEach(turret => turret.Update(t));
    }
}

export default TurretBuildManager;