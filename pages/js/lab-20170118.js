// shouldnt be a global :(
var particleColors = [
  new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red 0
  new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green 1
  new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue 2
  new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange 3
  new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise 4
  new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta 5 pink
  new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold 6
  new b2ParticleColor(0x00, 0xff, 0xff, 0xff), // cyan 7
  new b2ParticleColor(255, 255, 255, 0xff), //white 8
  new b2ParticleColor(0, 0, 0, 0xff) //black 9

];
var container=[];
var chemis=[];
var plug=[];
var stage;
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
var gravity=10;
var ground, particleSystem;
var burner, match;
var solv=new Array(), dop;
var CaCO3;
var HCl, NaOH, HIn, CuSO4, H2SO4;
var tt=[];
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;


var FizzyText = function() {
  var hy=20;
  this.beaker=function(){
    var c0=new Cup(23.0, hy, 3.0, 5.0, ground);
    c0.body.SetLinearVelocity(new b2Vec2(0, -10));
  };
  this.tube=function(){
    var t1=new Tube(23.0, hy, 0.3, ground);
    t1.body.SetLinearVelocity(new b2Vec2(0, -10));
    container.push(t1);
  };
  this.flask=function(){
    var f0=new Flask(23.0, hy, ground);
    f0.body.SetLinearVelocity(new b2Vec2(0, -10));
    container.push(f0);
  }
  this.spoon=false;
  this.dropper=false;
  this.rod=false;
  this.gasJar=function(){
    var j0=new GasJar(23.0, hy, 2.0, 4.0);
    j0.body.SetLinearVelocity(new b2Vec2(0, -10));
    container.push(j0);
  }
  this.plugDelivery=function(){
    var rp0=new RubberPlug(23.0, hy, ground);
    rp0.body.SetLinearVelocity(new b2Vec2(0, -10));
    plug.push(rp0);
  }
  this.stage=false;
  this.alcoholBurner=false;
  this.match=false;
  this.trough=false;
  this.glassDelivery=function(){
    var gd0=new GlassDelivery(23.0, hy, 10, 10, ground);

  }
  this.KClO3=false;
  this.MnO2=false;
  this.CaCO3=false;
  this.KMnO4=false;

  this.HCl=false;
  this.NaOH=false;
  this.HIn=false;
  this.CuSO4=false;
  this.H2SO4=false;
};
var text;
function initGUI() {
  text = new FizzyText();
  var hy=20, xw=23.0;
  var gui = new dat.GUI(); 
  var f1=gui.addFolder("apparatus");
  f1.add(text, "beaker");
  f1.add(text, "tube");
  f1.add(text, "flask"); 
  f1.add(text, 'gasJar');
  var s1;
  f1.add(text, 'spoon').onChange(function(value){
    if(text.spoon){
      s1=new Spoon(xw, hy, ground);
      s1.body.SetLinearVelocity(new b2Vec2(0, -10));
    }else{
      world.DestroyBody(s1.body);
    }
  });;
  f1.add(text, 'dropper').onChange(function(value){
    if(text.dropper){
      dop=new Dropper(xw, hy, 0.3, 2, ground);
      dop.body.SetLinearVelocity(new b2Vec2(0, -10));
    }else{
      world.DestroyBody(dop.body);
    }
  });
  var r0;
  f1.add(text, 'rod').onChange(function(value){
    if(text.rod){
      r0=new Rod(xw, hy, ground);
      r0.body.SetLinearVelocity(new b2Vec2(0, -10));
    }else{
      world.DestroyBody(r0.body);
    }
  });
  f1.add(text, 'plugDelivery');
  f1.add(text, 'stage').onChange(function(value){
    if(text.stage){
      stage=new Stage(xw, hy, ground);
      stage.body1.SetLinearVelocity(new b2Vec2(0, -10));
    }else{
      world.DestroyBody(stage.body);
      world.DestroyBody(stage.body1);
      world.DestroyBody(stage.body2);
    }
  });
  f1.add(text, 'alcoholBurner').onChange(function(value){
    if(text.alcoholBurner){
      burner=new AlcoholBurner(xw, hy);
      chemis.push(burner);
      burner.body.SetLinearVelocity(new b2Vec2(0, -10));
      burner.body1.SetLinearVelocity(new b2Vec2(0, -10));
    }else{
      world.DestroyBody(burner.body);
      world.DestroyBody(burner.body1);
    }
  });
  f1.add(text, 'match').onChange(function(value){
    if(text.match){
      match=new Match(xw, hy);
    }else{
      world.DestroyBody(match.body);
      for(var i=0; i<match.maxCount; ++i)
        world.DestroyBody(match.fireBody[i]);
    }
  });
  var t0, s0;
  f1.add(text, 'trough').onChange(function(value){    
    if(text.trough){
      t0=new Trough(xw, -3, ground);
      s0=new solvent(particleSystem, xw, 1.5, 4, 4, 4);
    }else{
      world.DestroyBody(t0.body);
      world.DestroyParticleSystem(s0.particleSystem);
    }
  });
  f1.add(text, 'glassDelivery');
  // f1.open();
  var f2=gui.addFolder("Chemicals");
  var sol=f2.addFolder('solid');
  var b0, b1, b2, b3, b4, b5, b6, b7, b8;
  var p0, p1;
  sol.add(text, 'KClO3').onChange(function(value){
    if(text.KClO3){
      b0=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b0);
      p0=new Powder(xw, hy-5, 0.1, 100, 255, 255, 255);
    }else{     
      world.DestroyBody(b0.body);
      world.DestroyBody(b0.body1);
      while(p0.count>0)
        world.DestroyBody(p0.body[--p0.count]);
    }
  });  sol.add(text, 'MnO2').onChange(function(value){
    if(text.MnO2){
      b1=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b1);
      p1= new Powder(xw, hy-5, 0.1, 100);
    }else{      
      world.DestroyBody(b1.body);
      world.DestroyBody(b1.body1);
      while(p1.count>0)
        world.DestroyBody(p1.body[--p1.count]);
    }
  });
  sol.add(text, 'CaCO3').onChange(function(value){
    if(text.CaCO3){
      b4=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b4);
      CaCO3=new Powder(xw, hy-5, 0.1, 100, 255, 255, 255);
    }
  });
  sol.add(text, 'KMnO4').onChange(function(value){
    if(text.KMnO4){
      b8=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b8);
      // KMnO4=new Powder(xw, hy-5, 0.1, 100, 0x33, 0x00, 0x33);
      KMnO4=new Powder(xw, hy-5, 0.15, 100);
    }
  });
  var flu=f2.addFolder('fluid');
  flu.add(text, 'HCl').onChange(function(value){
    if(text.HCl){
      b2=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b2);
      HCl=new solvent(particleSystem,xw, hy-5, 2, 1, 8);
      solv.push(HCl);
    }else{
      HCl.group.DestroyParticles(false);
      world.DestroyBody(b2.body);
      world.DestroyBody(b2.body1);
    }
  });
  flu.add(text, 'NaOH').onChange(function(value){
    if(text.NaOH){
      b3=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b3);
      NaOH=new solvent(particleSystem,xw, hy-5, 2, 1, 8);
      solv.push(NaOH);
    }else{
      NaOH.group.DestroyParticles(false);
      world.DestroyBody(b3.body);
      world.DestroyBody(b3.body1);
    }
  });
  flu.add(text, 'HIn').onChange(function(value){
    if(text.HIn){
      b5=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b5);
      HIn=new solvent(particleSystem,xw, hy-5, 2, 1, 8);
      solv.push(HIn);
    }else{
      HIn.group.DestroyParticles(false);
      world.DestroyBody(b5.body);
      world.DestroyBody(b5.body1);
    }
  });
  flu.add(text, 'CuSO4').onChange(function(value){
    if(text.CuSO4){
      b6=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b6);
      CuSO4=new solvent(particleSystem,xw, hy-5, 2, 1, 4);
      solv.push(CuSO4);
    }else{
      CuSO4.group.DestroyParticles(false);
      world.DestroyBody(b6.body);
      world.DestroyBody(b6.body1);
    }
  });
  flu.add(text, 'H2SO4').onChange(function(value){
    if(text.H2SO4){
      b7=new Bottle(xw, hy, 1.5, 3.0, 0.3);
      chemis.push(b7);
      H2SO4=new solvent(particleSystem,xw, hy-5, 2, 1, 8);
      solv.push(H2SO4);
    }else{
      H2SO4.group.DestroyParticles(false);
      world.DestroyBody(b7.body);
      world.DestroyBody(b7.body1);
    }
  });
  f2.open();
};

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

  // threeRenderer.setClearColor("#BDBAB4");
  threeRenderer.setClearColor("#E4E4E4");
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
  var G = new b2Vec2(0, -gravity);
  world = new b2World(G);
  initGUI();
  // var viz = d3.select('body').append('svg').attr('id', 'viz').append('g').classed('world', true);
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
//检查鼠标触碰到盖着的瓶盖，解除瓶盖关节，瓶子打开。
function c0(p, obj, queryCallback,that){
  var dd=b2Vec2.distance(p, obj.body1.GetPosition());
  if(obj.weldJoint && dd<1){
    obj.onCap=true;
    world.DestroyJoint(obj.weldJoint);
    obj.weldJoint=null;
    // if(!queryCallback.fixture){
    //   var body = obj.body1;
    //   var md = new b2MouseJointDef;
    //   md.bodyA = g_groundBody;
    //   md.bodyB = body;
    //   md.target = p;
    //   md.maxForce = 100 * body.GetMass();
    //   that.mouseJoint = world.CreateJoint(md);
    //   body.SetAwake(true);
    // }
  } 
}
//当瓶盖接近瓶口，构建瓶盖与瓶口的关节，瓶子关上。
function c1(obj){
  if(!obj.weldJoint){
    var d1=b2Vec2.distance(obj.body1.GetPosition(), obj.body.GetPosition());
    if(d1<2){
      var jd = new b2WeldJointDef;
      jd.bodyA = obj.body;
      jd.bodyB = obj.body1;
      jd.localAnchorA.Set(0, obj.laAy);
      jd.localAnchorB.Set(0, 0);
      obj.weldJoint= world.CreateJoint(jd);
    }
  }      
  obj.onCap=false;
}
//当mousedown时，且鼠标接触塞子，若塞子与容器有连接，解除连接
function c2(p, ob1, jointOn, queryCallback, that, pos){//ob1:手持物;关节在jointOn(ob1 or ob2)上
  if(pos==undefined) pos=ob1.GetPosition();
  var d=b2Vec2.distance(p, pos);
  if(jointOn.weldJoint && d<1.5){
    world.DestroyJoint(jointOn.weldJoint);
    jointOn.weldJoint=null;
    if(!queryCallback.fixture){
      var body = ob1;
      var md = new b2MouseJointDef;
      md.bodyA = g_groundBody;
      md.bodyB = body;
      md.target = p;
      md.maxForce = 100 * body.GetMass();
      that.mouseJoint = world.CreateJoint(md);
      body.SetAwake(true);
    }
  } 
}
//当mouseup时，若塞子与容器无连接，检查塞子与容器口的距离，连接塞子与容器
function c3(ob1, ob2, x, y, jointOn){//ob1:手持物，ob2:被塞物; 
  if(!jointOn.weldJoint){
    var d=b2Vec2.distance(ob1.GetPosition(), ob2.GetPosition());
    if(d<3){
      var jd = new b2WeldJointDef;
      jd.bodyA = ob1;
      jd.bodyB = ob2;
      jd.localAnchorA.Set(x, y);
      jd.localAnchorB.Set(0, 0);
      jointOn.weldJoint= world.CreateJoint(jd);//关节建立在jointOn(ob1 or ob2)上
      // var pjd = new b2PrismaticJointDef;
      // jointOn.PrismaticJoint=pjd.InitializeAndCreate(ob2.body, ob1.body, new b2Vec2(-0.1, 0.0), new b2Vec2(0.0, 1.0));
    }
  }
}
function c22(p, ob1, jointOn, queryCallback, that, pos){//ob1:手持物，ob2:被塞物; 
                                                  //关节在jointOn(ob1 or ob2)上
  if(pos==undefined) pos=ob1.GetPosition();
  var d=b2Vec2.distance(p, pos);
  if(jointOn.weldJoint2 && d<1){
    world.DestroyJoint(jointOn.weldJoint2);
    jointOn.weldJoint2=null;
    if(!queryCallback.fixture){
      var body = ob1;
      var md = new b2MouseJointDef;
      md.bodyA = g_groundBody;
      md.bodyB = body;
      md.target = p;
      md.maxForce = 100 * body.GetMass();
      that.mouseJoint = world.CreateJoint(md);
      body.SetAwake(true);
    }
  } 
}
function c32(ob1, ob2, x, y, jointOn, pos){//ob1:手持物，ob2:被塞物; 
  if(!jointOn.weldJoint2){
    var hand=new b2Vec2;
    if(pos!=undefined)
      b2Vec2.Add(hand, ob1.GetPosition(), pos);
    else
      hand=ob1.GetPosition();
    var d=b2Vec2.distance(hand, ob2.GetPosition());
    if(d<3){
      var jd = new b2WeldJointDef;
      jd.bodyA = ob1;
      jd.bodyB = ob2;
      jd.localAnchorA.Set(x, y);
      jd.localAnchorB.Set(0, 0);
      jointOn.weldJoint2= world.CreateJoint(jd);//关节建立在jointOn(ob1 or ob2)上
    }
  }
}
//fire the alchol burner
function kindle(ob1, ob2){
  if(!ob1.weldJoint){
    var dis=b2Vec2.distance(ob1.body.GetPosition(), ob2.body.GetPosition());
    if(dis<1){
      ob1.flame=true;
      // console.info(ob1.flame);
    }
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
    document.addEventListener('dblclick', function(event){ 
      if(dop){
        var it=dop;
        var objPos=it.body.GetPosition();
        objPos.y+=3;
        var p=getMouseCoords(event); 
        var dd=b2Vec2.distance(p, objPos);
        if(dd<1){
          dop.sucking*=-1;
        }
      }
    });
    var mdown=false;
    var mjc=0;
    document.addEventListener('mousedown', function(event) {
        var p = getMouseCoords(event); 
        var aabb = new b2AABB;
        var d = new b2Vec2;
        mdown=true;
        d.Set(0.01, 0.01);
        b2Vec2.Sub(aabb.lowerBound, p, d);
        b2Vec2.Add(aabb.upperBound, p, d);

        var queryCallback = new QueryCallback(p);
        world.QueryAABB(queryCallback, aabb);
        if (queryCallback.fixture && mjc==0) {
          var body = queryCallback.fixture.body; 
          var md = new b2MouseJointDef;
          md.bodyA = g_groundBody;
          md.bodyB = body;
          md.target = p;
          md.maxForce = 1000 * body.GetMass();
          that.mouseJoint = world.CreateJoint(md);
          ++mjc;
          body.SetAwake(true);
        }
        var pl=plug.length, chl=chemis.length, cl=container.length;
        for(var i=0; i<chl; ++i)
          c0(p, chemis[i], queryCallback,that);
        for(var i=0; i<pl; ++i)
          c2(p, plug[i].body, plug[i], queryCallback, that);
        for(var i=0; i<pl; ++i)
          c22(p, plug[i].body2, plug[i], queryCallback, that);
        if(stage)
          for(var i=0; i<cl; ++i){
            var pp=new b2Vec2;
            b2Vec2.Add(pp, container[i].body.GetPosition(), new b2Vec2(0, -4));
            c2(p, container[i], stage, queryCallback, that, pp);
          }
        
        //解除铁架台上方小夹子与容器的连接
        if(stage)
          for(var i=0; i<cl; ++i){
            var angle=container[i].body.GetAngle();
            var pp=new b2Vec2;
            b2Vec2.Add(pp, container[i].body.GetPosition(), 
              new b2Vec2(4*Math.sin(angle), -4*Math.cos(angle)));
            c22(p, container[i], stage, queryCallback, that, pp);
          }
    });
    document.addEventListener('mousemove', function(event) {
        var p = getMouseCoords(event);
        if (that.mouseJoint) {
          that.mouseJoint.SetTarget(p);
        }
        if(burner){
          if(burner.weldJoint){
            if(burner.flame)
              for(var i=0; i<burner.maxCount; ++i)
                world.DestroyBody(burner.fireBody[i]);
            burner.flame=false;
            burner.count=0;
          }
          if(match) kindle(burner, match);
        }
        
    });
    document.addEventListener('mouseup', function(event) {
      mdown=false;
      var pl=plug.length, chl=chemis.length, cl=container.length;
      for(var i=0; i<chl; ++i)
          c1(chemis[i]);
      for(var i=0; i<cl; ++i){
        //容器插入铁架台的大夹子body2
        if(stage) c3(container[i].body, stage.body2, 0, -4, stage);
        for(var j=0; j<pl; ++j)
          //plug插入容器
          c3(plug[j].body, container[i].body,0, 0.5, plug[j]);
      }
      //plug的管子插入另一个plug
      for(var i=0; i<pl; ++i)
        for(var j=0; j<pl; ++j)
          c32(plug[i].body2, plug[j].body, 0.6, 5, plug[i]);
      //试管插入铁架台上方小夹子body
      if(stage){
        for(var i=0; i<cl; ++i){
          var tu=container[i];
          var angle=tu.body.GetAngle();
          c32(tu.body, stage.body, 0, -4, stage, 
            new b2Vec2(tu.height*Math.sin(angle),-tu.height*Math.cos(angle)));
        }
      }
      if (that.mouseJoint) {
        --mjc;
        world.DestroyJoint(that.mouseJoint);
        that.mouseJoint = null;
      }
      if (test.MouseUp !== undefined) {
        test.MouseUp(getMouseCoords(event));
      }
    });

    document.addEventListener('touchstart', function(event) {
      // event.preventDefault();  
      touching++;
      mdown=true;
      var p = getTouchCoords(event);
      var aabb = new b2AABB;
      var d = new b2Vec2;

      d.Set(0.01, 0.01);
      b2Vec2.Sub(aabb.lowerBound, p, d);
      b2Vec2.Add(aabb.upperBound, p, d);

      var queryCallback = new QueryCallback(p);
      world.QueryAABB(queryCallback, aabb);
      
      if (queryCallback.fixture) {
        if(touching==1){
          body = queryCallback.fixture.body;
          var md = new b2MouseJointDef;
          md.bodyA = g_groundBody;
          md.bodyB = body;
          md.target = p;
          md.maxForce = 100 * body.GetMass();
          that.mouseJoint = world.CreateJoint(md);
        }
        body.SetAwake(true);
      }
      if(touching==2){
        var md1 = new b2MouseJointDef;
        md1.bodyA = g_groundBody;
        md1.bodyB = body;
        md1.target = p;
        md1.maxForce = 100 * body.GetMass();
        that.touchJoint = world.CreateJoint(md1);
      }
      var pl=plug.length, chl=chemis.length, cl=container.length;
      for(var i=0; i<chl; ++i)
        c0(p, chemis[i], queryCallback,that);
      for(var i=0; i<pl; ++i)
        c2(p, plug[i].body, plug[i], queryCallback, that);
      for(var i=0; i<pl; ++i)
        c22(p, plug[i].body2, plug[i], queryCallback, that);
    });
    
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
        var p = getTouchCoords(event);
        if(that.touchJoint){
          that.touchJoint.SetTarget(p);
        }else if (that.mouseJoint ) {
            that.mouseJoint.SetTarget(p);
        }
    });

    
    document.addEventListener('touchend', function(event) {
      // event.preventDefault();
      mdown=false;
      var pl=plug.length, chl=chemis.length, cl=container.length;
      for(var i=0; i<chl; ++i)
          c1(chemis[i]);
      for(var i=0; i<cl; ++i)
        for(var j=0; j<pl; ++j)
          c3(plug[j].body, container[i].body,0, 0.5, plug[j]);

      for(var i=0; i<pl; ++i)
        for(var j=0; j<pl; ++j)
          c32(plug[i].body2, plug[j].body,0.6, 5, plug[i]);
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
  // container[0].body.SetType(b2_dynamicBody);
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
}

window.addEventListener('load', initTestbed, false);

function RandomFloat(min, max) {
  return min + (max - min) * Math.random();
}
function friction(body, gd){
  var antiG = gravity;
  var I = body.GetInertia();
  var m = body.GetMass();
  var radius = Math.sqrt(2 * I / m);
  // setup friction joint
  var jd = new b2FrictionJointDef;
  jd.bodyA = gd;
  jd.bodyB = body;
  jd.collideConnected = true;
  jd.maxForce = m * antiG;
  jd.maxTorque = m * radius * antiG;
  world.CreateJoint(jd);
}
function Cup(x, y, w, h, ground){  
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body = world.CreateBody(bd);

  var thick=0.4, hh=h, ww=w;
  this.w=w;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww, thick, new b2Vec2( 0.0, -hh), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0); 

  friction(this.body,ground);
}
//酒精灯
function AlcoholBurner(x, y){
  this.onCap=false;
  this.bd= new b2BodyDef;
  this.bd.type = b2_dynamicBody;
  this.bd.fixedRotation=true;
  this.bd.position.Set(x, y);
  this.body = world.CreateBody(this.bd);
  this.rho=rho0;
  var shape=new b2PolygonShape;
  shape.vertices[0]=new b2Vec2(-1, -1.5);
  shape.vertices[1]=new b2Vec2(-3.5, -3);
  shape.vertices[2]=new b2Vec2(-2, -6.5);
  shape.vertices[3]=new b2Vec2(2, -6.5);
  shape.vertices[4]=new b2Vec2(3.5, -3);
  shape.vertices[5]=new b2Vec2(1, -1.5);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(1, 0.75, new b2Vec2( 0, -0.75), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  

  friction(this.body,ground);

  //瓶盖
  this.bd1= new b2BodyDef;
  this.bd1.type = b2_dynamicBody;
  this.bd1.position.Set(x, y);
  this.body1=world.CreateBody(this.bd1);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.1, 1.5, new b2Vec2( -1-0.15, 0.0), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(-0.1, 1.5, new b2Vec2( 1+0.15, 0.0), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(1, 0.5, new b2Vec2( 0, 1), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho);

  this.laAy=0;
  var jd = new b2WeldJointDef;
  jd.bodyA = this.body;
  jd.bodyB = this.body1;
  jd.localAnchorA.Set(0, 0);
  jd.localAnchorB.Set(0, 0);
  this.weldJoint= world.CreateJoint(jd); 

  this.flame=false;
  this.count = 0;
  this.maxCount=60;
  this.fireBody=new Array(this.maxCount);
  this.firePos=new Array(this.maxCount);
}
AlcoholBurner.prototype.step=function(){
  var r=.1;
  var fixture=new Array(this.maxCount);
  var pos=this.body.GetPosition();
  var bd = new b2BodyDef;
  bd.type = b2_dynamicBody;
  var shape = new b2PolygonShape;
  shape.SetAsBoxXY(r, r);
  shape.SetColor(255, 0, 0);
  var xx=12;
  while(this.count<this.maxCount) {
    this.firePos[this.count]=new b2Vec2(pos.x-xx+r*2*this.count, pos.y+2*Math.random());
    bd.position.Set(this.firePos[this.count].x, this.firePos[this.count].y);
    this.fireBody[this.count]=world.CreateBody(bd);
    var fixtureDef=new b2FixtureDef;
    fixtureDef.shape=shape;
    fixtureDef.density=1;
    fixture[this.count]=this.fireBody[this.count].CreateFixtureFromDef(fixtureDef);
    
    ++this.count;
  }
  // console.info(this.firePos[0]);
  var cen=new b2Vec2(pos.x, pos.y+1);
  for(var i=0; i<this.maxCount; ++i){
    this.firePos[i]=new b2Vec2(pos.x-xx+r*2*this.count, pos.y+2*Math.random());
    var theB=this.fireBody[i];
    theB.ApplyForce(new b2Vec2(0, .45+1*Math.random()), cen, false);
    var bp=theB.GetPosition();
    if(bp.y>pos.y+4 || bp.x>pos.x+2 || bp.x<pos.x-2){
      theB.SetPosition(this.firePos[i]);
      theB.SetLinearVelocity(new b2Vec2(0,Math.random()));
    }
    if(bp.y>pos.y+3 && (bp.x>pos.x+0.3 || bp.x<pos.x-0.3)){
      theB.SetPosition(this.firePos[i]);
      theB.SetLinearVelocity(new b2Vec2(0,Math.random()));
    }
  }  
}
//bottle
function Bottle(x, y, w, h, thick){
  this.onCap=false;
  this.bd= new b2BodyDef;
  this.bd.type = b2_dynamicBody;
  this.bd.position.Set(x, y);
  this.body = world.CreateBody(this.bd);
  this.h=h;
  this.rho=rho0;
  if(thick==undefined) thick=0.4;
  var h1=h/4, x1=w*0.6, y1=-h1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(x1, y1), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(-x1, y1), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho); 
  var w2=w-x1+thick, x2=x1-thick+w2, y2=y1*2+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w2, thick, new b2Vec2(-x2, y2), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w2, thick, new b2Vec2(x2, y2), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  var h3=h, x3=x2+w2-thick, y3=y2-h3+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h3, new b2Vec2(-x3, y3), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h3, new b2Vec2(x3, y3), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  var w4=w*1.6, x4=0.0, y4=y3-h3+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w4, thick, new b2Vec2(x4, y4), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  friction(this.body,ground);

  //瓶盖
  this.rho1=15;
  this.bd1= new b2BodyDef;
  this.bd1.type = b2_dynamicBody;
  this.bd1.position.Set(x, y);
  this.body1 = world.CreateBody(this.bd1);
  var w5=x1-thick, h5=h1, x5=0.0, y5=-h1/2+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w5, h5, new b2Vec2( x5, y5), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho1);
  var w6=w5*2.3, h6=thick, x6=0.0, y6=thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w6, h6, new b2Vec2( x6, y6), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho1);

  // this.weldJoint;
  this.laAy=0;
  var jd = new b2WeldJointDef;
  jd.bodyA = this.body;
  jd.bodyB = this.body1;
  jd.localAnchorA.Set(0, 0);
  jd.localAnchorB.Set(0, 0);
  this.weldJoint= world.CreateJoint(jd); 
}
//gas jar
function GasJar(x, y, w, h){
  this.weldJoint=null;
  this.bd= new b2BodyDef;
  this.bd.type = b2_dynamicBody;
  this.bd.position.Set(x, y);
  this.body = world.CreateBody(this.bd);
  this.h=h;
  this.rho=rho0;
  var thick=0.4, h1=h/4, x1=w*0.8, y1=-h1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(x1, y1), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(-x1, y1), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho); 
  var w2=w-x1+thick, x2=x1-thick+w2, y2=y1*2+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w2, thick, new b2Vec2(-x2, y2), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w2, thick, new b2Vec2(x2, y2), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  var h3=h, x3=x2+w2-thick, y3=y2-h3+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h3, new b2Vec2(-x3, y3), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h3, new b2Vec2(x3, y3), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  var w4=w*1.4, x4=0.0, y4=y3-h3+thick;
  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w4, thick, new b2Vec2(x4, y4), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  friction(this.body, ground);

  //玻璃片
  // this.rho1=15;
  // this.bd1= new b2BodyDef;
  // this.bd1.type = b2_dynamicBody;
  // this.bd1.position.Set(x, y);
  // this.body1 = world.CreateBody(this.bd1);
  // var w6=2.2, h6=thick, x6=0.0, y6=thick;
  // shape = new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(w6, h6, new b2Vec2( x6, y6), 0.0);
  // this.body1.CreateFixtureFromShape(shape, this.rho1);

  // friction(this.body1, ground);
}
//flask
function Flask(x, y, ground){
  this.weldJoint=null;
  this.bd= new b2BodyDef;
  this.bd.type = b2_dynamicBody;
  this.bd.position.Set(x, y);
  this.body = world.CreateBody(this.bd);
  // this.body.SetType(b2_staticBody);
  this.rho=rho0;

  var thick=0.3, h1=4, w1=1.1, x0=w1, y0=-h1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(-x0, y0), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h1, new b2Vec2(x0, y0), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  var h2=1.2, dh2=h2/Math.sqrt(2), x1=x0+dh2, y1=y0-h1-dh2+thick/2;
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(-x1, y1), -Math.PI/4);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(x1, y1), Math.PI/4);
  this.body.CreateFixtureFromShape(shape, this.rho);

  var x2=x1+dh2, y2=y1-dh2-h2+thick/2;
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(-x2, y2), 0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(x2, y2), 0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  var x3=x1, y3=y2-h2-dh2+thick/2;
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(-x3, y3), Math.PI/4);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h2, new b2Vec2(x3, y3), -Math.PI/4);
  this.body.CreateFixtureFromShape(shape, this.rho);

  var x4=0, y4=y3-dh2+thick/2;
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(h2, thick, new b2Vec2(x4, y4), 0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  friction(this.body, ground);
}
//tube
function Tube(x,y, thick, ground){
  this.weldJoint=null;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  // bd.type = b2_staticBody;
  bd.position.Set(x, y);
  // bd.fixedRotation=true;
  this.body = world.CreateBody(bd);

  var hh=8, ww=1.1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( ww, -hh), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, hh, new b2Vec2( -ww, -hh), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww+thick, thick, new b2Vec2( 0.0, -hh*2+thick), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  this.height=hh*2-0.5;
  // shape = new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(1, 1, new b2Vec2( 0.0, -15.5), 0.0);
  // this.body.CreateFixtureFromShape(shape, rho0);

  // this.body.SetType(b2_dynamicBody);
  // this.body.SetType(b2_staticBody);
  friction(this.body,ground);
  // this.body.SetAwake(false);
}
//水槽
function Trough(x, y, ground){
  var bd=new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  bd.fixedRotation=true;
  this.body = world.CreateBody(bd);

  var w=7, h=5, thick=0.5, wf=w/2, hf=h/2;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w, thick, new b2Vec2( 0.0, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2(-w+thick, h-thick), 0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2(w-thick, h-thick), 0);
  this.body.CreateFixtureFromShape(shape, rho0);
}
function Spoon(x, y, ground){
  var bd=new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body = world.CreateBody(bd);
  
  var ww=0.2, hh=8;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww, hh, new b2Vec2( 0.0, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww/2, hh/8, new b2Vec2( ww*1.5, -hh-hh/8), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(ww/2, hh/18, new b2Vec2( ww*0.5, -hh-hh/4), -0.5);
  this.body.CreateFixtureFromShape(shape, rho0);

  friction(this.body, ground);
}
//火柴
function Match(x, y){
  this.rho=rho0;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  // bd.type = b2_staticBody;

  bd.position.Set(x, y);
  bd.fixedRotation=true;
  this.body = world.CreateBody(bd);

  var shape=new b2PolygonShape;
  var hh=3, a=-1;
  shape.SetAsBoxXYCenterAngle(0.2, hh, new b2Vec2(-hh*Math.sin(a), hh*Math.cos(a)), a);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  shape.SetColor(255, 0, 0);
  shape.SetAsBoxXYCenterAngle(0.3, 0.3, new b2Vec2(0, 0), a);
  this.body.CreateFixtureFromShape(shape, this.rho);

  friction(this.body, ground);

  this.count = 0;
  this.maxCount=20;
  this.fireBody=new Array(this.maxCount);
  this.firePos=new Array(this.maxCount);
}
Match.prototype.step=function(){
  var r=.1;
  var fixture=new Array(this.maxCount);
  var pos=this.body.GetPosition();
  var bd = new b2BodyDef;
  bd.type = b2_dynamicBody;
  var shape = new b2PolygonShape;
  shape.SetAsBoxXY(r, r);
  shape.SetColor(255, 0, 0);
  while(this.count<this.maxCount) {
    this.firePos[this.count]=new b2Vec2(pos.x-4+r*2*this.count, pos.y+0.5+2*Math.random());
    bd.position.Set(this.firePos[this.count].x, this.firePos[this.count].y);
    this.fireBody[this.count]=world.CreateBody(bd);
    var fixtureDef=new b2FixtureDef;
    fixtureDef.shape=shape;
    fixtureDef.density=1;
    fixture[this.count]=this.fireBody[this.count].CreateFixtureFromDef(fixtureDef);
    // this.fireBody[this.count].ApplyForce(new b2Vec2(0, .1), pos, false);
    ++this.count;
  }
  // console.info(this.firePos[0]);
  var cen=new b2Vec2(pos.x, pos.y+1);
  for(var i=0; i<this.maxCount; ++i){
    this.firePos[i]=new b2Vec2(pos.x-4+r*2*this.count, pos.y+0.5+2*Math.random());
    var theB=this.fireBody[i];
    theB.ApplyForce(new b2Vec2(0, .45+1*Math.random()), cen, false);
    var bp=theB.GetPosition();
    if(bp.y>pos.y+3.5 || bp.x>pos.x+1 || bp.x<pos.x-1){
      theB.SetPosition(this.firePos[i]);
      theB.SetLinearVelocity(new b2Vec2(0,Math.random()));
    }
    if(bp.y>pos.y+2 && (bp.x>pos.x+0.3 || bp.x<pos.x-0.3)){
      theB.SetPosition(this.firePos[i]);
      theB.SetLinearVelocity(new b2Vec2(0,Math.random()));
    }
  }  
}

function Rod(x, y, ground){
  this.rho=rho0;

  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body = world.CreateBody(bd);

  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.2, 10, new b2Vec2(0, 0), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);

  friction(this.body, ground);
}
function GlassDelivery(x, y, l1, l2, ground){ 
  var rwf=0.1, rhf=0.3, rw=rwf*2, e_count = 20;
  var dw=3, dh=7;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body= world.CreateBody(bd);
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(dw, rhf, new b2Vec2( -dw, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(rhf, dh/2, new b2Vec2( -dw*2+rhf, -dh/2+rhf), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);
  friction(this.body, ground);

  bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x+rw*e_count, y);
  this.body1= world.CreateBody(bd);
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(dw, rhf, new b2Vec2( dw, 0.0), 0.0);
  this.body1.CreateFixtureFromShape(shape, rho0);
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(rhf, dh, new b2Vec2( dw*2-rhf, -dh+rhf), 0.0);
  this.body1.CreateFixtureFromShape(shape, rho0);
  friction(this.body1, ground);

  // one joint
  shape = new b2PolygonShape();
  shape.SetAsBoxXY(rwf, rhf);

  var fd = new b2FixtureDef;
  fd.shape = shape;
  fd.density = 1.0;

  var jd = new b2WeldJointDef;
  jd.dampingRatio=0.5;
  var prevBody = this.body;
  for (var i = 0; i < e_count; ++i) {
    bd = new b2BodyDef;
    bd.type = b2_dynamicBody;
    bd.position.Set(x+rwf + rw * i, y);
    var body = world.CreateBody(bd);
    body.CreateFixtureFromDef(fd);
    friction(body, ground);
    if(i==0){
      var anchor = new b2Vec2(x, y);
      jd.InitializeAndCreate(prevBody, body, anchor);
    }
    if (i > 0){
      var anchor = new b2Vec2(x + rw* i, y);
      jd.InitializeAndCreate(prevBody, body, anchor);
    }
    if(i==e_count-1){
      var anchor = new b2Vec2(x + rw*i, y);
      jd.InitializeAndCreate(prevBody, this.body1, anchor);
    }
    prevBody = body;
  }
}
//rubber plug + delivery
function RubberPlug(x, y, ground){
  this.weldJoint;
  this.weldJoint2;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body= world.CreateBody(bd);
  var a=1.2, b=1.3, c=1.2;
  var shape=new b2PolygonShape;
  shape.vertices[0] = new b2Vec2(-a, -c);
  shape.vertices[1] = new b2Vec2(a, -c);
  shape.vertices[2] = new b2Vec2(b, c);
  shape.vertices[3] = new b2Vec2(-b, c);
  this.rho=15;
  this.body.CreateFixtureFromShape(shape, this.rho);
  friction(this.body, ground);

  var thick=0.3, dh=3, x0=a*0.5, y0=dh*0.3;  
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, dh, new b2Vec2( x0, y0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);
  friction(this.body, ground);

  var dw=5, x1=x0+dw-thick, y1=y0+dh-thick;
  bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body1= world.CreateBody(bd);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(dw, thick, new b2Vec2( x1, y1), 0.0);
  this.body1.CreateFixtureFromShape(shape, rho0);
  friction(this.body1, ground);

  var jd = new b2RevoluteJointDef();
  var anchor = new b2Vec2(x+x0, y+y1);
  jd.InitializeAndCreate(this.body, this.body1, anchor);

  var dh1=8, x2=x+x1+dw-thick, y2=y+y1-dh1*2+thick;
  var bd2= new b2BodyDef;
  bd2.type = b2_dynamicBody;
  bd2.position.Set(x2, y2);
  this.body2= world.CreateBody(bd2);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, dh1, new b2Vec2( 0, dh1), 0.0);
  this.body2.CreateFixtureFromShape(shape, rho0);
  friction(this.body2, ground);

  jd = new b2RevoluteJointDef();
  anchor = new b2Vec2(x2, y+y1);
  jd.InitializeAndCreate(this.body1, this.body2, anchor);
}


//Dropper
function Dropper(x, y, w, h, ground){
  this.sucking=-1;
  this.w=w*0.5;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  bd.fixedRotation=true;
  this.body = world.CreateBody(bd);

  var thick=0.1;
  var shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2( -w, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h, new b2Vec2( w, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  var an=Math.PI*0.01;
  var h0=h*0.6, xx=-w-h0*Math.cos(an+Math.PI/2), yy=-h-h0+h0*Math.sin(an);
  shape.SetAsBoxXYCenterAngle(thick, h0, new b2Vec2( xx, yy), an);
  this.body.CreateFixtureFromShape(shape, rho0);

  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(thick, h0, new b2Vec2( -xx, yy), -an);
  this.body.CreateFixtureFromShape(shape, rho0);

  this.h=h*1.8+h0;

  shape=new b2PolygonShape;
  var h1=h*0.5;
  shape.SetAsBoxXYCenterAngle(w+thick*2, h1, new b2Vec2( 0, h+h1), 0);
  this.body.CreateFixtureFromShape(shape, rho0);

  // shape=new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(0.1, 0.1, new b2Vec2( 0, 5), 0);
  // this.body.CreateFixtureFromShape(shape, rho0);

  friction(this.body,ground);
}
//铁架台
function Stage(x, y, ground){
  //小夹子
  this.weldJoint2=null;
  var bd= new b2BodyDef;
  bd.type = b2_dynamicBody;
  bd.position.Set(x, y);
  this.body = world.CreateBody(bd);
  this.rho=rho0;
  var bo=1.5;
  var shape=new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(1.5, 0.2, new b2Vec2( 0.0, 1.5), 0.0);
  shape.SetAsBoxXYCenterAngle(0.2, bo, new b2Vec2( bo, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  shape=new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(1.5, 0.2, new b2Vec2( 0.0, -1.5), 0.0);
  shape.SetAsBoxXYCenterAngle(0.2, bo, new b2Vec2( -bo, 0.0), 0.0);
  this.body.CreateFixtureFromShape(shape, this.rho);
  friction(this.body, ground);
  //架子
  this.bd1= new b2BodyDef;
  // this.bd1.type = b2_staticBody;
  this.bd1.type = b2_dynamicBody;
  this.bd1.position.Set(x, y);
  this.body1 = world.CreateBody(this.bd1);
  shape=new b2PolygonShape;
  var h=15, x1=0.0, y1=8.0, h01=(h+y1-bo-1)/2;
  shape.SetAsBoxXYCenterAngle(0.3, h01, new b2Vec2( x1, -h01-bo*1.7), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho);
  // var h02=(h-h01-bo)/2;
  // shape=new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(0.3, h02, new b2Vec2( x1, h02+bo*1.3), 0.0);
  // this.body1.CreateFixtureFromShape(shape, this.rho);

  shape=new b2PolygonShape;
  var w=8, x2=w*.4, y2=y1+h;
  shape.SetAsBoxXYCenterAngle(5, 0.5, new b2Vec2( x2, -y2), 0.0);
  this.body1.CreateFixtureFromShape(shape, this.rho*100);
  //夹子与架子旋转连接
  var rjd = new b2RevoluteJointDef;
  this.joint1 = rjd.InitializeAndCreate(this.body, this.body1, bd.position);  
  friction(this.body1, ground);

  //大夹子
  this.weldJoint=null;
  var w3=2, x3=5*0.8, y3=6;
  var bd2= new b2BodyDef;
  bd2.type = b2_dynamicBody;
  bd2.position.Set(x+x3, y-y3);

  this.body2 = world.CreateBody(bd2);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(w3, 0.3, new b2Vec2( -w3-1.5, 0), 0.0);
  this.body2.CreateFixtureFromShape(shape, 0);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.2, 1, new b2Vec2( -1.5, 0), 0.0);
  this.body2.CreateFixtureFromShape(shape, 0);
  shape=new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.2, 1, new b2Vec2( 1.5, 0), 0.0);
  this.body2.CreateFixtureFromShape(shape, 0);
  friction(this.body2, ground);
  this.pjd = new b2PrismaticJointDef;
  this.pjd.lowerTranslation = -2.0;
  this.pjd.upperTranslation = 5.0;
  this.pjd.enableLimit = true;
  this.joint2 = this.pjd.InitializeAndCreate(this.body2, this.body1, bd2.position, new b2Vec2(0.0, 1.0));
  
  // var wjd = new b2WeldJointDef;
  // wjd.bodyA = this.body1;
  // wjd.bodyB = this.body2;
  // wjd.localAnchorA.Set(x3, -y3);
  // wjd.localAnchorB.Set(0, 0);
  // this.wj0= world.CreateJoint(wjd);

  // var w4=5, y4=15;
  // var bd3= new b2BodyDef;
  // bd3.type = b2_dynamicBody;
  // bd3.position.Set(x, y-y4);
  // this.body3 = world.CreateBody(bd3);
  // shape=new b2PolygonShape;
  // shape.SetAsBoxXYCenterAngle(w4, 0.3, new b2Vec2( w4*0.6, 0), 0.0);
  // this.body3.CreateFixtureFromShape(shape, 0);
  // friction(this.body3, ground);
  // this.joint3 = this.pjd.InitializeAndCreate(this.body3, this.body1, bd2.position, new b2Vec2(0.0, 1.0));

}

//Powder
function PowderLQ(x,y,w,h,num){
    var powsd = new b2ParticleSystemDef();
    powsd.radius = 0.2;
    powsd.dampingStrength = 0.001;
    var particleSystem = world.CreateParticleSystem(powsd);

    var shape = new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(w,h, new b2Vec2(x,y), 0);
    var pd = new b2ParticleGroupDef();
    pd.flags = b2_powderParticle;
    pd.shape = shape;
    pd.color=particleColors[num];
    var group = particleSystem.CreateParticleGroup(pd);
}
function Powder(x,y, r, maxCount, rr, gg, bb){
  this.count = 0;
  this.maxCount=maxCount;
  this.body=new Array(maxCount);
  this.rr=rr; this.gg=gg; this.bb=bb;
  this.r=new Array(maxCount);
  this.tt=new Array(maxCount);
  this.fixture=[];
  while(this.count<maxCount) {
    this.r[this.count]=r;
    this.tt[this.count]=0;
    var bd = new b2BodyDef;
    bd.type = b2_dynamicBody;
    bd.position.Set(x, y);
    this.body[this.count]=world.CreateBody(bd);
    var shape = new b2PolygonShape;
    // if (rr === undefined) rr = 0;
    // if (gg === undefined) gg = 0;
    // if (bb === undefined) bb = 0;
    shape.SetColor(this.rr, this.gg, this.bb);
    shape.SetAsBoxXY(this.r[this.count], this.r[this.count]);
    var fixtureDef=new b2FixtureDef;
    fixtureDef.shape=shape;
    fixtureDef.density=10;
    this.fixture[this.count]=this.body[this.count].CreateFixtureFromDef(fixtureDef);
    ++this.count;
  }
}
function solvent(particleSystem,x,y,w,h,num){
    var shape = new b2PolygonShape;
    shape.SetAsBoxXYCenterAngle(w,h, new b2Vec2(x,y), 0);
    var pd = new b2ParticleGroupDef();
    pd.flags = b2_tensileParticle | b2_viscousParticle;
    pd.shape = shape;
    this.color=particleColors[num];
    pd.color=this.color;
    this.group = particleSystem.CreateParticleGroup(pd);

    this.bufferIndex = this.group.GetBufferIndex();
    this.count = this.group.GetParticleCount();
}
function Lab(){
    camera.position.y = 15;
    camera.position.z = 30;
    
    // Ground
    var bd = new b2BodyDef;
    ground = world.CreateBody(bd);
    var b2ww=42;
    var b2h=windowHeight/15, gy=-5;
    var shape = new b2EdgeShape;
    shape.Set(new b2Vec2(-b2ww, gy), new b2Vec2(b2ww, gy));
    ground.CreateFixtureFromShape(shape, 0.0);

    shape = new b2EdgeShape;
    shape.Set(new b2Vec2(-b2ww, gy), new b2Vec2(-b2ww, b2h));
    ground.CreateFixtureFromShape(shape, 0.0);

    shape = new b2EdgeShape;
    shape.Set(new b2Vec2(b2ww, gy), new b2Vec2(b2ww, b2h));
    ground.CreateFixtureFromShape(shape, 0.0);

    //创建液体
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.1;
    psd.dampingStrength = 0.001;
    psd.SetDensity=0.1;
    particleSystem = world.CreateParticleSystem(psd);
//溶解测试
    // Tube(-10, 10.0, 0.35, ground);
    // CaCO3=new Powder(0, 3, 0.2, 2);
    // for(var i=0; i<CaCO3.count; ++i)
    //   tt.push(0);
    // HCl=new solvent(particleSystem,-10, 6, 1, 1, 4);

//变色测试
    // Tube(-10, 10.0, 0.35, ground);
    // NaOH=new solvent(particleSystem, -10, 0, 0.5, 2, 8);
    // HIn=new solvent(particleSystem, -10, 5, 0.5, 1, 8);
//沉淀测试
    // Tube(-10, 10.0, 0.35, ground);
    // CuSO4=new solvent(particleSystem, -10, 0, 0.5, 2, 4);
    // NaOH=new solvent(particleSystem, -10, 5, 0.5, 1, 8);

    // var b7=new Bottle(0, 10, 1.5, 3.0, 0.3);
    // chemis.push(b7);
    // H2SO4=new solvent(particleSystem,0, 10-5, 2, 1, 8);
    // solv.push(H2SO4);

    // var b2=new Bottle(0, 10, 1.5, 3.0, 0.3);
    // chemis.push(b2);
    // HCl=new solvent(particleSystem,0, 10-5, 2, 1, 4);
    // solv.push(HCl);

    // var b5=new Bottle(-10, 10, 1.5, 3.0, 0.3);
    // chemis.push(b5);
    // HIn=new solvent(particleSystem,-10, 10-5, 2, 1, 8);
    // solv.push(HIn);

    // var b3=new Bottle(0, 10, 1.5, 3.0, 0.3);
    // chemis.push(b3);
    // NaOH=new solvent(particleSystem,0, 10-5, 2, 1, 8);
    // solv.push(NaOH);

    // var b8=new Bottle(-10, 10, 2.0, 4.0);
    // chemis.push(b8);
    // KMnO4=new Powder(-10, 10-5, 0.15, 150, 0x33, 0x00, 0x33);
//酒精灯
  // burner=new AlcoholBurner(-10, 2);
  // chemis.push(burner);
    // match=new Match(0, 5);
}


function stepSuck(pos, vel){
  var it=dop;
  var endPos=it.body.GetPosition();  
  // var pos = particleSystem.GetPositionBuffer();
  // var vel=particleSystem.GetVelocityBuffer();
  var speed=2;
  for(var j=0, l=solv.length; j<l; ++j){
    var that=solv[j];
    for (var i = that.bufferIndex * 2; i < (that.bufferIndex + that.count) * 2; i += 2){
      var parPos=new b2Vec2(pos[i], pos[i+1]);
      var dis=new b2Vec2;
      b2Vec2.Sub(dis,endPos,parPos);
      var absDistX=Math.abs(dis.x);
      if(absDistX<it.w && dis.y<it.h){
        if(dop.sucking==1)
          vel[i + 1] = speed;   //Vy, Vx=vel[i]
        else
          vel[i + 1] = -speed;
      }
    }
  }
}
//溶解
function dissolve(pos, color, ch1, ch2, rr, gg, bb){  //ch1:待溶解固体; ch2:液体
  // var ch1=CaCO3, ch2=HCl;
  // var rr=ch1.rr, gg=ch1.gg, bb=ch1.bb;
  // var pos = particleSystem.GetPositionBuffer();
  // var color = particleSystem.GetColorBuffer();
  for(var j=0; j<ch1.count; j++){
    var counter=0;
    for (var i = ch2.bufferIndex * 2; i < (ch2.bufferIndex + ch2.count) * 2; i += 2){
      var d=b2Vec2.distance(new b2Vec2(pos[i], pos[i+1]), ch1.body[j].GetPosition());
      if(d<1){
        ++counter;
        // var ii=i*2
        // color[ii]=rr;
        // color[ii+1]=gg;
        // color[ii+2]=bb;
      }
    }
    if(counter>10){
      ++ch1.tt[j];
      if(ch1.tt[j]<1200){
        if(ch1.tt[j]%100==0){
          ch1.r[j]-=0.01;
          ch1.body[j].DestroyFixture(ch1.fixture[j]);
          var shape = new b2PolygonShape;
          shape.SetColor(rr, gg, bb);
          shape.SetAsBoxXY(ch1.r[j], ch1.r[j]);
          var fixtureDef=new b2FixtureDef;
          fixtureDef.shape=shape;
          fixtureDef.density=10;
          ch1.fixture[j]=ch1.body[j].CreateFixtureFromDef(fixtureDef);
        }
      }else{
        world.DestroyBody(ch1.body[j]);
        --ch1.count;
      }
    }
  }
}
//变色
function discolor(pos, color, ch1, ch2, color1){
  // var ch1=NaOH, ch2=HIn;
  // var pos = particleSystem.GetPositionBuffer();
  // var color = particleSystem.GetColorBuffer();
    // 4 bytes per color
  for(var m = ch1.bufferIndex * 4, len1=(ch1.bufferIndex + ch1.count) * 4; m < len1; m += 4)
    for(var n = ch2.bufferIndex * 4, len2=(ch2.bufferIndex + ch2.count) * 4; n < len2; n += 4){
      var mm=m/2, nn=n/2;
      var d=b2Vec2.distance(new b2Vec2(pos[mm], pos[mm+1]), new b2Vec2(pos[nn], pos[nn+1]));
      if(d<0.2){
        color[m]=color1.r;
        color[m+1]=color1.g;
        color[m+2]=color1.b;
        color[n]=color1.r;
        color[n+1]=color1.g;
        color[n+2]=color1.b;
      }
    }
}
var CuOH2=[];
//沉淀
function precipitation(pos, color, ch1, ch2, ch3, r,g,b){
  // var ch1=CuSO4, ch2=NaOH, ch3=CuOH2;
  var maxNum=20;
  if(ch3.length<maxNum){
    for(var i = ch1.bufferIndex * 4, len1=(ch1.bufferIndex + ch1.count) * 4; i < len1; i += 4)
      for(var j = ch2.bufferIndex * 4, len2=(ch2.bufferIndex + ch2.count) * 4; j < len2; j += 4){
        var ii=i/2, jj=j/2;
        var ch1pos=new b2Vec2(pos[ii], pos[ii+1]);
        var d=b2Vec2.distance(ch1pos, new b2Vec2(pos[jj], pos[jj+1]));
        if(d<0.05){
          ch3.push(new Powder(ch1pos.x, ch1pos.y, 0.15, 1, r, g, b));
          // color[i]=ch2.color.r;
          // color[i+1]=ch2.color.g;
          // color[i+2]=ch2.color.b;
          // particleSystem.SetRadius(0.2);
        }
      }
  }
  // else{
  //   for(var i = ch1.bufferIndex * 4, len1=(ch1.bufferIndex + ch1.count) * 4; i < len1; i += 4){
  //     color[i]=ch2.color.r;
  //     color[i+1]=ch2.color.g;
  //     color[i+2]=ch2.color.b;
  //   }
  // }
  // else{
  //   ch1.group.DestroyParticles(false);
  // }  
}
Lab.prototype.Step = function() {
  Step();
  var pos = particleSystem.GetPositionBuffer();
  var vel=particleSystem.GetVelocityBuffer();
  var color = particleSystem.GetColorBuffer();
  if(dop){
    stepSuck(pos, vel);
  } 
  if(CaCO3 && HCl)
    dissolve(pos, color, CaCO3, HCl);
  if(HIn && NaOH)
    discolor(pos, color, NaOH, HIn, particleColors[5]);
  if(HCl && HIn && NaOH){
    discolor(pos, color, HCl, HIn, particleColors[8]);
    discolor(pos, color, HCl, NaOH, particleColors[8]);
  }
  if(CuSO4 && NaOH){
    precipitation(pos, color, CuSO4, NaOH, CuOH2, 0x00, 0x00, 0xff);
    discolor(pos, color, NaOH, CuSO4, particleColors[8]);
  }
  if(CuOH2.length>0 && H2SO4){
    discolor(pos, color, H2SO4, NaOH, particleColors[4]);
    discolor(pos, color, H2SO4, CuSO4, particleColors[4]);
    for(var k=0, l=CuOH2.length; k<l; ++k)
      dissolve(pos, color, CuOH2[k], H2SO4, 0x00, 0xce, 0xd1);
  }
  if(text.match)
    match.step();
  if(text.alcoholBurner)
    if(burner.flame)
      burner.step();
};
