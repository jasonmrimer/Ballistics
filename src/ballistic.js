// This project recreates Hitomi's favorite game.

/* !! There should always be an invisible anchor ball at the 0 index to slam back and all new balls should be inserted at index 1
*/

// define all functions, avoid JLint errors
var Phaser, preload, create, update, render, createSpiralPath, recursiveSpiral, movingSpiral,
    update, overlapHandlerBullets, overlapHandlerSpiralBalls, fire, changeLevel, getCurrentLevel,
    moveBallPath, render, console, recursiveSpiralInsert, recursiveBallCheck, killBalls, isMoveComplete,
    slamBack, slamBackToBallIndex, tightenPath, moveSingleBall, createBall, graphics, checkBullet, checkMatches,
    colorLine, gameOver;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    "use strict";
    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.image('bullet', 'assets/sprites/purple_ball.png');
    game.load.image('ballType01', 'assets/sprites/blue_ball.png');
//    game.load.spritesheet('bullets', 'assets/sprites/balls.png', 17, 17);
    game.load.spritesheet('bullets', 'assets/sprites/balls_v1.png', 40, 40);

}

var debug = true,
    sprite,
    ballOnPath,
    path = [],              // Holds all points on the spiral in numerical order until I figure out the equation
    bullet,
    anchorBall,
    anchorBallIndex = 7,    // final transparent ball as anchor
    ballTopIndex = 2,       // start with ## balls
    ballGroup,
    level = 1,              // Indicates the current level the player is on, increasing difficulty/points
    speed,                  // Velocity around the spiral increases proportional to the level
    pointsPerBall = 25,     // Points scored per each clearing, increases proportional to level
    score = 0,              // Total score - sum of pointsPerBall cleared
    numBallTypes,           // Start with a small number of ball types and increase with level
    fireRate = 100,
    nextFire = 0,
    levelThresholds = [100, 200, 300, 400, 500],
    centerX,
    centerY,
    matches = [],
    isInsertEnded = true,
    slamBackToBallIndex = 0,
    lastMoveMS = 0,
    checkTimeMS,
    pathSpacer = 1,
    lastTightenMS = 0,
    tightenIndex = 0,
    tightenComplete = true,
    pathBallType = 0,
    bulletType = 1,
    finishLine,
    bmd,
    p,
    colors,
    colorsIndex = 0,
    canMovePath = false,
    isSlamEnded = true,
    radius = 20,
    isGameOver = false;

function create() {
    "use strict";
    var i, pathBall, lineGraphics;
    centerX = game.world.centerX;
    centerY = game.world.centerY;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = createBall(bulletType);

    // Balls
    ballGroup = game.add.physicsGroup();

    createSpiralPath();



    // draw the balls along the path, leave room at end for pushing
    // anchor ball
    // Bullet
    anchorBall = game.add.sprite(path[pathSpacer].x, path[pathSpacer].y, 'bullets', anchorBallIndex);
    anchorBall.anchor.set(0.5);
    game.physics.enable(anchorBall, Phaser.Physics.ARCADE);
    anchorBall.body.immovable = true;
    anchorBall.body.allowRotation = false;
    anchorBall.enableBody = true;
    anchorBall.checkWorldBounds = true;
    anchorBall.outOfBoundsKill = true;

    // draw finish line

    finishLine = new Phaser.Line(centerX, centerY, centerX, centerY + 100);
    colors = Phaser.Color.HSVColorWheel();
    bmd = game.add.bitmapData(game.width, game.height);
    bmd.addToWorld();
    p = new Phaser.Point();

    graphics = game.add.graphics(finishLine.start.x, finishLine.start.y);//if you have a static line
    graphics.lineStyle(100, 0xffd900, 1);
    graphics.moveTo(finishLine.start.x, finishLine.start.y);//moving position of graphic if you draw mulitple lines
    graphics.lineTo(finishLine.end.x, finishLine.end.y);
    graphics.endFill();


    // set ball group characteristics
    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('body.immovable', true);
    ballGroup.setAll('body.allowRotation', true);
    ballGroup.setAll('enableBody', true);
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);
    ballGroup.setAll('body.setCircle', 20);

    for (i = 0; i < 10; i += 1) {
        pathBall = createBall(pathBallType, path[i].x, path[i].y, i);
    }

}

function createSpiralPath() {
    "use strict";
    var theta,
        radius = game.world.height / 2,
        segmentMax = 360,
        segmentCount = 0,
        x,
        y,
        rotatedX,
        rotatedY,
        rotateRadians = (Math.PI / 180) * 270,
        point = {    },
        loops;

    for (loops = 0; loops < 2; loops += 1) {
        for (segmentCount = 0; segmentCount < segmentMax; segmentCount += 1) {
            theta = 2.0 * Math.PI * segmentCount / segmentMax;
            x = centerX + radius * Math.cos(theta);
            y = centerY + radius * Math.sin(theta);
            rotatedX = (Math.cos(rotateRadians) * (x - centerX)) + (Math.sin(rotateRadians) * (y - centerY)) + centerX;
            rotatedY = (Math.cos(rotateRadians) * (y - centerY)) - (Math.sin(rotateRadians) * (x - centerX)) + centerY;
            point.x = rotatedX;
            point.y = rotatedY; //offset from center by half radius
            //rotate 90 clockwise but upside down pixel map so 270 clockwise
            path[path.length] = point;
            point = [];
            radius -= radius / segmentMax;
        }
    }
}

/*
    Predetermine all points along the path that the balls will travel throughout the game to reference exact positions when moving/inserting balls
*/
function recursiveSpiral(x, y) {
    "use strict";
    var point = {};
    x += 1;
    point.x = x;
    point.y = y;
    path[path.length] = point;

    if (x <= game.world.width) {
        recursiveSpiral(x, y);
    }

}

/*
    Update occurs as often as the frames allow and enables the steady change of sprites on the screen. This update moves balls along the spiral path during every repaint() and facilitates kills/movement in a streaming fashion
*/
function update() {
    "use strict";
    // Command to fire a bullet
    if (game.input.activePointer.isDown) {
        fire();
    }

    // take out all logic and start from scratch... i think canMatch allows me to let the methods operate without kills
    game.physics.arcade.overlap(ballGroup, bullet, overlapHandlerBullets);
    game.physics.arcade.overlap(ballGroup, ballGroup, overlapHandlerSpiralBalls);
    slamBack(slamBackToBallIndex);
    checkMatches();
    checkBullet();
    moveBallPath();
    colorLine();
    changeLevel();
    gameOver();

}

/*
    Handles when two balls collide in two separate occassions:
    1. The firing ball collides with balls on the path
    2. The path balls fill a gap create by a removal and "slam" together

    In both cases the function will smoothly bring the balls into alignment along the path and then determine if the new ball arrangement creates a segment of >= 3 matching balls. If so, it will remove the balls, score the points, and tighten the path.

*/
function overlapHandlerBullets(bulletCheck, ballCheck) {
    "use strict";
    var bulletTheta, ballTheta;

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
    moveSingleBall(bulletCheck, 0);
    // add to match array for checking if not already included
    if (matches.indexOf(ballGroup.getIndex(bulletCheck)) < 0) {
        matches.push(ballGroup.getIndex(bulletCheck));
    }

    // add an identifier to the bullet that it is the center of recursive match checks, delete the identifier when complete
//    bulletCheck.canMatch = true;
}

/*
    Handles after affects from a bullet collision enabling balls to shift and check whether any 3+ balls match
*/
function overlapHandlerSpiralBalls(ballA, ballB) {
    "use strict";
    var leftBall, rightBall, newRightIndex;

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
        rightBall.spiralIndex = leftBall.spiralIndex; // + 1;
    }

    moveSingleBall(rightBall, 1);
}

/*
    Shoots a ball at the cursor (TODO needs to be a right/left push to a dotted line instead of at cursor)
*/
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
        leftBallIndex = startBallIndex - 1,
        rightBall,
        leftBall;

    // check flag to avoid matches that are not at the hitzone of the bullet
    if (startBall.canMatch) {
        // check right ball
        if (rightBallIndex > -1 && rightBallIndex < ballGroup.length) {
            rightBall = ballGroup.getAt(rightBallIndex);

            // check matching ball type and not already included in matches
            if (startBall.frame === rightBall.frame && matchesArray.indexOf(rightBall) < 0) {
                rightBall.canMatch = true;
                matchesArray.push(rightBallIndex);
                recursiveBallCheck(rightBall, matchesArray);
            }
        }

        // check left ball
        if (leftBallIndex > -1 && leftBallIndex < ballGroup.length) {
            leftBall = ballGroup.getAt(leftBallIndex);
            // check matching ball type and not already included in matches
            if (startBall.frame === leftBall.frame && matchesArray.indexOf(leftBallIndex) < 0) {
                leftBall.canMatch = true;
                matchesArray.push(leftBallIndex);
                recursiveBallCheck(leftBall, matchesArray);
            }
        }
    }
}

/*
    Takes array of indeces and kills the balls that filled it if more than 3
*/
function killBalls(matchesArray) {
    "use strict";
    var uniqueMatches, sortedMatches, i, isMiddlePath, killBall, didMatch;

    // remove duplicates
    uniqueMatches = matchesArray.filter(function (item, pos, self) {
        return matchesArray.indexOf(item) === pos;
    });
    // sort
    sortedMatches = uniqueMatches.sort(function (a, b) {
        return a - b;
    });

    // need to readjust the indeces to remove the correct balls once the indeces change from removing from ballgroup
    if (sortedMatches.length >= 3) {
        for (i = 0; i < sortedMatches.length; i += 1) {
            killBall = ballGroup.getAt(sortedMatches[i] - i);
            ballGroup.remove(killBall);
            killBall.kill();
            score += pointsPerBall;
        }
        // stop any balls being checkable
        ballGroup.setAll('canMatch', false);
        // make balls touch/nearly touch to slam back (could be used to slow secondary kills using that collision)
        slamBackToBallIndex = sortedMatches[0] - 1;
        if (slamBackToBallIndex > -1) {
            ballGroup.getAt(slamBackToBallIndex).canMatch = true;
        }
        didMatch = true;
    } else {
        didMatch = false;
    }

    // clear array
    matches = [];

    // ups level if able
    changeLevel();

    return didMatch;
}

/*
    When ball sections "kill" it leaves a gap. This function pulls the balls ahead of the kill zone back toward the beginning of the gap.
*/
function slamBack(slamIndex) {
    "use strict";
    var i, slamBackLeft, slamBackRight; //, stbIndex;
     // slamBack to fill gaps
    if (slamIndex > 0) { //(slamBackToBallIndex > 0 && isMoveComplete) {
        // overlap means the balls met and gap filled, end the slamBack method
        slamBackLeft = ballGroup.getAt(slamBackToBallIndex);
        slamBackRight = ballGroup.getAt(slamBackToBallIndex + 1);
        if (game.physics.arcade.overlap(slamBackLeft, slamBackRight)) { //, overlapHandlerSpiralBalls)) {
            // check if the slamBacks trigger another kill
            // *exclude the start and end of path as they cannot make a sandwich (i.e, check if slamBackToBall is in the middle)
            if (slamBackToBallIndex > 0 && slamBackToBallIndex < ballGroup.length) {
                // check for matches once then move up the path slaming every ball to tighten
                if (slamBackLeft.canMatch) {
                    // Start recursive check of two balls if they match
                    if (slamBackLeft.frame === slamBackRight.frame) {
                        // check matches and kill 3-ball matches
                        matches = [];
                        matches.push(slamBackToBallIndex);
                        recursiveBallCheck(slamBackLeft, matches);
                        killBalls(matches);
                        return;
                    }
                }
                // increase slam index, will tighten path
                slamBackToBallIndex += 1;
            } else {
                //test for gaps TODO
//                isSlamEnded = true;
                slamBackToBallIndex = 0;
            }
        } else { // if it has yet to overlap AND a kill triggered the slam, keep moving all balls backward on path
            moveSingleBall(ballGroup.getAt(slamBackToBallIndex + 1), -1);
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
    // advance along the path one index
    var trailingBall = ballGroup.getAt(0),
        leadingBall = ballGroup.getAt(1),
        newBall;
        // move the path based on the game speed
    checkTimeMS = game.time.totalElapsedSeconds() * 1000;
    if (checkTimeMS - lastMoveMS >= 800) {//} && isMoveComplete && isInsertEnded) {
        // This needs to push the firstmostbal out (and trigger full spiral movement) until it passes the starting line then another ball takes its place
        lastMoveMS = checkTimeMS;
        // if it is still touching the anchor ball (aka behind the starting line), continue moving; otherwise, insert a new ball
        if (game.physics.arcade.overlap(leadingBall, anchorBall)) {
            // trailing ball; use to push up the rest
            moveSingleBall(trailingBall, 1);
        } else {
            newBall =  createBall(pathBallType, path[0].x, path[0].y, null);
        }
        canMovePath = false;
    }

}

function moveSingleBall(ball, spiralChange) {
    "use strict";
    var i;

    if (ball.spiralIndex + spiralChange > path.length) {
        ball.kill();
        isGameOver = true;
        return;
    } else {
        if (Math.abs(ball.spiralIndex) + spiralChange < 0) {
            ball.spiralIndex = Math.abs(ball.spiralIndex) - spiralChange;
        } // TODO this was broekn earlier... trying absolute values or something
        if (ball.spiralIndex < 0) {
            ball.spiralIndex = Math.abs(ball.spiralIndex) - spiralChange;
        }
    }

    for (i = ballGroup.getIndex(ball); i < ballGroup.length; i += 1) {
        ballGroup.getAt(i).spiralIndex = ballGroup.getAt(i).spiralIndex + spiralChange;
        ballGroup.getAt(i).x = path[ballGroup.getAt(i).spiralIndex].x;
        ballGroup.getAt(i).y = path[ballGroup.getAt(i).spiralIndex].y;
    }
}
//    if ((ball.spiralIndex + spiralChange > -1) && (ball.spiralIndex + spiralChange < path.length)) {
//        for (i = ballGroup.getIndex(ball); i < ballGroup.length; i += 1) {
//            ballGroup.getAt(i).spiralIndex = ballGroup.getAt(i).spiralIndex + spiralChange;
//            ballGroup.getAt(i).x = path[ballGroup.getAt(i).spiralIndex].x;
//            ballGroup.getAt(i).y = path[ballGroup.getAt(i).spiralIndex].y;
//        }
//    } else if (ball.spiralIndex + spiralChange < 0) {
//        ball.spiralIndex = 0;
//        ball.x = path[ball.spiralIndex].x;
//        ball.y = path[ball.spiralIndex].y;
//    } else if (ball.spiralIndex + spiralChange > path.length - 1) {
//        ball.kill();
//        gameOver = true;
//        return;
//    }


//}

function createBall(type, x, y, spiralIndex) {
    "use strict";
    var ball;
    ball = game.add.sprite(-100, -100, 'bullets', game.rnd.between(0, ballTopIndex));
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.anchor.set(0.5);
    ball.body.immovable = true;
    ball.body.allowRotation = false;
    ball.enableBody = true;
    ball.checkWorldBounds = true;
    ball.outOfBoundsKill = true;
    ball.canMatch = false;
    ball.body.setCircle(ball.width / 2);

    if (type === bulletType) {
        ball.canMatch = true;
        ball.x = centerX;
        ball.y = centerY;
    } else {
        // TODO will be deprecated when I remove the starting ball set for testing; all balls should start at index 0
        if (type === pathBallType && spiralIndex === null) {
            spiralIndex = 0;
        }
        ballGroup.addAt(ball, 0, false);
        ball.spiralIndex = spiralIndex;
        ball.anchor.set(0.5);
        ball.canMatch = false;
        moveSingleBall(ball, 0);
    }
    return ball;
}

function checkMatches() {
    "use strict";
    if (matches.length > 0) {
        recursiveBallCheck(ballGroup.getAt(matches[0]), matches);
        killBalls(matches);
    }
}

function checkBullet() {
    "use strict";
    // Ready a new bullet once the other is either out of the screen or added to the ball group
    if (!bullet.alive || ballGroup.contains(bullet)) {
        bullet = createBall(bulletType);
    }
}

function colorLine() {
    "use strict";
    // color line
    finishLine.random(p);
    p.floor();
    bmd.setPixel(p.x, p.y, colors[colorsIndex].r, colors[colorsIndex].g, colors[colorsIndex].b);
    colorsIndex = game.math.wrapValue(colorsIndex, 1, 359);
}

function gameOver() {
    "use strict";
    // TODO End game
    if (isGameOver) {
        console.log('game over!');
    }
}
function render() {
    "use strict";
    game.debug.text('Level: ' + level + ' | Score: ' + score + '| Next Level at: ' + levelThresholds[level - 1], 32, 64);
    if (debug) {
        ballGroup.forEach(function (ball) {
            game.debug.spriteBounds(ball);
        });
    }
}
