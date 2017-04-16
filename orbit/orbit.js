let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

let camera, container, scene, renderer, dirLight, orbiter, planet, orbitLine;

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
    orbiter.setVector(0,-.18);
    scene.add(orbiter.mesh);
    orbiter2 = new Orbiter(6, 3, 0, orbiterGeom, orbiterMaterial);
    orbiter2.setVector(.03,.18);
    scene.add(orbiter2.mesh);

    orbitLine = new THREE.Geometry();
    let lineMaterial = new THREE.LineBasicMaterial({
        color: 0x000033
    });

    orbitLine.vertices.push(5, 5, 0);
    orbitLine.vertices.push(5, 15, 0);
    orbitLine.vertices.push(25, 15, 0);

    let line = new THREE.Line(orbitLine, lineMaterial);
    scene.add(line);
}


function render () {
    renderer.render(scene, camera);
    orbiter.update(planet);
    orbiter2.update(planet);
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
    this.position = {x, y, z};
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);

    Orbiter.prototype.update = function (planet) {
        orbitLine.vertices.push(this.position.x, this.position.y, 0);
        let pX, pY;
        let a = planet.position.x - this.position.x;
        let b = planet.position.y - this.position.y;

        let alpha = Math.atan(a/b) * 180 / Math.PI;
        if (b > 0) alpha -= 180;
        let beta = 180 - 90 - Math.abs(alpha);

        let alphaRad = alpha * Math.PI/180;
        let betaRad = beta * Math.PI/180;
        let gammaRad = 90 * Math.PI /180;

        pX = planet.gravity * Math.sin(alphaRad)/Math.sin(gammaRad);
        pY = planet.gravity * Math.sin(betaRad)/Math.sin(gammaRad);

        this.vector.x += pX;
        this.vector.y += pY;

        this.mesh.position.x = this.position.x += this.vector.x;
        this.mesh.position.y = this.position.y += this.vector.y;

        orbitLine.vertices.push(this.position.x, this.position.y, 0);
    };

    Orbiter.prototype.setVector = function (x,y) {
        this.vector = {x,y};
    }
}
