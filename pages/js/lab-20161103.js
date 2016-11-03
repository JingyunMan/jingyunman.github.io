// shouldnt be a global :(
var particleColors = [
  new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red 0
  new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green 1
  new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue 2
  new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange 3
  new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise 4
  new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta 5
  new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold 6
  new b2ParticleColor(0x00, 0xff, 0xff, 0xff) // cyan 7
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
var mt=false;
var rho0=10;
var gravity=20;

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
  this.touchJoint = null;
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
var touching=0;

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
    // var body;
    document.addEventListener('touchstart', function(event) {
      event.preventDefault();  
      touching++;
      var p = getTouchCoords(event);
      var aabb = new b2AABB;
      var d = new b2Vec2;

      d.Set(0.01, 0.01);
      b2Vec2.Sub(aabb.lowerBound, p.p0, d);
      b2Vec2.Add(aabb.upperBound, p.p0, d);

      var queryCallback = new QueryCallback(p.p0);
      world.QueryAABB(queryCallback, aabb);
      
      if (queryCallback.fixture) {
        if(touching==1){
          body = queryCallback.fixture.body;
          var md = new b2MouseJointDef;
          md.bodyA = g_groundBody;
          md.bodyB = body;
          md.target = p.p0;
          md.maxForce = 100 * body.GetMass();
          that.mouseJoint = world.CreateJoint(md);
        }
        

        body.SetAwake(true);
      }
      if(touching==2){
        var md1 = new b2MouseJointDef;
        md1.bodyA = g_groundBody;
        md1.bodyB = body;
        md1.target = p.p0;
        md1.maxForce = 100 * body.GetMass();
        that.touchJoint = world.CreateJoint(md1);
      }
      
    });
    
    document.addEventListener('touchmove', function(event) {

        event.preventDefault();
        var p = getTouchCoords(event);
        // if (that.mouseJoint && touching==1) {
        //   that.mouseJoint.SetTarget(p.p0);
        // }
        // if(that.touchJoint && touching==1){
        //   that.touchJoint.SetTarget(new b2Vec2(p.p0.x+10*Math.cos(p.angle), p.p0.y+10*Math.sin(p.angle)));
        // }

        if(that.touchJoint){
          that.touchJoint.SetTarget(p.p0);
        }else if (that.mouseJoint ) {
            that.mouseJoint.SetTarget(p.p0);
        }

        // if (that.mouseJoint ) {
        //   that.mouseJoint.SetTarget(p.p0);
        // }
    });

    
    document.addEventListener('touchend', function(event) {
      event.preventDefault();
      touching=0;
      if (that.mouseJoint) {
        world.DestroyJoint(that.mouseJoint);
        that.mouseJoint = null;
      }
      
      if (that.touchJoint) {
        world.DestroyJoint(that.touchJoint);
        that.touchJoint = null;
      }
    });


    window.addEventListener( 'resize', onWindowResize, false );
    
    ResetWorld();
    world.SetGravity(new b2Vec2(0, -gravity));
    var bd = new b2BodyDef;
    g_groundBody = world.CreateBody(bd);

    // test= new Liquid();
    test=new Lab;
    // test=new multiTouch;

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
    if(isTouch(event)){
      var angle=0;
      var touch0 = new THREE.Vector3();
      touch0.x = (event.changedTouches[0].clientX / windowWidth) * 2 - 1;
      touch0.y = -(event.changedTouches[0].clientY / windowHeight) * 2 + 1;
      touch0.z = 0.5;

      projector.unprojectVector(touch0, camera);
      var dir = touch0.sub(camera.position).normalize();
      var distance = -camera.position.z / dir.z;
      var pos = camera.position.clone().add(dir.multiplyScalar(distance));
      var p0 = new b2Vec2(pos.x, pos.y);

      return {p0 : p0, angle: angle};
    }
}

window.addEventListener('load', initTestbed, false);

function RandomFloat(min, max) {
  return min + (max - min) * Math.random();
}
//multi-touch test
function multiTouch(){
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

  //box
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(0.0, 10.0);
  // bd.angle=Math.PI/6;
  // bd.fixedRotation=true;
  var body = world.CreateBody(bd);

  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(10, 10, new b2Vec2( 0.0, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, 10.0);


}
//cup
function Cup(x, y, w, h){
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  var body = world.CreateBody(bd);

  var thick=0.3, hh=h, ww=w;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww, thick, new b2Vec2( 0.0, -hh), 0.0);
  body.CreateFixtureFromShape(shape, rho0);  
}
//Dropper
function Dropper(x, y, w, h, ground){
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  var body = world.CreateBody(bd);

  var thick=0.1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2( -w, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2( w, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  var an=Math.PI*0.01;
  var h0=h*0.6, xx=-w-h0*Math.cos(an+Math.PI/2), yy=-h-h0+h0*Math.sin(an);
  shape.SetAsBoxXYCenterAngle(thick, h0, new b2Vec2( xx, yy), an);
  body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h0, new b2Vec2( -xx, yy), -an);
  body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  var h1=h*0.5;
  shape.SetAsBoxXYCenterAngle(w+thick*2, h1, new b2Vec2( 0, h+h1), 0);
  body.CreateFixtureFromShape(shape, rho0);

  //mario
  var antiG = gravity;
  var I = body.GetInertia();
  var m = body.GetMass();

  var radius = Math.sqrt(2 * I / m);

  // setup friction joint
  var jd = new b2FrictionJointDef;
  jd.bodyA = ground;
  jd.bodyB = body;
  jd.collideConnected = true;
  jd.maxForce = m * antiG;
  jd.maxTorque = m * radius * antiG;
  world.CreateJoint(jd);
}
//bottle
function Bottle(x, y, w, h){
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  // bd.fixedRotation=true;
  var body = world.CreateBody(bd);

  var thick=0.3, hh=h, ww=w, uw=ww/3;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww, thick, new b2Vec2( 0.0, -hh), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  var tx=ww-uw*0.5-thick/2;
  shape.SetAsBoxXYCenterAngle(uw, thick, new b2Vec2( tx, hh-thick), 0.0);
  body.CreateFixtureFromShape(shape, rho0);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(uw, thick, new b2Vec2( -tx, hh-thick), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  //瓶盖
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  // bd.fixedRotation=true;
  var body = world.CreateBody(bd);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(uw*2, thick, new b2Vec2( 0, hh+uw), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww-uw*2+thick*0.8, uw*1.5, new b2Vec2( 0, hh), 0.0);
  body.CreateFixtureFromShape(shape, rho0);
}
//tube
function Tube(x,y,w,h, thick, ground){
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  // bd.fixedRotation=true;
  var body = world.CreateBody(bd);

  var  hh=h, ww=w;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, 0.0), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww, thick, new b2Vec2( 0.0, -hh), 0.0);
  body.CreateFixtureFromShape(shape, rho0);

  var antiG = gravity;
  var I = body.GetInertia();
  var m = body.GetMass();

  var radius = Math.sqrt(2 * I / m);

  // setup friction joint
  var jd = new b2FrictionJointDef;
  jd.bodyA = ground;
  jd.bodyB = body;
  jd.collideConnected = true;
  jd.maxForce = m * antiG;
  jd.maxTorque = m * radius * antiG;
  world.CreateJoint(jd);
}
//Powder
function Powder(x,y, r, maxCount){
  this.count = 0;
  while(this.count<maxCount) {
    var bd = new b2BodyDef;
    bd.type = b2_dynamicBody;
    bd.position.Set(x, y);
    var body = world.CreateBody(bd);

    var shape = new b2PolygonShape;
    shape.SetAsBoxXY(r, r);
    body.CreateFixtureFromShape(shape, 10);
    ++this.count;
  }
}
function solvent(x,y,w,h,num){
    // Create particle system.
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.06;
    psd.dampingStrength = 0.1;
    var particleSystem = world.CreateParticleSystem(psd);

    // Create particle group on top of walker.
    var shape = new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(w,h, new b2Vec2(x,y), 0);
    var pd = new b2ParticleGroupDef();
    pd.flags = b2_tensileParticle | b2_viscousParticle;
    pd.shape = shape;
    // pd.color.Set(255, 0, 0, 255);
    pd.color=particleColors[num];
    var group = particleSystem.CreateParticleGroup(pd);
}
function Lab(){
    camera.position.y = 15;
    camera.position.z = 30;
    
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

    //solid
    Bottle(-20.0, 10.0, 2.5, 4.0);
    Powder(-20, 10, 0.3, 30);
    //Powder
    Bottle(-12.0, 10.0, 2.5, 4.0);
    Powder(-12, 10, 0.1, 300);
    //Liquid
    Bottle(-4.0, 10.0, 2.5, 4.0);
    solvent(-4.0, 10.0, 2, 3.0, 4.0);
    //Dropper
    Dropper(2.0, 10.0, 0.3, 2, ground);

    Tube(10.0, 15.0, 0.8, 8.0, 0.2, ground);
    //liquid
    solvent( 10, 15, 0.4, 5, 5.0);

    Cup(18.0, 10.0, 3.0, 5.0);
    
}
// Powder.prototype.Step = function() {
//   Step();
//   if (this.count < this.maxCount) {
//     var bd = new b2BodyDef;
//     bd.type = b2_dynamicBody;
//     bd.position.Set(0, 10);
//     var body = world.CreateBody(bd);

//     var shape = new b2PolygonShape;
//     shape.SetAsBoxXY(0.125, 0.125);
//     body.CreateFixtureFromShape(shape, 10);
//     ++this.count;
//   }
// };

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
  conbd.position = new b2Vec2(0,d);
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
  psd.radius = 0.1;
  psd.dampingStrength = 0.1;
  var particleSystem = world.CreateParticleSystem(psd);

  // Create particle group on top of walker.
  var shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(4, 4, new b2Vec2(0, 6), 0);
  var pd = new b2ParticleGroupDef();
  pd.flags = b2_tensileParticle | b2_viscousParticle;
  pd.shape = shape;
  var group = particleSystem.CreateParticleGroup(pd);
}

