// shouldnt be a global :(
var particleColors = [
  new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red
  new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green
  new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue
  new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange
  new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise
  new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta
  new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold
  new b2ParticleColor(0x00, 0xff, 0xff, 0xff) // cyan
];
var container;
var world = null;
var threeRenderer;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
// var test = {};
var projector = new THREE.Projector();
var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var g_groundBody = null;
var test;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

function printErrorMsg(msg) {
  var domElement = document.createElement('div');
  domElement.style.textAlign = 'center';
  domElement.innerHTML = msg;
  document.body.appendChild(domElement);
}

function initTestbed() {
  camera = new THREE.PerspectiveCamera(70
    , windowWidth / windowHeight
    , 1, 1000);

  try {
    threeRenderer = new THREE.WebGLRenderer();
  } catch( error ) {
    printErrorMsg('<p>Sorry, your browser does not support WebGL.</p>'
                + '<p>This testbed application uses WebGL to quickly draw'
                + ' LiquidFun particles.</p>'
                + '<p>LiquidFun can be used without WebGL, but unfortunately'
                + ' this testbed cannot.</p>'
                + '<p>Have a great day!</p>');
    return;
  }

  threeRenderer.setClearColor(0xEEEEEE);
  threeRenderer.setSize(windowWidth, windowHeight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
  scene = new THREE.Scene();
  camera.lookAt(scene.position);

  document.body.appendChild( this.threeRenderer.domElement);

  this.mouseJoint = null;
  // hack
  renderer = new Renderer();
  var gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);
  Testbed();
}
function testSwitch(testName) {
  ResetWorld();
  world.SetGravity(new b2Vec2(0, -10));
  var bd = new b2BodyDef;
  g_groundBody = world.CreateBody(bd);
  test = new window[testName];
}
function isTouch(evt){
  var type = evt.type;
    if(type.indexOf('touch')>=0){
      return true;
  }else{
    return false;
  }
}
function Testbed(obj) {
    var that = this;
    document.addEventListener('keypress', function(event) {
        if (test.Keyboard !== undefined) {
          test.Keyboard(String.fromCharCode(event.which) );
        }
    });
    document.addEventListener('keyup', function(event) {
        if (test.KeyboardUp !== undefined) {
          test.KeyboardUp(String.fromCharCode(event.which) );
        }
    });

    document.addEventListener('mousedown', function(event) {
        var p = getMouseCoords(event);
        var aabb = new b2AABB;
        var d = new b2Vec2;

        d.Set(0.01, 0.01);
        b2Vec2.Sub(aabb.lowerBound, p, d);
        b2Vec2.Add(aabb.upperBound, p, d);

        var queryCallback = new QueryCallback(p);
        world.QueryAABB(queryCallback, aabb);
        
        if (queryCallback.fixture) {
          var body = queryCallback.fixture.body;
          var md = new b2MouseJointDef;
          md.bodyA = g_groundBody;
          md.bodyB = body;
          md.target = p;
          md.maxForce = 100 * body.GetMass();
          that.mouseJoint = world.CreateJoint(md);
          body.SetAwake(true);
        }
        if (test.MouseDown !== undefined) {
          test.MouseDown(p);
        }

    });
    document.addEventListener('mousemove', function(event) {
        var p = getMouseCoords(event);
        if (that.mouseJoint) {
          that.mouseJoint.SetTarget(p);
        }
        if (test.MouseMove !== undefined) {
          test.MouseMove(p);
        }
    });
    document.addEventListener('mouseup', function(event) {
      if (that.mouseJoint) {
        world.DestroyJoint(that.mouseJoint);
        that.mouseJoint = null;
      }
      if (test.MouseUp !== undefined) {
        test.MouseUp(getMouseCoords(event));
      }
    });
    document.addEventListener('touchstart', function(event) {
      if(isTouch(event)){
        event.preventDefault();
        var p = getTouchCoords(event);
        var aabb = new b2AABB;
        var d = new b2Vec2;

        d.Set(0.01, 0.01);
        b2Vec2.Sub(aabb.lowerBound, p, d);
        b2Vec2.Add(aabb.upperBound, p, d);

        var queryCallback = new QueryCallback(p);
        world.QueryAABB(queryCallback, aabb);
        
        if (queryCallback.fixture) {
          var body = queryCallback.fixture.body;
          var md = new b2MouseJointDef;
          md.bodyA = g_groundBody;
          md.bodyB = body;
          md.target = p;
          md.maxForce = 100 * body.GetMass();
          that.mouseJoint = world.CreateJoint(md);
          body.SetAwake(true);
        }
        if (test.MouseDown !== undefined) {
          test.MouseDown(p);
        }
      }
        

    });

    
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
        var p = getTouchCoords(event);
        if (that.mouseJoint) {
          that.mouseJoint.SetTarget(p);
        }
        if (test.MouseMove !== undefined) {
          test.MouseMove(p);
        }
    });

    
    document.addEventListener('touchend', function(event) {
      event.preventDefault();
      if (that.mouseJoint) {
        world.DestroyJoint(that.mouseJoint);
        that.mouseJoint = null;
      }
      if (test.MouseUp !== undefined) {
        test.MouseUp(getTouchCoords(event));
      }
    });


    window.addEventListener( 'resize', onWindowResize, false );
    
    // ResetWorld();
    world.SetGravity(new b2Vec2(0, -20));
    var bd = new b2BodyDef;
    g_groundBody = world.CreateBody(bd);

    // Liquid();
    // Powder();
    test=new Powder;

    render();
}

var render = function() {
  // bring objects into world
  renderer.currentVertex = 0;
  if (test.Step !== undefined) {
    test.Step();
  }
  else {
    Step();
  }
  renderer.draw();

  threeRenderer.render(scene, camera);
  requestAnimationFrame(render);
};

var ResetWorld = function() {
  if (world !== null) {
    while (world.joints.length > 0) {
      world.DestroyJoint(world.joints[0]);
    }

    while (world.bodies.length > 0) {
      world.DestroyBody(world.bodies[0]);
    }

    while (world.particleSystems.length > 0) {
      world.DestroyParticleSystem(world.particleSystems[0]);
    }
  }
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
};

var Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
};

/**@constructor*/
function QueryCallback(point) {
  this.point = point;
  this.fixture = null;
}

/**@return bool*/
QueryCallback.prototype.ReportFixture = function(fixture) {
  var body = fixture.body;
  if (body.GetType() === b2_dynamicBody) {
    var inside = fixture.TestPoint(this.point);
    if (inside) {
      this.fixture = fixture;
      return true;
    }
  }
  return false;
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  threeRenderer.setSize( window.innerWidth, window.innerHeight );
}

function getMouseCoords(event) {
    var mouse = new THREE.Vector3();
    mouse.x = (event.clientX / windowWidth) * 2 - 1;
    mouse.y = -(event.clientY / windowHeight) * 2 + 1;
    mouse.z = 0.5;

    projector.unprojectVector(mouse, camera);
    var dir = mouse.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    var p = new b2Vec2(pos.x, pos.y);
    return p;
}
function getTouchCoords(event) {
    var touch0 = new THREE.Vector3();
    touch0.x = (event.changedTouches[0].clientX / windowWidth) * 2 - 1;
    touch0.y = -(event.changedTouches[0].clientY / windowHeight) * 2 + 1;
    touch0.z = 0.5;

    projector.unprojectVector(touch0, camera);
    var dir = touch0.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    var p = new b2Vec2(pos.x, pos.y);
    return p;
}

window.addEventListener('load', initTestbed, false);

function RandomFloat(min, max) {
  return min + (max - min) * Math.random();
}

//Powder
function Powder(){
    camera.position.y = 15;
    camera.position.z = 30;

    this.maxCount = 100;
    this.count = 0;
    // Ground
    var bd = new b2BodyDef;
    var ground = world.CreateBody(bd);

    var b2w=windowWidth/30, b2ww=b2w;
    var b2h=windowHeight/15;

    var shape = new b2EdgeShape;
    shape.Set(new b2Vec2(-b2ww, 0.0), new b2Vec2(b2ww, 0.0));
    ground.CreateFixtureFromShape(shape, 0.0);

    shape = new b2EdgeShape;
    shape.Set(new b2Vec2(-b2ww, 0.0), new b2Vec2(-b2ww, b2h));
    ground.CreateFixtureFromShape(shape, 0.0);

    shape = new b2EdgeShape;
    shape.Set(new b2Vec2(b2ww, 0.0), new b2Vec2(b2ww, b2h));
    ground.CreateFixtureFromShape(shape, 0.0);

    //Cup
    var bd= new b2BodyDef;
    bd.type = b2_dynamicBody;
    bd.position.Set(0.0, 10.0);
    var body = world.CreateBody(bd);

    var thick=0.2, hh=4.0, ww=3.0;
    var shape=new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, 0.0), 0.0);
    body.CreateFixtureFromShape(shape, 5.0);

    shape = new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, 0.0), 0.0);
    body.CreateFixtureFromShape(shape, 5.0);

    shape = new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(ww, thick, new b2Vec2( 0.0, -hh), 0.0);
    body.CreateFixtureFromShape(shape, 5.0);

}
Powder.prototype.Step = function() {
  Step();
  if (this.count < this.maxCount) {
    var bd = new b2BodyDef;
    bd.type = b2_dynamicBody;
    bd.position.Set(0, 10);
    var body = world.CreateBody(bd);

    var shape = new b2PolygonShape;
    shape.SetAsBoxXY(0.125, 0.125);
    body.CreateFixtureFromShape(shape, 1);
    ++this.count;
  }
};

//liquid
function Liquid() {
  camera.position.y = 15;
  camera.position.z = 50;

  this.offset = new b2Vec2(0.0, 8.0);
  this.motorSpeed = 2.0;
  this.motorOn = true;
  var pivot = new b2Vec2(0.0, 0.8);

  // Ground
  var bd = new b2BodyDef;
  var ground = world.CreateBody(bd);

  var shape = new b2EdgeShape;
  shape.Set(new b2Vec2(-50.0, 0.0), new b2Vec2(50.0, 0.0));
  ground.CreateFixtureFromShape(shape, 0.0);

  shape = new b2EdgeShape;
  shape.Set(new b2Vec2(-50.0, 0.0), new b2Vec2(-50.0, 10.0));
  ground.CreateFixtureFromShape(shape, 0.0);

  shape = new b2EdgeShape;
  shape.Set(new b2Vec2(50.0, 0.0), new b2Vec2(50.0, 10.0));
  ground.CreateFixtureFromShape(shape, 0.0);


  var temp = new b2Vec2();

//container
  var confd = new b2FixtureDef;
  confd.filter.groupIndex = -1;
  confd.density = 1.0;

  // var container0 = new b2PolygonShape;
  var d=0.6,ll=-5,rr=-ll,hh=15;

  var conbd = new b2BodyDef;
  conbd.type = b2_dynamicBody;
  conbd.position = new b2Vec2(0,hh);
//forbid rotation of the container
  conbd.fixedRotation=true;
  var conbody = world.CreateBody(conbd);

  var container0=new b2PolygonShape;
  container0.SetAsBoxXY((rr-ll)/2,d/2);
  confd.shape=container0;
  conbody.CreateFixtureFromDef(confd);

  var container1 = new b2PolygonShape;
  container1.vertices.push(new b2Vec2(ll,0), new b2Vec2(ll,hh),new b2Vec2(ll-d,hh),new b2Vec2(ll-d,0));
  confd.shape=container1;
  conbody.CreateFixtureFromDef(confd);

  var container2 = new b2PolygonShape;
  container2.vertices.push(new b2Vec2(rr,0), new b2Vec2(rr,hh),new b2Vec2(rr+d,hh),new b2Vec2(rr+d,0));
  confd.shape=container2;
  conbody.CreateFixtureFromDef(confd);
  
  // Create particle system.
  var psd = new b2ParticleSystemDef();
  psd.radius = 0.15;
  psd.dampingStrength = 0.1;
  var particleSystem = world.CreateParticleSystem(psd);

  // Create particle group on top of walker.
  var shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(4, 8, new b2Vec2(0, 25), 0);
  var pd = new b2ParticleGroupDef();
  pd.shape = shape;
  var group = particleSystem.CreateParticleGroup(pd);
}

