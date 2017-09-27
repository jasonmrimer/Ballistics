// This project recreates Hitomi's favorite game.

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

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

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(0,5));
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



//    for (i = 0; i < 20; i++)
//    {
////        var c = ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullet');
//         ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullets', game.rnd.between(0, 5));
//    }

//    for (i = 0; i < 20; i++)
//    {
////        var c = ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullet');
//         ballGroup.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'bullets', game.rnd.between(0, 5));
//    }
    createSpiralPath();
    for (i = 0; i < path.length; i++) {
        console.log(path[i].x + ', ' + path[i].y);
        var pathBall;
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



}

function createSpiralPath() {
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
//    ballGroup.create(x, y, 'bullets', game.rnd.between(0, 5));
//
//    // switch to polar coordinates
////    var theta = Math.atan((y - game.world.centerY) / (x - game.world.centerX));
//    var theta = Math.atan((y - game.world.centerY) / (x - game.world.centerX));
////    var theta = Math.atan((y) / (x));
////    var radius = Math.hypot((x - game.world.centerX), (y - game.world.centerY));
//    var radius = Math.sqrt(Math.pow((x - game.world.centerX),2), Math.pow((y - game.world.centerY),2));
//    console.log(x + ', ' + y + ' radius1: ' + radius + ' theta1: ' + theta + ' center: ' + game.world.centerX +', ' + game.world.centerY)
//
//
//    // calculate new coordinate based on spiral equation to recurse (logarithmic spiral in polar: r = a*(e^(b*theta)))
//    theta += (2 * Math.PI / 360);
////    if (theta < 0) {
////        theta += 2 * Math.PI;
////    }
//    radius = 100 * (Math.E ^ (3 * (theta)));
//    x = game.world.centerX + radius * Math.cos(theta);
//    y = game.world.centerY + radius * Math.sin(theta);
//
//    console.log(x + ', ' + y + ' radius2: ' + radius + ' theta2: ' + theta)
//
//    if (radius > 1) {
//        recursiveSpiral(x, y);
//    }


}

function movingSpiral(ball) {

//    // https://stackoverflow.com/questions/10348463/js-object-following-a-circle
//    var dx = ball.x - game.world.centerX,
//    dy = ball.y - game.world.centerY,
//    r = Math.atan2(dy, dx);
//
////    ball.x = Math.sin(r) * ball.speed + this.x;
////    ball.y = (Math.cos(r) * ball.speed * -1) + this.y;
//
//
//      ball.x = (Math.sin(r) * 20 + ball.x);
//      ball.y = ((Math.cos(r) * 20 * -1) + ball.y);
//
////    var spiralBallSpacer = bullet.width / 2;
////    var radiusX = ball.x - game.world.centerX;
////    var radiusY = ball.y - game.world.centerY;
////    var radius = Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2));
////    var theta = Math.acos(ball.x / radius);
////    var spiralBallCount = theta / 2.0 / Math.PI;
////    ball.x = (radius - radius / spiralBallSpacer) * Math.cos(2.0 * Math.PI * spiralBallCount);
////    ball.y = (radius - radius / spiralBallSpacer) * Math.sin(2.0 * Math.PI * spiralBallCount);
//
////    console.log('ball [' + ball.x + ', ' + ball.y + ']');
}

function update() {

//    sprite.rotation = game.physics.arcade.angleToPointer(sprite);

    if (game.input.activePointer.isDown) {
        fire();
    }

    game.physics.arcade.collide(ballGroup, bullet, collisionHandlerBullets);
    game.physics.arcade.collide(ballGroup, ballGroup, collisionHandlerSpiralBalls);

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

    movingSpiral(spiralTestBall);
    moveBallPath();
}

/*
    Handles when two balls collide in two separate occassions:
    1. The firing ball collides with balls on the path
    2. The path balls fill a gap create by a removal and "slam" together

    In both cases the function will smoothly bring the balls into alignment along the path and then determine if the new ball arrangement creates a segment of >= 3 matching balls. If so, it will remove the balls, score the points, and tighten the path.

*/
function collisionHandlerBullets(bulletCheck, ballCheck) {
    // test if matching
//    ballGroup.add(bullet, 1);
            console.log('ball.spiralIndex: ' + ballCheck.spiralIndex);

    if (bulletCheck.frame == ballCheck.frame) {
        // if match then score
        score += pointsPerBall;
        ballCheck.kill();
        bulletCheck.kill();
    }
    else {
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
    // test if matching
//    ballGroup.add(bullet, 1);
    console.log('ballA group index: ' + ballA.index);

    if (ballA.frame == ballB.frame) {
        // if match then score
        score += pointsPerBall;
        ballA.kill();
        ballB.kill();
    }
    else {
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


