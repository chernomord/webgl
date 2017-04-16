let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

let camera, container, scene, renderer, dirLight, orbiter, planet;

init();
render();

function init () {
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(30, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
    camera.position.z = 100;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild(renderer.domElement);
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-1, 0, 1).normalize();
    scene.add(dirLight);
    window.addEventListener('resize', onWindowResize, false);

    let planetoid = new THREE.SphereGeometry(1, 40, 40, 0, Math.PI * 2, 0, Math.PI * 2);
    let massMaterial = new THREE.MeshPhongMaterial({emissive: 0x000000, color: 0x990022});

    let orbiterGeom = new THREE.SphereGeometry(.4, 40, 40, 0, Math.PI * 2, 0, Math.PI * 2);
    let orbiterMaterial = new THREE.MeshPhongMaterial({emissive: 0x000000, color: 0x22cc00});

    planet = new Planet(-.003, 0, 0, 0, planetoid, massMaterial);
    scene.add(planet.mesh);

    orbiter = new Orbiter(10, 0, 0, orbiterGeom, orbiterMaterial);
    orbiter.setVector(0, -.18);
    scene.add(orbiter.mesh);
    orbiter2 = new Orbiter(6, 3, 0, orbiterGeom, orbiterMaterial);
    orbiter2.setVector(.03, .11);
    scene.add(orbiter2.mesh);


}


function render () {
    orbiter.update(planet);
    orbiter2.update(planet);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


function onWindowResize (event) {
    SCREEN_HEIGHT = window.innerHeight;
    SCREEN_WIDTH = window.innerWidth;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
}


function Planet (gravity, x, y, z, geometry, material) {
    this.gravity = gravity;
    this.position = {x, y, z};
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);

    this.vector = {
        x: 0,
        y: 0
    }
}

function Orbiter (x, y, z, geometry, material) {
    this.iteration = 0;
    this.position = {x, y, z};
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);

    let maxDraw = 20000;
    this.drawCount = 2;

    this.orbitLine = new THREE.BufferGeometry();
    let lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 2});
    let positions = new Float32Array(maxDraw * 3); // 3 vertices per point
    this.orbitLine.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.orbitLine.setDrawRange(0, this.drawCount);

    this.line = new THREE.Line(this.orbitLine, lineMaterial);
    this.line.material.color.setHSL(Math.random(), 1, 0.5);
    this.line.geometry.attributes.position.array[this.iteration++] = x;
    this.line.geometry.attributes.position.array[this.iteration++] = y;
    this.line.geometry.attributes.position.array[this.iteration++] = z;
    this.line.material.color.setHSL(Math.random(), 1, 0.5);
    scene.add(this.line);

    Orbiter.prototype.update = function (planet) {
        this.drawCount = ( this.drawCount + 2 ) % maxDraw;
        this.line.geometry.setDrawRange(0, this.drawCount);
        let positions = this.line.geometry.attributes.position.array;

        // positions[this.iteration++] = this.position.x;
        // positions[this.iteration++] = this.position.y;
        // positions[this.iteration++] = 0;

        if (this.drawCount === 0) {
            this.iteration = 0;
            scene.remove(this.orbitLine);
            this.orbitLine = new THREE.BufferGeometry();
            let lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 2});
            let positions = new Float32Array(maxDraw * 3); // 3 vertices per point
            this.orbitLine.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.orbitLine.setDrawRange(0, this.drawCount);

            this.line = new THREE.Line(this.orbitLine, lineMaterial);

            scene.add(this.line);
            // this.line = new THREE.Line(orbitLine, lineMaterial);
        }

        let pX, pY;
        let a = planet.position.x - this.position.x;
        let b = planet.position.y - this.position.y;

        let alpha = Math.atan(a / b) * 180 / Math.PI;
        if (b > 0) alpha -= 180;
        let beta = 180 - 90 - Math.abs(alpha);

        let alphaRad = alpha * Math.PI / 180;
        let betaRad = beta * Math.PI / 180;
        let gammaRad = 90 * Math.PI / 180;

        pX = planet.gravity * Math.sin(alphaRad) / Math.sin(gammaRad);
        pY = planet.gravity * Math.sin(betaRad) / Math.sin(gammaRad);

        this.vector.x += pX;
        this.vector.y += pY;

        this.mesh.position.x = this.position.x += this.vector.x;
        this.mesh.position.y = this.position.y += this.vector.y;

        positions[this.iteration++] = this.position.x;
        positions[this.iteration++] = this.position.y;
        positions[this.iteration++] = 0;
        this.line.geometry.attributes.position.needsUpdate = true;

    };

    Orbiter.prototype.setVector = function (x, y) {
        this.vector = {x, y};
    }
}
