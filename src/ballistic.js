
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.image('bullet', 'assets/sprites/purple_ball.png');
    game.load.image('ballType01', 'assets/sprites/blue_ball.png');
    game.load.spritesheet('bullets', 'assets/sprites/balls.png', 17, 17);
}

var sprite;
var ballOnPath;
//var bullets;
var bullet;
var ballGroup;
var pathBalls;          // This are the balls along the spiral path
var level = 1;          // Indicates the current level the player is on, increasing difficulty/points
var speed;              // Velocity around the spiral increases proportional to the level
var pointsPerBall = 25;      // Points scored per each clearing, increases proportional to level
var score = 0;              // Total score - sum of pointsPerBall cleared
var numBallTypes;       // Start with a small number of ball types and increase with level
var fireRate = 100;
var nextFire = 0;
var levelThresholds = [100, 200, 300, 400, 500];

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(0,5));
    bullet.anchor.set(0.5);
    game.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.allowRotation = false;
    bullet.enableBody = true;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

//    bullets = game.add.group();
//    bullets.enableBody = true;
//    bullets.physicsBodyType = Phaser.Physics.ARCADE;

//    bullets.createMultiple(50, 'bullet');
//    bullets.setAll('checkWorldBounds', true);
//    bullets.setAll('outOfBoundsKill', true);

//    // Sprite creations
//    sprite = game.add.sprite(400, 300, 'arrow');
//    sprite.anchor.set(0.5);
//
//    game.physics.enable(sprite, Phaser.Physics.ARCADE);
//
//    sprite.body.allowRotation = false;

    // Balls
    ballOnPath = game.add.sprite(100, 100, 'ballType01');
    ballOnPath.anchor.set(0.5);

    game.physics.enable(ballOnPath, Phaser.Physics.ARCADE);

    ballOnPath.body.allowRotation = false;

    ballGroup = game.add.physicsGroup();


    for (i = 0; i < 20; i++)
    {
//        var c = ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullet');
         ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullets', game.rnd.between(0, 5));
    }

//    for (i = 0; i < 20; i++)
//    {
////        var c = ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullet');
//         ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'ballType01', 2);
//    }

    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);

    creatSpiralPath();

}

function createSpiralPath() {
    pathBalls = new Phaser.Circle(game.world.centerX, 100, 64);

//    var fragmentSrc = [
//
//        "precision mediump float;",
//
//		"uniform float     time;",
//		"uniform vec2      resolution;",
//		"uniform vec2      mouse;",
//
//		"// https://www.shadertoy.com/view/MdXSzS",
//
//		"void main()",
//		"{",
//			"vec2 uv = (gl_FragCoord.xy/resolution.xy)-.5;",
//
//			"float time = time * .1 + ((.25+.05*sin(time*.1))/(length(uv.xy)+.07))* 2.2;",
//			"float si = sin(time);",
//			"float co = cos(time);",
//			"mat2 ma = mat2(co, si, -si, co);",
//
//			"float c = 0.0;",
//            "float v1 = 0.0;",
//			"float v2 = 0.0;",
//
//			"for (int i = 0; i < 100; i++)",
//			"{",
//				"float s = float(i) * .035;",
//				"vec3 p = s * vec3(uv, 0.0);",
//				"p.xy *= ma;",
//				"p += vec3(.22,.3, s-1.5-sin(time*.13)*.1);",
//				"for (int i = 0; i < 8; i++)",
//				"{",
//					"p = abs(p) / dot(p,p) - 0.659;",
//				"}",
//				"v1 += dot(p,p)*.0015 * (1.8+sin(length(uv.xy*13.0)+.5-time*.2));",
//				"v2 += dot(p,p)*.0015 * (1.5+sin(length(uv.xy*13.5)+2.2-time*.3));",
//				"c = length(p.xy*.5) * .35;",
//			"}",
//
//			"float len = length(uv);",
//			"v1 *= smoothstep(.7, .0, len);",
//			"v2 *= smoothstep(.6, .0, len);",
//
//			"float re = clamp(c, 0.0, 1.0);",
//			"float gr = clamp((v1+c)*.25, 0.0, 1.0);",
//			"float bl = clamp(v2, 0.0, 1.0);",
//			"vec3 col = vec3(re, gr, bl) + smoothstep(0.15, .0, len) * .9;",
//
//			"gl_FragColor=vec4(col, 1.0);",
//		"}"
//	];
//
//    filter = new Phaser.Filter(game, null, fragmentSrc);
//    filter.setResolution(800, 600);
//
//    sprite = game.add.sprite();
//    sprite.width = 800;
//    sprite.height = 600;
//
//    sprite.filters = [ filter ];
}

function update() {

//    sprite.rotation = game.physics.arcade.angleToPointer(sprite);

    if (game.input.activePointer.isDown) {
        fire();
    }

    game.physics.arcade.collide(ballGroup, bullet, collisionHandler);

    if (!bullet.alive) {
        // Bullet
        bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(0,5));
        bullet.anchor.set(0.5);
        game.physics.enable(bullet, Phaser.Physics.ARCADE);
        bullet.body.allowRotation = false;
        bullet.enableBody = true;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
    }

    moveBallPath();
}

/*
    Handles when two balls collide in two separate occassions:
    1. The firing ball collides with balls on the path
    2. The path balls fill a gap create by a removal and "slam" together

    In both cases the function will smoothly bring the balls into alignment along the path and then determine if the new ball arrangement creates a segment of >= 3 matching balls. If so, it will remove the balls, score the points, and tighten the path.

*/
function collisionHandler(bulletCheck, ballCheck) {
    // test if matching
//    ballGroup.add(bullet, 1);
    if (bulletCheck.frame == ballCheck.frame) {
        // if match then score
        score += pointsPerBall;
        ballCheck.kill();
        bulletCheck.kill();
    }

    changeLevel();
}

function fire() {

//    if (game.time.now > nextFire && ballGroup.countDead() > 0) {

//        nextFire = game.time.now + fireRate;

//        var bullet = bullets.getFirstDead();

//        var bullet = ballGroup.getFirstDead();

//        ballGroup.create(sprite.x - 8, sprite.y - 8, 'bullet', 1);

//        bullet.reset(sprite.x - 8, sprite.y - 8);

        game.physics.arcade.moveToPointer(bullet, 300);
//    }

}

/*
    Ups the level and increases speed, points, & ball types.
*/
function changeLevel (){

    // check score against level threshold array
    if (score >= levelThresholds[level - 1]) {
        // increase level
        level += 1;
        // increase points per ball
        pointsPerBall *= 1.1;
        // TODO increase speed
    }

}

function getCurrentLevel(currentScore) {

}


/*
    Moves the spiral of balls inward toward the center.
*/
function moveBallPath() {
    ballOnPath.x += 2;
}

function render() {

//    game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 32);
    game.debug.text('Level: ' + level + ' | Score: ' + score + '| Next Level at: ' + levelThresholds[level - 1], 32, 64);
//    game.debug.spriteInfo(sprite, 32, 450);
    // Path Balls
//    game.debug.geom(pathBalls, '#cfffff');
//    game.debug.text('Diameter : ' + pathBalls.diameter, 50, 200);
//    game.debug.text('Circumference : ' + pathBalls.circumference(), 50, 230);

}


