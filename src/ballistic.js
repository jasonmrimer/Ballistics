// This project recreates Hitomi's favorite game.

// define all functions, avoid JLint errors
var Phaser, preload, create, update, render, createSpiralPath, recursiveSpiral, movingSpiral,
    update, collisionHandlerBullets, collisionHandlerSpiralBalls, fire, changeLevel, getCurrentLevel,
    moveBallPath, render, console;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    "use strict";
    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.image('bullet', 'assets/sprites/purple_ball.png');
    game.load.image('ballType01', 'assets/sprites/blue_ball.png');
    game.load.spritesheet('bullets', 'assets/sprites/balls.png', 17, 17);
}

var sprite;
var ballOnPath;
var path = [];          // Holds all points on the spiral in numerical order until I figure out the equation
//var point = {x: 0, y: 0};
//var bullets;
var bullet;
var ballGroup;
//var pathBalls;          // This are the balls along the spiral path
var level = 1;          // Indicates the current level the player is on, increasing difficulty/points
var speed;              // Velocity around the spiral increases proportional to the level
var pointsPerBall = 25;      // Points scored per each clearing, increases proportional to level
var score = 0;              // Total score - sum of pointsPerBall cleared
var numBallTypes;       // Start with a small number of ball types and increase with level
var fireRate = 100;
var nextFire = 0;
var levelThresholds = [100, 200, 300, 400, 500];

function create() {
    "use strict";
    var spiralTestBall, i, pathBall;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(0, 5));
    bullet.anchor.set(0.5);
    game.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.immovable = true;
    bullet.body.allowRotation = false;
    bullet.enableBody = true;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;


    // Spiral Test Ball
    spiralTestBall = game.add.sprite(700, 300, 'bullets', 0);
    spiralTestBall.anchor.set(0.5);
    game.physics.enable(spiralTestBall, Phaser.Physics.ARCADE);
    spiralTestBall.body.allowRotation = false;
    spiralTestBall.enableBody = true;
    spiralTestBall.checkWorldBounds = true;
    spiralTestBall.outOfBoundsKill = true;

    // Balls
    ballOnPath = game.add.sprite(100, 100, 'ballType01');
    ballOnPath.anchor.set(0.5);

    game.physics.enable(ballOnPath, Phaser.Physics.ARCADE);

    ballOnPath.body.allowRotation = false;

    ballGroup = game.add.physicsGroup();

    createSpiralPath();

    for (i = 0; i < path.length; i += 1) {
        console.log(path[i].x + ', ' + path[i].y);
        pathBall = game.add.sprite(path[i].x, path[i].y, 'bullets', game.rnd.between(0, 5), ballGroup);
        pathBall.spiralIndex = i;
        pathBall.anchor.set(0.5);
        game.physics.enable(pathBall, Phaser.Physics.ARCADE);
        pathBall.body.immovable = true;
        pathBall.body.allowRotation = false;
        pathBall.enableBody = true;
        pathBall.checkWorldBounds = true;
        pathBall.outOfBoundsKill = true;
//        ballGroup.create(path[i].x, path[i].y, 'bullets', game.rnd.between(0, 5));
    }
    movingSpiral();
    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);


    // Testing the Group indexing for adding balls and changing all indices
    // Test proved group indices push all forward when addAt squeezes child into middle
//    var testGroup = game.add.physicsGroup();
//    var testBall1 = game.add.sprite(10, 10, 'bullets', game.rnd.between(0, 5), testGroup)
//    testBall1.testIndex = 0;
//    var testBall2 = game.add.sprite(50, 50, 'bullets', game.rnd.between(0, 5), testGroup)
//    testBall2.testIndex = 1;
//    var testBall3 = game.add.sprite(100, 100, 'bullets', game.rnd.between(0, 5))
//    testBall3.testIndex = 2;
//    console.log('groupIndex before: tb1 gi ' + testGroup.getIndex(testBall1) + ' , tb1 ti ' + testBall1.testIndex +
//               ' tb2 gi ' + testGroup.getIndex(testBall2) + ' , tb2 ti ' + testBall2.testIndex +
//               ' tb3 gi ' + testGroup.getIndex(testBall3) + ' , tb3 ti ' + testBall3.testIndex)
//    testGroup.addAt(testBall3, 1, false);
//    console.log('groupIndex after: tb1 gi ' + testGroup.getIndex(testBall1) + ' , tb1 ti ' + testBall1.testIndex +
//               ' tb2 gi ' + testGroup.getIndex(testBall2) + ' , tb2 ti ' + testBall2.testIndex +
//               ' tb3 gi ' + testGroup.getIndex(testBall3) + ' , tb3 ti ' + testBall3.testIndex)

}

function createSpiralPath() {
    "use strict";
    //    point.x = 0, point.y = 200;

    //    path[0] = point;
    recursiveSpiral(0, 200);

//    var spiralRadiusMax = 400;
//    var spiralNumber = 3;
//    var spiralBallSpacer = bullet.width / 2;
//    var spiralRadius = spiralBallSpacer * spiralNumber + 300;

//    //spirals
//    for (spiralCount = 0; spiralCount < spiralNumber; spiralCount++) {
//        for (spiralBallCount = 0; spiralBallCount < spiralBallSpacer; spiralBallCount++) {
//            var theta = 2.0 * Math.PI * spiralBallCount / spiralBallSpacer; // get current angle
////            var theta = 2.0 * Math.PI * spiralRadius; // get current angle
//            var x = spiralRadius * Math.cos(theta);                         // calculate the x component
//            var y = spiralRadius * Math.sin(theta);                         // calculate the y component
//            ballGroup.create(x + 400, y + 300, 'bullets', game.rnd.between(0, 5));
////            console.log('[' + x + ', ' + y + ']/n');
//            spiralRadius -= spiralRadius / spiralBallSpacer;
//        }

//        for (theta = 1080; theta >= 0; theta--) {
////            var theta = 2.0 * Math.PI * spiralBallCount / spiralBallSpacer; // get current angle
////            var theta = 2.0 * Math.PI * spiralRadius; // get current angle
//
//            var x = spiralRadius * Math.cos(theta);                         // calculate the x component
//            var y = spiralRadius * Math.sin(theta);                         // calculate the y component
//            ballGroup.create(x + 400, y + 300, 'bullets', game.rnd.between(0, 5));
////            console.log('[' + x + ', ' + y + ']/n');
//            spiralRadius -= spiralRadiusMax / 720;
//        }


//    }

//    for (radius = 300; radius > 0; radius--) {
//        // equation of a logarithmic spiral in polar: r = a*(e^(b*theta))
//        var x = Math.acos
//
//    }

//    recursiveSpiral(600, 300);
//    recursiveSpiral(300)
}

function recursiveSpiral(x, y) {
    "use strict";

    x += bullet.width;
    var point = {    };
    point.x = x;
    point.y = y;
//    path[path.length] = point;
    path[path.length] = point;
//    console.log('point.x: ' + point.x + ' | point.y: ' + point.y + ' path length: ' + path.length);

    if (x <= game.world.centerX) {
        recursiveSpiral(x, y);
    }

}

function movingSpiral(ball) {
    "use strict";
}

function update() {
    "use strict";

    // Command to fire a bullet
    if (game.input.activePointer.isDown) {
        fire();
    }

    // Trigger collision handlers for balls that reach the path
    game.physics.arcade.collide(ballGroup, bullet, collisionHandlerBullets);
    game.physics.arcade.collide(ballGroup, ballGroup, collisionHandlerSpiralBalls);

    // Ready a new bullet once the other is either out of the screen or added to the ball group
    if (!bullet.alive) {
        // Bullet
        bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(0, 5));
        bullet.anchor.set(0.5);
        game.physics.enable(bullet, Phaser.Physics.ARCADE);
        bullet.body.allowRotation = false;
        bullet.enableBody = true;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
    }

//    movingSpiral(spiralTestBall);
    moveBallPath();
}

/*
    Handles when two balls collide in two separate occassions:
    1. The firing ball collides with balls on the path
    2. The path balls fill a gap create by a removal and "slam" together

    In both cases the function will smoothly bring the balls into alignment along the path and then determine if the new ball arrangement creates a segment of >= 3 matching balls. If so, it will remove the balls, score the points, and tighten the path.

*/
function collisionHandlerBullets(bulletCheck, ballCheck) {
    "use strict";
    // Upon collision, add bullet to ball group between the two it wedges into


    // test if matching
//    ballGroup.add(bullet, 1);
    console.log('ball.spiralIndex: ' + ballCheck.spiralIndex);

    if (bulletCheck.frame === ballCheck.frame) {
        // if match then score
        score += pointsPerBall;
        ballCheck.kill();
        bulletCheck.kill();
    } else {
        bulletCheck.spiralIndex = ballCheck.spiralIndex;
        bulletCheck.x = path[bulletCheck.spiralIndex].x;
        bulletCheck.y = path[bulletCheck.spiralIndex].y;
        if (ballCheck.spiralIndex < path.length - 1) {
            ballCheck.spiralIndex += 1;
            ballCheck.x = path[ballCheck.spiralIndex].x;
            ballCheck.y = path[ballCheck.spiralIndex].y;
        }

    }

    changeLevel();
}

function collisionHandlerSpiralBalls(ballA, ballB) {
    "use strict";
    // test if matching
//    ballGroup.add(bullet, 1);
    console.log('ballA group index: ' + ballA.index);

    if (ballA.frame === ballB.frame) {
        // if match then score
        score += pointsPerBall;
        ballA.kill();
        ballB.kill();
    } else {
        var tempIndex = ballB.spiralIndex;

//        bulletCheck.spiralIndex = ballCheck.spiralIndex;
//        bulletCheck.x = path[bulletCheck.spiralIndex].x;
//        bulletCheck.y = path[bulletCheck.spiralIndex].y;
//        if (ballCheck.spiralIndex < path.length - 1) {
//            ballCheck.spiralIndex += 1;
//            ballCheck.x = path[ballCheck.spiralIndex].x;
//            ballCheck.y = path[ballCheck.spiralIndex].y;
//        }

    }

    changeLevel();
}
function fire() {
    "use strict";
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
function changeLevel() {
    "use strict";
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
    "use strict";
}


/*
    Moves the spiral of balls inward toward the center.
*/
function moveBallPath() {
    "use strict";
    ballOnPath.x += 2;
}

function render() {
    "use strict";
//    game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 32);
    game.debug.text('Level: ' + level + ' | Score: ' + score + '| Next Level at: ' + levelThresholds[level - 1], 32, 64);
//    game.debug.spriteInfo(sprite, 32, 450);
    // Path Balls
//    game.debug.geom(pathBalls, '#cfffff');
//    game.debug.text('Diameter : ' + pathBalls.diameter, 50, 200);
//    game.debug.text('Circumference : ' + pathBalls.circumference(), 50, 230);

}


