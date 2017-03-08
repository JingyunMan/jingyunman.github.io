
var canvas,c;
var world = null;
var renderer;
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var windowWidth;
var windowHeight;
var text;

var init=function(){
    initGUI();
    ReactionWorld.init();
    renderer.init();
    render();
}

var render = function() {
    ReactionWorld.update();
    renderer.render(world);
    requestAnimationFrame(render);
};

var ReactionWorld={
    init: function(){
        console.info("Created by Jingyun Man (jingyunman@gmail.com) on 3/02/17. Copyright © 2017 Jingyun Man. All rights reserved.")
        windowWidth=window.innerWidth;
        windowHeight=window.innerHeight;
        if(text.heater)
            var gravity = new b2Vec2(0, -5);
        else if(text.phase)
            var gravity = new b2Vec2(0, -1);
        else
            var gravity = new b2Vec2(0, -.5);
        world = new b2World(gravity);
        
        this.dissolve=false;     //固体在液体中溶解

        // Ground
        ReactionWorld.walls();

        // Create particle system.
        var psd = new b2ParticleSystemDef();
        psd.radius = 0.09;

        var particleSystem = world.CreateParticleSystem(psd);
        //diffusion liquid liquid
        if(text.diffusionLiquid){
            this.solvent(particleSystem, 0, 6, 4.5, 3, 198, 219, 239);
            this.solvent(particleSystem, 0, 1.5, 1, 1, 117, 107, 177);
        }
         //液体固体 Solid dissolving
        if(text.dissolveSolid){
            this.solvent(particleSystem, 0, 6, 4.5, 3, 198, 219, 239);                 
            this.solid_particles(particleSystem, 1, new b2Vec2(0, 1.5), new b2ParticleColor(117, 107, 177));
        }
        //LLL
        if(text.LLL){
            this.solvent(particleSystem, 0, 4, 8, 2, 198, 219, 239);
            this.solvent(particleSystem, 0, 1, 2, 1, 117, 107, 177);
        }
        //LLS
        if(text.LLS){
            this.solvent(particleSystem, 0, 3.5, 8, 1.6, 198, 219, 239);
            this.solvent(particleSystem, 0, 1, 1, 0.5, 117, 107, 177);
        }
        //LLG
        if(text.LLG){
            this.solvent(particleSystem, 0, 3.5, 8, 1.6, 198, 219, 239);
            this.solvent(particleSystem, 0, 1, 5, 0.15, 117, 107, 177);
        }
        //LGS
        if(text.LGS){
            ReactionWorld.solvent(particleSystem, 0, 2.5, 7.5, 2, 217, 217, 217); 
        }
       
        //heating
        if(text.heater){
            this.solvent(particleSystem, 0, 4, 4.5, 4, 198, 219, 239);
        }
        //水
        if(text.phase){
            // this.H2O(-1, 7, 0);
            // this.H2O(0, 7, 0);

            // var d=0.3, n=5;
            // for(var i=0; i<n; ++i)
            //     for(var j=0; j<n; ++j)
            //         this.H2O(-d*n/2+d*i, n-2+d*n/2-d*j, Math.PI*i);

            particleSystem.SetRadius(0.2);
            particleSystem.SetDamping(0.01);
            this.solvent(particleSystem, 0, 6, 0.4, 0.4, 198, 219, 239); 
            // world.particleSystems[0].particleGroups[0].SetGroupFlags(b2_powderParticle);
        }

        //液体气体
        // particleSystem.SetDamping(0.2);
        // ReactionWorld.solvent(particleSystem, 0, 3.5, 4.5, 3.5, 217, 217, 217);  

        this.timer=0;
        console.info(particleSystem.GetParticleCount());

        // console.info(world.molecules[0].fixtures[0].shape.radius);
    },
    ResetWorld: function() {
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
    },
    H2O: function(x, y, angle){
        var bd = new b2BodyDef();
        bd.type = b2_dynamicBody;
        var body = world.CreateBody(bd);
        var center=new b2Vec2(x,y);
        var bund=0.95/4;
        var bundAngle=104/2*Math.PI/180;
        body.SetTransform(center, angle);
        // body.SetLinearVelocity(new b2Vec2(-4+8*Math.random(), -4+8*Math.random()));
        
       
        shape = new b2CircleShape();
        shape.color=new b2Color(230, 85, 13);
        shape.position=new b2Vec2(0, 0);
        shape.radius = 0.2;
        shape.fil=true;
        body.CreateFixtureFromShape(shape, 0.1);

        world.molecules.push(body);
    },
    walls: function(){
        var bd = new b2BodyDef;
        var ground = world.CreateBody(bd);
        //bottom
        var shape=new b2PolygonShape;
        shape.line=10;
        shape.vertices[0] = new b2Vec2(-10, 0.5);
        shape.vertices[1] = new b2Vec2(10, 0.5);
        shape.vertices[2] = new b2Vec2(10, -5);
        shape.vertices[3] = new b2Vec2(-10, -5);
        ground.CreateFixtureFromShape(shape, 0.0);
        //top
        shape=new b2PolygonShape;shape.line=10;
        shape.vertices[0]=new b2Vec2(-10, 15);
        shape.vertices[1]=new b2Vec2(10, 15);
        shape.vertices[2]=new b2Vec2(10, 20);
        shape.vertices[3]=new b2Vec2(-10, 20);
        ground.CreateFixtureFromShape(shape, 0.0);
        //left
        shape=new b2PolygonShape;shape.line=10;
        shape.vertices[0] = new b2Vec2(-8, -5);
        shape.vertices[1] = new b2Vec2(-8, 20);
        shape.vertices[2] = new b2Vec2(-10, 20);
        shape.vertices[3] = new b2Vec2(-10, -5);
        ground.CreateFixtureFromShape(shape, 0.0);
        //right
        shape=new b2PolygonShape;shape.line=10;
        shape.vertices[0] = new b2Vec2(8, -5);
        shape.vertices[1] = new b2Vec2(8, 20);
        shape.vertices[2] = new b2Vec2(10, 20);
        shape.vertices[3] = new b2Vec2(10, -5);
        ground.CreateFixtureFromShape(shape, 0.0);
    },
    solvent: function(particleSystem,x,y,w,h,r,g,b){
        var shape = new b2PolygonShape;
        shape.SetAsBoxXYCenterAngle(w,h, new b2Vec2(x,y), 0);
        var pd = new b2ParticleGroupDef();
        // pd.flags = b2_tensileParticle | b2_viscousParticle;
        // pd.flags = b2_tensileParticle | b2_colorMixingParticle;
        pd.flags =b2_tensileParticle;
        // pd.flags=b2_powderParticle;
        pd.shape = shape;
        pd.color=new b2ParticleColor(r, g, b);
        var group = particleSystem.CreateParticleGroup(pd);
    },
    solid_particles: function(particleSystem, radius, pos, color){
        var shape=new b2PolygonShape;
        shape.SetAsBoxXYCenterAngle(radius, radius, pos, 0);
        // var shape=new b2CircleShape;
        // shape.position=new b2Vec2(0, 1.5);
        // shape.radius=1;

        var pd=new b2ParticleGroupDef();
        pd.groupFlags=b2_rigidParticleGroup;
        // pd.flags=b2_tensileParticle;
        // pd.flags=b2_elasticParticle;
        pd.shape=shape;
        pd.color=color;
        var group = particleSystem.CreateParticleGroup(pd);
    },
    unit: function(x, y, r, _r, _g, _b, rho, fil){
        //圆形
        var bd = new b2BodyDef()
        var circle = new b2CircleShape();
        circle.color=new b2Color(_r, _g, _b);
        circle.position.Set(x, y);
        circle.radius = r;
        circle.fil=fil;
        bd.type = b2_dynamicBody;
        this.circlebody = world.CreateBody(bd);
        this.circleFixture=this.circlebody.CreateFixtureFromShape(circle, rho);
    },
    solid: function(size){
        this.solidLength=size;
        for(var i=0; i<this.solidLength; ++i){
            // var sx=-4+8*Math.random(), sy=9+3*Math.random();
            // var sb=new ReactionWorld.unit(sx, sy, 0.2+0.2*Math.random(), 117, 107, 177, 2, true);
            var sx=0, sy=9;
            var sb=new ReactionWorld.unit(sx, sy, 0.5, 117, 107, 177, 2, true);
            ReactionWorld.solidBodies.push(sb.circlebody);
            ReactionWorld.solidFixtures.push(sb.circleFixture);
        } 
    },
    update: function(){
        world.Step(timeStep, velocityIterations, positionIterations);
    }
}
var renderer = {
    init: function(){
        canvas=document.getElementById('canvas');
        c=canvas.getContext('2d');
        canvas.width=window.screen.width;
        canvas.height=window.screen.height*0.8;
        this.sediment=false;        //沉淀
        this.gas=false;         //气体
        this.gasArray=[];
        this.gasLiqSedi=false;      //气体液体中产生沉淀
    },
    render: function(world){
        c.clearRect(0, 0, canvas.width, canvas.height);
        renderer.drawBodies(world.bodies);
        renderer.drawParicles(world.particleSystems[0]);
    },
    affine: function(x, y){
        var scale = (windowWidth < windowHeight ? windowWidth : windowHeight) * 0.05;
        // var scale=windowWidth*0.05;
        return {x: x*scale+windowWidth/2, y: windowHeight*0.8-y*scale};
    },
    LLL: function(group1, group2, pos, colorBuff, _r, _g, _b){
        // var ra=parseInt(Math.random()*10); //random number can be related to the temperature.
        for(var m = group1.GetBufferIndex() * 4, len1=m+group1.GetParticleCount()*4; m < len1; m += 4){
            if(colorBuff[m]!=_r || colorBuff[m+1]!=_g || colorBuff[m+2]!=_b){
                var ra0=parseInt(Math.random()*10);
                if(ra0!=0) continue;
                for(var n = group2.GetBufferIndex() * 4, len2=n+group2.GetParticleCount()*4; n < len2; n += 4){
                    if(colorBuff[n]!=_r || colorBuff[n+1]!=_g || colorBuff[n+2]!=_b){
                        var mm=m/2, nn=n/2;
                        var ra1=parseInt(Math.random()*10);
                        if(ra1!=0) continue;
                        var radi=b2Vec2.distance(new b2Vec2(pos[mm], pos[mm+1]), new b2Vec2(pos[nn], pos[nn+1]));
                        if(radi<.1){
                            colorBuff[m]=_r;
                            colorBuff[m+1]=_g;
                            colorBuff[m+2]=_b;
                            colorBuff[n]=_r;
                            colorBuff[n+1]=_g;
                            colorBuff[n+2]=_b;
                            break;
                        }
                    }
                    
                }
            }  
        }

    },
    LLS: function(system, pos, color){
        var group1=system.particleGroups[1], group2=system.particleGroups[0];  
        for(var m = group1.GetBufferIndex() * 2, len1=m+group1.GetParticleCount()*2; m < len1; m += 2)
            for(var n = group2.GetBufferIndex() * 2, len2=n+group2.GetParticleCount()*2; n < len2; n += 2){
                var ra0=parseInt(Math.random()*50);
                var d=b2Vec2.distance(new b2Vec2(pos[m], pos[m+1]), new b2Vec2(pos[n], pos[n+1]));
                if(ra0==0 && d<.04){
                    var thePos=new b2Vec2(pos[m], pos[m+1]);
                    var shape = new b2PolygonShape;
                    shape.SetAsBoxXYCenterAngle(.15,.15, thePos, 0);
                    system.DestroyParticlesInShape(shape, new b2Transform);
                    // ReactionWorld.unit(pos[m], pos[m+1], .2, 253, 141, 60, 5, true);
                    ReactionWorld.solid_particles(system, 0.15, thePos, color);
                }
            }
    },
    LLG: function(system, pos, radius, _r, _g, _b, time){
        var group1=system.particleGroups[0], group2=system.particleGroups[1]; 
        for(var m = group1.GetBufferIndex() * 2, len1=m+group1.GetParticleCount()*2; m < len1; m += 2)
            for(var n = group2.GetBufferIndex() * 2, len2=n+group2.GetParticleCount()*2; n < len2; n += 2){
                var ra0=parseInt(Math.random()*100);
                if(ra0==0){
                    var d=b2Vec2.distance(new b2Vec2(pos[m], pos[m+1]), new b2Vec2(pos[n], pos[n+1]));
                    if(d<0.04){
                        var r=radius+0.1*Math.random();
                        var shape = new b2PolygonShape;
                        shape.SetAsBoxXYCenterAngle(r,r, new b2Vec2(pos[m], pos[m+1]), 0);
                        system.DestroyParticlesInShape(shape, new b2Transform);
                        var oneCircle=new ReactionWorld.unit(pos[m], pos[m+1], r, 198, 219, 239, 0.1, false);
                        renderer.gasArray.push(oneCircle.circlebody);
                    }
                }
                
            }       
        for(var i=0, len3=renderer.gasArray.length; i<len3; ++i){
            var gb=renderer.gasArray[i];
            var upVel=new b2Vec2(0, 1+1/(gb.GetPosition().y+.1));
            gb.SetLinearVelocity(upVel);

            var realPos=gb.GetRealPos();
            if(realPos.y>4){
                world.DestroyBody(gb);
                renderer.gasArray.splice(i,1);
                break;
            }
        }
    },
    solvingDissolve: function(system,p,v, time){
        var liq=world.particleSystems[0].particleGroups[0];
        var solid=world.particleSystems[0].particleGroups[1];
        for(var i=solid.GetBufferIndex()*2, solid_count=i+solid.GetParticleCount()*2; i<solid_count; i+=2){
            var theP=new b2Vec2(p[i], p[i+1]);
            for(var j=liq.GetBufferIndex()*2, liq_count=j+liq.GetParticleCount()*2; j<liq_count; j+=2){
                var dis=b2Vec2.distance(theP, new b2Vec2(p[j], p[j+1]));
                if(dis<0.1){
                    var v=Math.sqrt(v[j]*v[j]+v[j+1]*v[j+1]);
                    if(v>1.5){
                        var shape = new b2PolygonShape;
                        shape.SetAsBoxXYCenterAngle(.1,.1, theP, 0);
                        system.DestroyParticlesInShape(shape, new b2Transform);

                        var shape=new b2PolygonShape;
                        shape.SetAsBoxXYCenterAngle(0.07, 0.07, theP, 0);
                        var pd=new b2ParticleGroupDef();
                        pd.flags=b2_tensileParticle;
                        pd.shape=shape;
                        pd.color=new b2ParticleColor(117, 107, 177);
                        system.CreateParticleGroup(pd);
                        break;
                    }       
                }
            }
        }

    },
    LGS: function(system, pos, colorBuff, color, time){
        var group=world.particleSystems[0].particleGroups[0];
        if(time>200 && time%10==0 && time<2000){
            var circle=new ReactionWorld.unit(0, 0.5, 0.1+0.1*Math.random(), 99, 99, 99, 0.1, false);
            renderer.gasArray.push(circle.circlebody);
        }
        for(var i=0, gl=renderer.gasArray.length; i<gl; ++i){
            var sb=renderer.gasArray[i];
            var realPos=sb.GetRealPos();
            var interaction=false;
            for(var j = group.GetBufferIndex() * 2, ll=j+group.GetParticleCount()*2; j < ll; j += 2){
                var d=b2Vec2.distance(new b2Vec2(pos[j], pos[j+1]), realPos);
                // var ra0=parseInt(Math.random()*3);
                if( d<0.1){
                    var thePos=new b2Vec2(pos[j], pos[j+1]);
                    var shape = new b2PolygonShape;
                    shape.SetAsBoxXYCenterAngle(.1,.1, thePos, 0);
                    system.DestroyParticlesInShape(shape, new b2Transform);

                    world.DestroyBody(sb);
                    renderer.gasArray.splice(i,1);
                    interaction=true;

                    ReactionWorld.solid_particles(system, 0.15, thePos, color);
                    break;
                }
            }
            if(interaction)
                break;
            if(realPos.y>4){
                world.DestroyBody(sb);
                renderer.gasArray.splice(i,1);
                break;
            }
        }
        for(var i=0, gl=renderer.gasArray.length; i<gl; ++i){
            var gb=renderer.gasArray[i];
            var upVel=new b2Vec2(0, 1+3/(gb.GetPosition().y+.1));
            gb.SetLinearVelocity(upVel);
            // gb.ApplyForce(new b2Vec2(0, 2), gb.GetWorldCenter(), true);
        }
    },
    heating: function(system, p , v, l, t){
        var a0=Math.exp(-t/1000);
        system.SetDamping(1*a0);
        // console.info(a0);
        // world.SetGravity(new b2Vec2(0, -10*a0));
        var a1=200*(1-a0);
        for(var i=0; i<l; i+=2)
            if(p[i+1]<.1)
                v[i+1]=a1*Math.cos(Math.PI/16*p[i]);

    },
    phase: function(){
        // The electrostatic interaction is modeled using Coulomb's law.
        var kc=-0.005, q=1;
        var step=0.01;
        var sigma=2;
        for(var i=0, l=world.molecules.length; i<l; ++i){
            var molecule=world.molecules[i];
            var pos=molecule.GetPosition();
            var force=new b2Vec2(0, 0);
            for(j=0; j<l; ++j){
                if(j==i) continue;
                var molecule1=world.molecules[j];
                var pos1=molecule1.GetPosition();
                var dx=pos.x- pos1.x, dy=pos.y- pos1.y;
                var rij=Math.sqrt(dx*dx + dy*dy);
                var electrostatic=kc*q*q/Math.pow(rij,3);
                force.x+=electrostatic*dx;
                force.y+=electrostatic*dy;

                // var lennard_jone=(Math.pow(0.3/rij,14) - 0.5*Math.pow(0.3/rij,8))*sigma;
                // force.x+=dx*lennard_jone;
                // force.y+=dy*lennard_jone;
            }
            molecule.ApplyForceToCenter(force);

            var ra=parseInt(Math.random()*4);
            switch(ra){
                case 0:
                    molecule.SetPosition(new b2Vec2(pos.x+step, pos.y)); break;
                case 1:
                    molecule.SetPosition(new b2Vec2(pos.x-step, pos.y)); break;
                case 2:
                    molecule.SetPosition(new b2Vec2(pos.x, pos.y+step)); break;
                case 3:
                    molecule.SetPosition(new b2Vec2(pos.x, pos.y-step)); break;
            }
        }
        // world.molecules[1].ApplyForceToCenter(force);
    },
    drawParicles: function(system){
        ++ReactionWorld.timer;
        var pos = system.GetPositionBuffer();       
        var maxParticles = pos.length;      
        var vel = system.GetVelocityBuffer();
        var color = system.GetColorBuffer();
        // var parRadius=windowWidth*0.003;
        var parRadius=system.radius*windowWidth*0.05;
        if(text.dissolveSolid)
            renderer.solvingDissolve(system, pos,vel, ReactionWorld.timer);
        if(text.heater)
            renderer.heating(system, pos, vel, maxParticles, ReactionWorld.timer);
        if(text.LLL){ 
            this.LLL(world.particleSystems[0].particleGroups[0],
                            world.particleSystems[0].particleGroups[1],
                            pos, color,  253, 141, 60);
        }                 
        if(text.LLS)
            this.LLS(system, pos, new b2ParticleColor(253, 141, 60));
        if(text.LLG)
            this.LLG(system, 
                pos, .1, 253, 141, 60, ReactionWorld.timer);
        
        //     renderer.solvingDissolve(system, pos, maxParticles, color, 117, 107, 177, ReactionWorld.timer);
        if(text.LGS)
            this.LGS(system, pos, color, new b2ParticleColor(230, 85, 13), ReactionWorld.timer);
        if(text.phase)
            renderer.phase();


        for (var i = 0, cc=0; i < maxParticles; i += 2, cc+=4) {
            var pp=renderer.affine(pos[i], pos[i+1]);          
            c.beginPath();
            c.arc( pp.x, pp.y, parRadius, 0, 7);
            c.fillStyle="rgb("+color[cc]+","+color[cc+1]+","+color[cc+2]+")";
            c.fill();
        }
    },
    drawBodies: function(bodies){
        for(var i=0, bl=world.bodies.length; i<bl; ++i){
            var body = world.bodies[i];
            var transform = body.GetTransform();
            var fl = body.fixtures.length;
            for(var j=0; j<fl; ++j){
                var shape=body.fixtures[j].shape;
                shape.draw(transform);
            }
        }   
    }
    
};
b2EdgeShape.prototype.draw=function(transform){
    var v1=this.vertex1, v2=this.vertex2;
    var vp1=renderer.affine(v1.x, v1.y), vp2=renderer.affine(v2.x, v2.y);
    c.beginPath();
    c.moveTo(vp1.x, vp1.y);
    c.lineTo(vp2.x, vp2.y);
    c.strokeStyle="#333";
    c.lineWidth=10;
    c.stroke();
}
b2CircleShape.prototype.draw = function(transform){
    var tranV1=new b2Vec2();
    b2Vec2.Mul(tranV1, transform, this.position);
    var cp=renderer.affine(tranV1.x, tranV1.y);
    c.beginPath();
    c.arc(cp.x, cp.y, this.radius*windowWidth*0.04, 0,7);
    // if(renderer.gas || renderer.gasLiqSedi){
    if(!this.fil){
        c.lineWidth=1;
        c.strokeStyle="rgb("+this.color._r+","+this.color._g+","+this.color._b+")";
        c.stroke();
    }
    // if(renderer.sediment || renderer.dissolve){
    else{
        c.fillStyle="rgb("+this.color._r+","+this.color._g+","+this.color._b+")";
        c.fill();
    }
    
}
b2PolygonShape.prototype.draw = function(transform){
    c.strokeStyle="#333";
    for(var i=0, vertLen=this.vertices.length; i<vertLen; ++i){
        var tranV1=new b2Vec2(), tranV2=new b2Vec2();
        b2Vec2.Mul(tranV1, transform, this.vertices[i]);
        b2Vec2.Mul(tranV2, transform, this.vertices[(i+1)%vertLen]);
        var vp1=renderer.affine(tranV1.x, tranV1.y), vp2=renderer.affine(tranV2.x, tranV2.y);
        c.beginPath();
        c.moveTo(vp1.x, vp1.y);
        c.lineTo(vp2.x, vp2.y);
        // c.lineWidth=10;
        c.lineWidth=this.line;
        c.stroke();
    }
}
var FizzyText = function() {
    this.diffusionLiquid=true;    
    this.dissolveSolid=false;
    this.LLL=false;  //liquid A + liquid B --> liquid C
    this.LLS=false;  //liquid A + liquid B --> sediment C
    this.LLG=false;  //liquid A + liquid B --> gas C
    this.LGS=false;  //liquid A + gas B --> solid C
    this.heater=false;
    this.phase=false;
};
function initGUI() {
    text = new FizzyText();
    var gui = new dat.GUI();
    var control1=gui.add(text, "diffusionLiquid").listen();
    control1.onChange(function(value){
        text.heater=false;
        text.diffusionLiquid=true;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=false;
        text.LLG=false;
        text.LGS=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control3=gui.add(text, 'dissolveSolid').listen();
    control3.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=true;
        text.LLL=false;
        text.LLS=false;
        text.LLG=false;
        text.LGS=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control4=gui.add(text, 'LLL').listen();
    control4.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=false;
        text.LLL=true;
        text.LLS=false;
        text.LLG=false;
        text.LGS=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control6=gui.add(text, 'LLS').listen();
    control6.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=true;
        text.LLG=false;
        text.LGS=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control7=gui.add(text, 'LLG').listen();
    control7.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=false;
        text.LLG=true;
        text.LGS=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control8=gui.add(text, 'LGS').listen();
    control8.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=false;
        text.LLG=false;
        text.LGS=true;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control2=gui.add(text, 'heater').listen();
    control2.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=true;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=false;
        text.LLG=false;
        text.phase=false;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
    var control5=gui.add(text, 'phase').listen();
    control5.onChange(function(value){
        text.diffusionLiquid=false;
        text.heater=false;
        text.dissolveSolid=false;
        text.LLL=false;
        text.LLS=false;
        text.LLG=false;
        text.LGS=false;
        text.phase=true;
        ReactionWorld.ResetWorld();
        ReactionWorld.init();
    });
};

window.addEventListener('load', init, false);





