// This project recreates Hitomi's favorite game.

/* !! There should always be an invisible anchor ball at the 0 index to slam back and all new balls should be inserted at index 1
*/

// define all functions, avoid JLint errors
var Phaser, preload, create, update, render, createSpiralPath, recursiveSpiral, movingSpiral,
    update, overlapHandlerBullets, overlapHandlerSpiralBalls, fire, changeLevel, getCurrentLevel,
    moveBallPath, render, console, recursiveSpiralInsert, recursiveBallCheck, killBalls, isMoveComplete,
    slamBack, tightenPath, moveSingleBall, createBall, graphics, checkBullet, checkMatches,
    colorLine, gameOver, setGameScale, isLastBall, isSlammableBall, isFirstBall;

var gameWidth = 2400,
    gameHeight = 2400;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var anchorBall,
    ballGroup,
    bmd,
    bullet,
    canMovePath = false,
    canvasSquareSize,
    centerX,
    centerY,
    checkBall,
    checkTimeMS,
    colors,
    colorsIndex = 0,
    finishLine,
    finishLineSprite,
    isGameOver = false,
    lastMoveMS = 0,
    matches = [],
    p,
    path = [],              // Holds all points on the spiral in numerical order until I figure out the equation
    slamBackToBall = null,
    slamBackToBallIndex = 0,
    speed,                  // Velocity around the spiral increases proportional to the level
    sprite,
//    tightenIndex = 0,
//    tightenComplete = true,
    TYPE_BALL_ANCHOR = 2,
    TYPE_BALL_BULLET = 1,
    TYPE_BALL_PATH = 0,

    // mutables
    bulletSpeed = gameHeight / 1.5,
    currentLevel = 1,              // Indicates the current level the player is on, increasing difficulty/points
    debug = false,
    FRAME_ANCHOR = 7,    // final transparent ball as anchor
    FRAME_BALL_TYPE_MAX = 3,           // Start with a small number of ball types and increase with level
    levelIncreasePercent = 10,
    levelThresholds = [100, 200, 300, 400, 500], // TODO set via equation and be able to add levels as it continue (no end)
    movementSpeedMS = 1000,
    nextLevelIncrease = 2000,
    nextLevelThreshold = 1000,
    pathSpacer = 1,
    pointsPerBallCurrent = 100,     // Points scored per each clearing, increases proportional to level
    pointsPerBallMaster = 100,
    radiusScaled = 32,
    radiusSpriteSheet = 32,
    score = 0;               // Total score - sum of pointsPerBall cleared



function preload() {
    "use strict";
    game.load.spritesheet('bullets', 'assets/sprites/balls_v3.png', radiusSpriteSheet * 2, radiusSpriteSheet * 2);

}

function create() {
    "use strict";
    var i, pathBall, lineGraphics;
    centerX = game.world.centerX;
    centerY = game.world.centerY;

    setGameScale();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = createBall(TYPE_BALL_BULLET);

    // Balls
    ballGroup = game.add.physicsGroup();

    createSpiralPath();


    anchorBall = createBall(TYPE_BALL_ANCHOR, path[pathSpacer].x, path[pathSpacer].y);

    // draw finish line

//    finishLine = new Phaser.Line(centerX, centerY - radiusScaled, centerX, centerY - radiusScaled * 4, 20);
    finishLine = new Phaser.Rectangle(centerX - radiusScaled / 4, centerY - radiusScaled * 8, radiusScaled / 2, radiusScaled * 7);
    finishLineSprite = game.add.sprite(-100, -100, 'bullets', game.rnd.between(0, FRAME_BALL_TYPE_MAX - 1));

    colors = Phaser.Color.HSVColorWheel();
//    bmd = game.add.bitmapData(radiusScaled / 2, radiusScaled * 7);
    bmd = game.add.bitmapData(game.width, game.height);
    bmd.addToWorld();
    finishLineSprite = game.add.sprite(centerX - radiusScaled / 4, centerY - radiusScaled * 8);
    finishLineSprite.enableBody = true;
    finishLineSprite.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.arcade.enable(finishLineSprite);
    finishLineSprite.checkWorldBounds = true;
    finishLineSprite.outOfBoundsKill = true;
//    bmd.line(centerX, centerY - radiusScaled, centerX, centerY - radiusScaled * 4, 20);
    p = new Phaser.Point();

//    graphics = game.add.graphics(finishLine.start.x, finishLine.start.y);//if you have a static line
//    graphics.lineStyle(100, 0xffd900, 100);
//    graphics.moveTo(finishLine.start.x, finishLine.start.y);//moving position of graphic if you draw mulitple lines
//    graphics.lineTo(finishLine.end.x, finishLine.end.y);
//    graphics.endFill();


    // set ball group characteristics
    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('body.immovable', true);
    ballGroup.setAll('body.allowRotation', true);
    ballGroup.setAll('enableBody', true);
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);


//    for (i = 0; i < 10; i += 1) {
//        pathBall = createBall(TYPE_BALL_PATH, path[i].x, path[i].y, i);
//    }

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
        rotateRadians = (Math.PI / 180) * 360,
        point = {    },
        loops;

    for (loops = 0; loops < 2; loops += 1) {
        for (segmentCount = 0; segmentCount < segmentMax; segmentCount += 1) {
//            theta = 2.0 * Math.PI * segmentCount / segmentMax;
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
            radius -= radius / segmentMax / 2;
        }
    }

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
    fire();
    game.physics.arcade.overlap(ballGroup, bullet, overlapHandlerBullets);
    game.physics.arcade.overlap(ballGroup, ballGroup, overlapHandlerSpiralBalls);
    game.physics.arcade.collide(ballGroup, finishLineSprite, gameOver);
    slamBackToBall = slamBack(slamBackToBall);

    checkMatches();
    checkBullet();
    moveBallPath();
    colorLine();
    changeLevel();
}

/*
    Based on canvas size, create the biggest square possible then re-define the size of all the game components.
*/
function setGameScale() {
    "use strict";
    // canvas square
    if (game.world.width > game.world.height) {
        canvasSquareSize = game.world.width;
    } else {
        canvasSquareSize = game.world.height;
    }

    // ball size
    radiusScaled = canvasSquareSize / 32;

    // TODO inner circle
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
    if (matches.indexOf(bulletCheck) < 0) {
        matches.push(bulletCheck);
    }
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
    if (game.input.activePointer.isDown) {
        game.physics.arcade.moveToPointer(bullet, bulletSpeed);
    }
}

/*
    Ups the level and increases speed, points, & ball types.
*/
function changeLevel() {
    "use strict";
    var increaseVal = 1 + levelIncreasePercent / 100;
    // check score against level threshold array
//    if (score >= levelThresholds[currentLevel - 1]) {
//        // increase level
//        currentLevel += 1;
//        // increase points per ball
//        pointsPerBall *= 1.1;
//        // TODO increase speed
//    }

    if (score >= nextLevelThreshold) {
        currentLevel += 1;
        nextLevelIncrease *= increaseVal;
        nextLevelThreshold += nextLevelIncrease;
        nextLevelThreshold = Math.round(nextLevelThreshold / 1000) * 1000;
        movementSpeedMS /= increaseVal;
        pointsPerBallMaster = pointsPerBallMaster * increaseVal;
        pointsPerBallCurrent = Math.round(pointsPerBallMaster / 50) * 50;

        if (currentLevel === 4) {
            FRAME_BALL_TYPE_MAX += 1;
        } else if (currentLevel === 7) {
            FRAME_BALL_TYPE_MAX += 1;
        } else if (currentLevel === 10) {
            FRAME_BALL_TYPE_MAX += 1;
        } else if (currentLevel === 13) {
            FRAME_BALL_TYPE_MAX += 1;
        }
    }

}

/*
    Check the balls to the "right" and "left" on the spiral and follow for any 3-ball matches then kill & score.
*/

function recursiveSlamBallCheck(matchesArray) {
    "use strict";
    matchesArray.forEach(function (ball) {
        var leftBall, rightBall;
        if (!isLastBall(ball)) {
            rightBall = ballGroup.getAt(ballGroup.getIndex(ball) + 1);
            if (rightBall.frame === ball.frame && matchesArray.indexOf(rightBall) === -1) {
                rightBall.canMatch = true;
                matches.push(rightBall);
                recursiveSlamBallCheck(matches);
            }
        }

        if (!isFirstBall(ball)) {
            leftBall = ballGroup.getAt(ballGroup.getIndex(ball) - 1);
            if (leftBall.frame === ball.frame && matchesArray.indexOf(leftBall) === -1) {
                leftBall.canMatch = true;
                matches.push(leftBall);
                recursiveSlamBallCheck(matches);
            }
        }
    });
}

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
                matchesArray.push(rightBall);
                recursiveBallCheck(rightBall, matchesArray);
            }
        }

        // check left ball
        if (leftBallIndex > -1 && leftBallIndex < ballGroup.length) {
            leftBall = ballGroup.getAt(leftBallIndex);
            // check matching ball type and not already included in matches
            if (startBall.frame === leftBall.frame && matchesArray.indexOf(leftBall) < 0) {
                leftBall.canMatch = true;
                matchesArray.push(leftBall);
                recursiveBallCheck(leftBall, matchesArray);
            }
        }
    }
}

function checkMatches() {
    "use strict";
    if (matches.length > 0) {
        recursiveSlamBallCheck(matches);
        killBalls(matches);
    }
}

/*
    Takes array of indeces and kills the balls that filled it if more than 3
*/
function killBalls(matchesArray) {
    "use strict";
    var uniqueMatches, sortedMatches, i, isMiddlePath, killBall, didMatch, tempSlamToIndex, slamToIndex;

    // remove duplicates
    uniqueMatches = matchesArray.filter(function (item, pos, self) {
        return matchesArray.indexOf(item) === pos;
    });
    // sort
    sortedMatches = uniqueMatches.sort(function (a, b) {
        return a - b;
    });

    // clear array
    matches = [];

    slamToIndex = 0;

    // need to readjust the indeces to remove the correct balls once the indeces change from removing from ballgroup
    if (sortedMatches.length >= 3) {
        slamToIndex = ballGroup.length - 1;

        sortedMatches.forEach(function (ball) {
            tempSlamToIndex = ballGroup.getIndex(ball);
            if (tempSlamToIndex < slamToIndex) {
                slamToIndex = tempSlamToIndex;
            }

            ballGroup.remove(ball);
            ball.kill();

            score += pointsPerBallCurrent;

        });

        slamToIndex -= 1;
        // stop any balls being checkable
        ballGroup.setAll('canMatch', false);

        console.log("match slamIndex " + slamToIndex);
        if (slamToIndex > -1) {
            slamBackToBall = ballGroup.getAt(slamToIndex);
            slamBackToBall.canMatch = true;
        } else {
            slamBackToBall = anchorBall;
        }

        // make balls touch/nearly touch to slam back (could be used to slow secondary kills using that collision)
        return slamBackToBall;
    }
}

/*
    When ball sections "kill" it leaves a gap. This function pulls the balls ahead of the kill zone back toward the beginning of the gap.
*/
function slamBack(slamBackToBall) {
    "use strict";
    if (slamBackToBall === null) {
        return slamBackToBall;
    }

    if (isLastBall(slamBackToBall)) { //slamIndex > (ballGroup.length - 2)) { // at last ball, stop
        slamBackToBall = null;
        return slamBackToBall;
    }

    var i, slamToIndex, slamBackLeft, slamBackRight; //, stbIndex;

    if (slamBackToBall === anchorBall) {
        slamBackLeft = anchorBall;
        slamBackRight = ballGroup.getAt(0);
        if (game.physics.arcade.overlap(slamBackLeft, slamBackRight)) {
            // check if the slamBacks trigger another kill
            // *exclude the start and end of path as they cannot make a sandwich (i.e, check if slamBackToBall is in the middle)
            // check for matches once then move up the path slaming every ball to tighten
            slamBackToBall = slamBackRight;
            slamToIndex = ballGroup.getIndex(slamBackToBall);
            return slamBackToBall;
        } else { // if it has yet to overlap AND a kill triggered the slam, keep moving all balls backward on path
            moveSingleBall(slamBackRight, -1);
            return slamBackToBall;
        }

    }
    // slamBack to fill gaps
    if (isSlammableBall(slamBackToBall)) { // error if it tries to go back to a -1 index
        // overlap means the balls met and gap filled, end the slamBack method
        slamToIndex = ballGroup.getIndex(slamBackToBall);
        slamBackLeft = slamBackToBall; //ballGroup.getAt(slamBackToBallIndex - 1);
        slamBackRight = ballGroup.getAt(slamToIndex + 1);
        if (game.physics.arcade.overlap(slamBackLeft, slamBackRight)) {
            // check if the slamBacks trigger another kill
            // *exclude the start and end of path as they cannot make a sandwich (i.e, check if slamBackToBall is in the middle)
            // check for matches once then move up the path slaming every ball to tighten
            slamBackToBall = slamBackRight;

            if (slamBackLeft.canMatch) {
                // Start recursive check of two balls if they match
                if (slamBackLeft.frame === slamBackRight.frame) {
                    // check matches and kill 3-ball matches
                    slamBackRight.canMatch = true;
                    matches = [];
                    matches.push(slamBackLeft);
                    matches.push(slamBackRight);
                    recursiveSlamBallCheck(matches);
                    slamBackToBall = killBalls(matches);
                }
            }

            slamToIndex = ballGroup.getIndex(slamBackToBall);
            return slamBackToBall;
            // increase slam index, will tighten path
        }　else { // if it has yet to overlap AND a kill triggered the slam, keep moving all balls backward on path
            moveSingleBall(slamBackRight, -1);
            return slamBackToBall;
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
    if (checkTimeMS - lastMoveMS >= movementSpeedMS) {//} && isMoveComplete && isInsertEnded) {
        // This needs to push the firstmostbal out (and trigger full spiral movement) until it passes the starting line then another ball takes its place
        lastMoveMS = checkTimeMS;
        // if it is still touching the anchor ball (aka behind the starting line), continue moving; otherwise, insert a new ball
        if (game.physics.arcade.overlap(leadingBall, anchorBall)) {
            // trailing ball; use to push up the rest
            moveSingleBall(trailingBall, 1);
        } else {
            newBall =  createBall(TYPE_BALL_PATH, path[0].x, path[0].y, null);
            // take care of slamback error with twitch
            if (slamBackToBallIndex > 0) {
                slamBackToBallIndex += 1;
            }
        }
        canMovePath = false;
    }

}

function isFirstBall(ball) {
    "use strict";
    if (ballGroup.getIndex(ball) === 0) {
        return true;
    } else {
        return false;
    }
}

function isLastBall(ball) {
    "use strict";
    if (ballGroup.getIndex(ball) === ballGroup.length - 1) {
        return true;
    } else {
        return false;
    }
}

function isSlammableBall(ball) {
    "use strict";
    if (ballGroup.getIndex(ball) > -1 && ballGroup.getIndex(ball) < ballGroup.length - 1) {
        return true;
    } else {
        return false;
    }
}

function moveSingleBall(ball, spiralChange) {
    "use strict";
    var i, movingBall;

    if (ball.spiralIndex + spiralChange > path.length) {
        ball.kill();
        isGameOver = true;
        return;
    } else if (ball.spiralIndex + spiralChange < 0) {
        return;
    }

    for (i = ballGroup.getIndex(ball); i < ballGroup.length; i += 1) {
        movingBall = ballGroup.getAt(i);
        movingBall.spiralIndex = movingBall.spiralIndex + spiralChange;
        movingBall.x = path[movingBall.spiralIndex].x;
        movingBall.y = path[movingBall.spiralIndex].y;
    }
}

function createBall(type, x, y, spiralIndex) {
    "use strict";
    var ball, radius;
    ball = game.add.sprite(-100, -100, 'bullets', game.rnd.between(0, FRAME_BALL_TYPE_MAX - 1));
    game.physics.arcade.enable(ball);
    ball.scale.setTo(radiusScaled / radiusSpriteSheet, radiusScaled / radiusSpriteSheet);
    ball.body.allowRotation = false;
    ball.enableBody = true;
    ball.checkWorldBounds = true;
    ball.outOfBoundsKill = true;
    ball.canMatch = false;
    radius = ball.width / 2;
    ball.body.setCircle(radius * (radiusSpriteSheet / radiusScaled));
    ball.anchor.set(0.5);

    if (type === TYPE_BALL_BULLET) {
        ball.canMatch = true;
        ball.x = centerX;
        ball.y = centerY;
    } else if (type === TYPE_BALL_ANCHOR) {
        ball.frame = FRAME_ANCHOR;
        ball.x = x;
        ball.y = y;
    } else {
        // Keep for testing; normally, all balls should start at index 0
        if (type === TYPE_BALL_PATH && spiralIndex === null) {
            spiralIndex = 0;
        }
        ballGroup.addAt(ball, 0, false);
        ball.spiralIndex = spiralIndex;
        ball.canMatch = false;
        moveSingleBall(ball, 0);
    }
    return ball;
}

function checkBullet() {
    "use strict";
    // Ready a new bullet once the other is either out of the screen or added to the ball group
    if (!bullet.alive || ballGroup.contains(bullet)) {
        bullet = createBall(TYPE_BALL_BULLET);
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
    var gameOverText;
    gameOverText = game.add.text(game.width / 2, game.height * 0.25, 'GAME OVER!', {font: '30px Arial', fill: '#fff'});
    gameOverText.anchor.setTo(0.5, 0.5);

    game.paused = true;
}
function render() {
    "use strict";
    var text = game.add.text(radiusScaled * 2, radiusScaled * 2, 'Level: ' + currentLevel + ' | Score: ' + score + '| Next Level at: ' + nextLevelThreshold, { fontSize: '64px', fill: '#fff'});
    if (debug) {
        ballGroup.forEach(function (ball) {
            game.debug.body(ball);
        });
    }
}
