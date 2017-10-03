// This project recreates Hitomi's favorite game.

// define all functions, avoid JLint errors
var Phaser, preload, create, update, render, createSpiralPath, recursiveSpiral, movingSpiral,
    update, collisionHandlerBullets, collisionHandlerSpiralBalls, fire, changeLevel, getCurrentLevel,
    moveBallPath, render, console, recursiveSpiralInsert, recursiveBallCheck, killBalls;

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
var bullet;
var ballGroup;
var level = 1;          // Indicates the current level the player is on, increasing difficulty/points
var speed;              // Velocity around the spiral increases proportional to the level
var pointsPerBall = 25;      // Points scored per each clearing, increases proportional to level
var score = 0;              // Total score - sum of pointsPerBall cleared
var numBallTypes;       // Start with a small number of ball types and increase with level
var fireRate = 100;
var nextFire = 0;
var levelThresholds = [100, 200, 300, 400, 500];
var centerX;
var centerY;


function create() {
    "use strict";
    var spiralTestBall, i, pathBall;
    centerX = game.world.centerX;
    centerY = game.world.centerY;

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

    // draw the balls along the path, leave room at end for pushing
    for (i = 0; i < (path.length / 2); i += bullet.width) {
        pathBall = game.add.sprite(path[i].x, path[i].y, 'bullets', game.rnd.between(0, 5), ballGroup);
        pathBall.spiralIndex = i;
        pathBall.anchor.set(0.5);
        game.physics.enable(pathBall, Phaser.Physics.ARCADE);
        pathBall.body.immovable = true;
        pathBall.body.allowRotation = false;
        pathBall.enableBody = true;
        pathBall.checkWorldBounds = true;
        pathBall.outOfBoundsKill = true;
    }

    movingSpiral();

    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);

}

function createSpiralPath() {
    "use strict";
    //    point.x = 0, point.y = 200;

    //    path[0] = point;
//    recursiveSpiral(200, centerY + 100);
    var theta, radius = 200;

    for (theta = 0; theta <= 1000; theta += 1) {
        var point = {    };
        point.x = centerX + (radius * Math.cos(2 * Math.PI * theta / 1000));
        point.y = centerY + (radius * Math.sin(2 * Math.PI * theta / 1000));
        path[path.length] = point;
    }
//    recursiveSpiral(200, centerY - 100);

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

/*
    Predetermine all points along the path that the balls will travel throughout the game to reference exact positions when moving/inserting balls
*/
function recursiveSpiral(x, y) {
    "use strict";

//    x += bullet.width;
    var point = {    };
    x += 1;
    point.x = x;
    point.y = y;
    path[path.length] = point;

    if (x <= game.world.width) {
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
    game.physics.arcade.overlap(ballGroup, bullet, collisionHandlerBullets);
    game.physics.arcade.overlap(ballGroup, ballGroup, collisionHandlerSpiralBalls);

    // Ready a new bullet once the other is either out of the screen or added to the ball group
    if (!bullet.alive || ballGroup.contains(bullet)) {
        // Bullet
        bullet = game.add.sprite(centerX, centerY, 'bullets', game.rnd.between(0, 5));
        bullet.anchor.set(0.5);
        game.physics.enable(bullet, Phaser.Physics.ARCADE);
        bullet.body.allowRotation = false;
        bullet.enableBody = true;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
    }
    console.log('update');
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
    var bulletTheta, ballTheta;
    bulletCheck.body.immovable = true;
    bulletCheck.body.allowRotation = false;
    bulletCheck.enableBody = true;
    bulletCheck.checkWorldBounds = true;
    bulletCheck.outOfBoundsKill = true;
    // Upon collision, add bullet to ball group between the two it wedges into

/*
    // test if matching
//    ballGroup.add(bullet, 1);
//    console.log('ball.spiralIndex: ' + ballCheck.spiralIndex);

    // TODO Remove and turn .kill function into a 3-ball match
//    if (bulletCheck.frame === ballCheck.frame) {
//        // if match then score
//        score += pointsPerBall;
//        ballCheck.kill();
//        bulletCheck.kill();
//    } else {
//        // Squeeze bullet into path group - on hold to test theta calculation
//        bulletCheck.spiralIndex = ballCheck.spiralIndex;
//        bulletCheck.x = path[bulletCheck.spiralIndex].x;
//        bulletCheck.y = path[bulletCheck.spiralIndex].y;
//        if (ballCheck.spiralIndex < path.length - 1) {
//            ballCheck.spiralIndex += 1;
//            ballCheck.x = path[ballCheck.spiralIndex].x;
//            ballCheck.y = path[ballCheck.spiralIndex].y;
//        }
//
//    }
*/

    /*
        Adds the bullet to the spiral path ball group base on whether it is to the right/left of the ball with which it collides.
        Determine the quadrant of the ball first then compare the bullet's position on impact to figure if right/left and at what
        index to add it to group.
    */
    // *All y-values are inverse because of pixel coordinate system!!!

    bulletTheta = Math.atan(-(bulletCheck.y - centerY) / (bulletCheck.x - centerX));
    ballTheta = Math.atan(-(ballCheck.y - centerY) / (ballCheck.x - centerX));

    // Quadrant I (x > 0, y > 0): theta stays as calculated
    if (ballCheck.x < centerX && ballCheck.y < centerY) {
        // Quadrant II (x < 0, y > 0): add pi || 180 deg to theta
        bulletTheta += Math.PI;
        ballTheta += Math.PI;
    } else if (ballCheck.x < centerX && ballCheck.y > centerY) {
        // Quadrant III (x < 0, y < 0): add pi || 180 deg to theta
        bulletTheta += Math.PI;
        ballTheta += Math.PI;
    } else if (ballCheck.x > centerX && ballCheck.y > centerY) {
        // Quadrant IV (x > 0, y < 0): add pi || 360 deg to theta
        bulletTheta += 2 * Math.PI;
        ballTheta += 2 * Math.PI;
    }

    // if bullet theta is less than ball theta then it inserts at a higher index on the spiral path (with a clockwise spiral)
    // left
    if (bulletTheta >= ballTheta) {
        // add bullet to the group before the ball check
        // exception for first position
        ballGroup.addAt(bulletCheck, ballGroup.getIndex(ballCheck), false);
        bulletCheck.spiralIndex = ballGroup.getAt(ballGroup.getIndex(ballCheck)).spiralIndex;   // only give a spiral index when the left ball; otherwise, let the ball collision handler assign spiral indeces to the bullet when it is on the right
    // right
    } else {
        // add bullet to the group after the ball check
        ballGroup.addAt(bulletCheck, ballGroup.getIndex(ballCheck) + 1, false);
        bulletCheck.spiralIndex = ballGroup.getAt(ballGroup.getIndex(ballCheck)).spiralIndex;
    }
    bulletCheck.body.moves = false;
    bulletCheck.x = path[bulletCheck.spiralIndex].x;
    bulletCheck.y = path[bulletCheck.spiralIndex].y;
    // TODO build function to recursively adjust all the spirals until each ball does not touch but has inserted the bullet
    changeLevel();
}

/*
    Handles after affects from a bullet collision enabling balls to shift and check whether any 3+ balls match
*/
function collisionHandlerSpiralBalls(ballA, ballB) {
    "use strict";
    var leftBall, rightBall, newRightIndex, matches = [];

    // determine which ball is ahead of the other in the group to avoid switching positions
    if (ballGroup.getIndex(ballA) < ballGroup.getIndex(ballB)) {
        leftBall = ballA;
        rightBall = ballB;
    } else {
        leftBall = ballB;
        rightBall = ballA;
    }
    // left stays at its sprial index, right changes
    // switch spiral index then increase spiral index (aka position on spiral) until the two balls stop colliding
    if (rightBall.spiralIndex === null) { // when not assigned because bullet is right of path ball
        rightBall.spiralIndex = leftBall.spiralIndex + 1;
    } else if ((rightBall.spiralIndex + 1) < path.length) { // still room on the path, increase by 1 until not colliding
        rightBall.spiralIndex += 1;
    } else { // kill ball TODO end game
        rightBall.kill();
    }

    // set new position of bullet before sending to function (ought to add that to function...)
    rightBall.x = path[rightBall.spiralIndex].x;
    rightBall.y = path[rightBall.spiralIndex].y;

    // check matches and kill 3-ball matches
    matches = [];
    matches.push(ballGroup.getIndex(leftBall));
    recursiveBallCheck(leftBall, matches);
    killBalls(matches);
    matches = [];
    matches.push(ballGroup.getIndex(rightBall));
    recursiveBallCheck(rightBall, matches);
    killBalls(matches);
//    if (ballA.frame === ballB.frame) {
//        // if match then score
//        score += pointsPerBall;
//        ballA.kill();
//        ballB.kill();
//    } else {
//        var tempIndex = ballB.spiralIndex;
//
////        bulletCheck.spiralIndex = ballCheck.spiralIndex;
////        bulletCheck.x = path[bulletCheck.spiralIndex].x;
////        bulletCheck.y = path[bulletCheck.spiralIndex].y;
////        if (ballCheck.spiralIndex < path.length - 1) {
////            ballCheck.spiralIndex += 1;
////            ballCheck.x = path[ballCheck.spiralIndex].x;
////            ballCheck.y = path[ballCheck.spiralIndex].y;
////        }
//
//    }

    changeLevel();
}

function fire() {
    "use strict";
    game.physics.arcade.moveToPointer(bullet, 300);
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

/*
    Check the balls to the "right" and "left" on the spiral and follow for any 3-ball matches then kill & score.
*/
function recursiveBallCheck(startBall, matchesArray) {
    "use strict";
    var startBallIndex = ballGroup.getIndex(startBall),
        rightBallIndex = startBallIndex + 1,
        leftBallIndex = startBallIndex + 1,
        rightBall = ballGroup.getAt(rightBallIndex),
        leftBall = ballGroup.getAt(leftBallIndex);
    if (startBall.frame === rightBall.frame && matchesArray.indexOf(rightBall) < 0) {
        matchesArray.push(ballGroup.getIndex(rightBall));
        recursiveBallCheck(rightBall, matchesArray);
    } else if (startBall.frame === leftBall.frame && matchesArray.indexOf(leftBall) < 0) {
        matchesArray.push(ballGroup.getIndex(leftBall));
        recursiveBallCheck(leftBall, matchesArray);
    } else {
        return;
    }
}

/*
    Takes array of indeces and kills the balls that filled it if more than 3
*/
function killBalls(matches) {
    "use strict";
    // remove duplicates and sort
    var uniqueMatches = matches.filter(function (item, pos, self) {
        return matches.indexOf(item) === pos;
    }), /* sort */
        sortedMatches = uniqueMatches.sort(function (a, b) {
            return a - b;
        }),
        i;
    // need to readjust the indeces to remove the correct balls once the indeces change from removing from ballgroup
    if (sortedMatches.length >= 3) {
        for (i = 0; i < sortedMatches.length; i += 1) {
            ballGroup.getAt(sortedMatches[i] - i).kill();
            ballGroup.remove(ballGroup.getAt(sortedMatches[i] - i));
            score += pointsPerBall;
            console.log('ballGroup size ' + ballGroup.length);
        }
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
    game.debug.text('Level: ' + level + ' | Score: ' + score + '| Next Level at: ' + levelThresholds[level - 1], 32, 64);
}


