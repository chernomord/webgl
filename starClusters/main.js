   let radius = 500;
    let MARGIN = 0;
    let SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
    let SCREEN_WIDTH = window.innerWidth;
    let container;
    let camera, controls, scene, renderer;
    let dirLight, pointLight, ambientLight;
    let clock = new THREE.Clock();
    init();
    animate();
    function init () {
        container = document.createElement('div');
        document.body.appendChild(container);
        camera = new THREE.PerspectiveCamera(60, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1e7);
        camera.position.z = radius;
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.00000025);
        controls = new THREE.FlyControls(camera);
        controls.movementSpeed = 80;
        controls.domElement = container;
        controls.rollSpeed = Math.PI / 4;
        controls.autoForward = false;
        controls.dragToLook = false;
        dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(-1, 0, 1).normalize();
        scene.add(dirLight);

        // stars

        let ball = new THREE.SphereGeometry(.1, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
        let material = new THREE.MeshBasicMaterial();

        function linear () {
            let cent = 50;
            let size = 40;

            function dist (center, point) {
                return Math.abs(center - point);
            }

            function newPoint (center, size, point) {
                if (dist(center, point) < size * Math.PI) {
                    return (point - center) * ((Math.cos(point - size * Math.PI) + 1) / 2) + center;
                }
                else return point;
            }

            for (let i = 0; i < 5000; i++) {
                let star = new THREE.Mesh(ball, material);
                let star2 = new THREE.Mesh(ball, material);
                let y = randomRange(500);
                let x = randomRange(500);
                star.position.set(newPoint(cent, size, x), y, 0);
                scene.add(star);
            }
        }

        function d2 () {
            let cent = [100, 100];
            let size = 200;

            function dist (center, points) {
                return Math.sqrt(Math.pow((center[0] - points[0]), 2) + Math.pow((center[1] - points[1]), 2));
            }

            function newPoint (center, size, points) {
                if (dist(center, points) < size) {
                    let oldDist = dist(center, points);
                    let newDist = oldDist * (Math.cos((oldDist / size - 1) * Math.PI) + 1) / 2;
                    points[0] = (points[0] - center[0]) * ((Math.cos((oldDist / size - 1) * Math.PI) + 1) / 2) + center[0];
                    points[1] = (points[1] - center[1]) * ((Math.cos((oldDist / size - 1) * Math.PI) + 1) / 2) + center[1];
                }
                return points;
            }

            for (let i = 0; i < 5000; i++) {
                let star = new THREE.Mesh(ball, material);
                let y = randomRange(500);
                let x = randomRange(500);
                let z = randomRange(500);
                let [xa, ya] = newPoint(cent, size, [x, y]);
                star.position.set(xa, ya, 0);
                scene.add(star);
            }
        }

        /**
         *
         * @param quantity {Number}
         * @param range {Number}
         * @param maxGravity {Number}
         * @param getRandom {Function}
         * @returns {Float32Array[]}
         */
        function createClusters(quantity, range, maxGravity, getRandom) {
            let clusters = [];
            for (let i = 0; i < quantity; i++) {
                clusters[i] = new Float32Array(4);
                clusters[i][0] = getRandom(range);
                clusters[i][1] = getRandom(range);
                clusters[i][2] = getRandom(range);
                clusters[i][3] = Math.abs(maxGravity / 2 + Math.random() * maxGravity / 2);
            }
            return clusters;
        }

        function d3 () {
            let cent = [100, 100, 100];
            let cent2 = [-100, -100, -200];
            let size = 600;
            let size2 = 800;

            let clusters = createClusters(8, 800, 400, randomRange);

            function dist (center, points) {
                let result = 0;
                for (let idx in points) {
                    result +=  Math.pow((center[idx] - points[idx]), 2);
                }
                return Math.sqrt(result);
            }

            function newPoint (center, size, points) {
                if (dist(center, points) < size) {
                    let oldDist = dist(center, points);
                    for (let idx in points) {
                        points[idx] = (points[idx] - center[idx]) * ((Math.cos((oldDist / size - 1) * Math.PI) + 1) / 2) + center[idx];
                    }
                }
                return points;
            }

            for (let i = 0; i < 10000; i++) {
                let star = new THREE.Mesh(ball, material);
                let [x, y, z] = [randomRange(1000), randomRange(1000), randomRange(1000)];
                clusters.forEach(cluster => {
                    let clustCent = [cluster[0], cluster[1], cluster[2]];
                    [x, y, z] = newPoint(clustCent, cluster[3], [x, y, z]);
                });
                star.position.set(x, y, z);
                scene.add(star);
            }
        }

//        linear();
//        d2();
        d3();

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }
    function onWindowResize (event) {
        SCREEN_HEIGHT = window.innerHeight;
        SCREEN_WIDTH = window.innerWidth;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
    }
    function animate () {
        requestAnimationFrame(animate);
        render();
    }
    function render () {
        let delta = clock.getDelta();
        controls.update(delta);
        renderer.render(scene, camera);
    }

    function randomRange (range) {
        return Math.random() * range - range / 2;
    }