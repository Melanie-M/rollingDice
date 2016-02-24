"use strict";

function Environment(width, height, viewAngle, near, far, backgroundColor) {
    var aspect;
    var self = this;
    
    //scene size and aspect
    this.width = width | window.innerWidth;
    this.height = height | window.innerHeight;
    backgroundColor = backgroundColor | 0xeeeeee;
    
    //camera attributes
    viewAngle = viewAngle | 45;
    near = near | 1;
    far = far | 10000;
    aspect = this.width / this.height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    this.controls = new THREE.TrackballControls(this.camera);
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    
    this.init = function() {
        //set camera
        this.camera.position.set(30, 50, 120);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        //set trackball controls
        this.initControls();
        //set renderer
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(backgroundColor, 1.0);
    };
    
    this.initControls = function() {
        var controls = this.controls;
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 0.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
    };

    this.addLight = function() {
        var pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(0, 300, 200);
        this.scene.add(pointLight);
    };
    
    this.addAxes = function() {
        this.scene.add(buildAxes(1000));
    };


    this.animate = function() {
        requestAnimationFrame(self.animate);
        self.controls.update();
        //dice.apply_forces();
        //dice.move();
        self.renderer.render(self.scene, self.camera);    
    };
};

function start() {
    var env = new Environment();
    env.init();
    env.addAxes();
    env.addLight(); 
    
    //add canvas to HTML
    document.body.appendChild(env.renderer.domElement);

    //dice
    var cube = new Dice();
    cube.mesh.position.set(0,20,0);
    env.scene.add(cube.mesh);
    
    //env.scene.add(dice.mesh);

    //loop
    env.animate();
}

function buildAxes(length) {
    var axes = new THREE.Object3D();
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0),
                       0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0),
                       0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0),
                        0x00FF00, false)); // +Y
    axes.add(buildAxis( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0),
                         0x00FF00, true)); // -Y
    axes.add(buildAxis( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length),
                         0x0000FF, false)); // +Z
    axes.add(buildAxis( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length),
                         0x0000FF, true)); // -Z
    return axes;
}

function buildAxis(src, dst, colorHex, dashed) {
    var geom = new THREE.Geometry(), mat;
    if(dashed) {
        mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
    }
    else {
        mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }
    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());
    geom.computeLineDistances(); // otherwise dashed lines will appear as simple plain lines
    var axis = new THREE.Line(geom, mat, THREE.LineSegments);
    return axis;
}

function Floor(width, length, col) {
    width = width | 500;
    length = length | 500;
    col = col | 0xffffff;
    var geo = new THREE.PlaneGeometry(width, length);
    var mat = new THREE.MeshBasicMaterial({color: col});
    var plane = new THREE.Mesh(geo, mat); //placed in plane xy, z=0 
    plane.rotation.x = -Math.PI/2;
    //plane.position.y = ;
    return plane; 
}

function SquareDice(size, col) {
    size = size | 10;
    col = col | 0xcccccc;
    var mat = new THREE.MeshBasicMaterial({color: col, wireframe: true});
    var cube = new THREE.Mesh(new THREE.CubeGeometry(size, size, size), mat);
    return cube;
}

function Dice(diceType, size, col, mass) {
    this.diceType = diceType | "square";
    this.mass = mass | 10;
    this.col = col | 0xcccccc;
    this.size = size | 10;
    
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.force =  new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0 ,0);

    this.mesh = SquareDice(size, col);  //in the future, switch case for dice type
    this.position = this.mesh.position;
    
    this.throw = function() {
        //initial position
        this.position = new THREE.Vector3(0, 50, 0);
        //reset speed
        this.velocity = new THREE.Vector3(0, 0, 0);
        //apply random force in one direction (x)
        this.force.set(2, 0, 0);
        //apply rotation perpendicular (z)
        this.rotation.set(0, 0 , 0.1);
    };

    this.apply_forces = function() {
        if (this.position.y <= -600) {
            //floor: stop
        }
        else {
            //gravity
            var p = this.mass * 0.0098; //9.8 m/s^2
            this.force.y = this.force.y - p;
        }
    };

    this.move = function(dt) {
        dt = dt | 1;

        console.log(this.mesh.position.y);
        
        //new velocity
        this.velocity.addScaledVector(this.force, dt / this.mass);

        //new position
        this.mesh.position.addScaledVector(this.velocity, dt);
    };
}

