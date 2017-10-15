// This project recreates Hitomi's favorite game.

/* !! There should always be an invisible anchor ball at the 0 index to slam back and all new balls should be inserted at index 1
*/

// define all functions, avoid JLint errors
var Phaser, preload, create, update, render, createSpiralPath, recursiveSpiral, movingSpiral,
    update, collisionHandlerBullets, collisionHandlerSpiralBalls, fire, changeLevel, getCurrentLevel,
    moveBallPath, render, console, recursiveSpiralInsert, recursiveBallCheck, killBalls, isMoveComplete,
    slamBack, slamBackToBallIndex, tightenPath, moveSingleBall;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    "use strict";
    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.image('bullet', 'assets/sprites/purple_ball.png');
    game.load.image('ballType01', 'assets/sprites/blue_ball.png');
    game.load.spritesheet('bullets', 'assets/sprites/balls.png', 17, 17);
}

var sprite,
    ballOnPath,
    path = [],              // Holds all points on the spiral in numerical order until I figure out the equation
    bullet,
    anchorBall,
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
    pathSpacer = 16,
    lastTightenMS = 0,
    tightenIndex = 0,
    tightenComplete = true,
    gameOver = false;

function create() {
    "use strict";
    var spiralTestBall, i, pathBall;
    centerX = game.world.centerX;
    centerY = game.world.centerY;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#313131';


    // Bullet
    bullet = game.add.sprite(400, 300, 'bullets', game.rnd.between(3, 5));
    bullet.anchor.set(0.5);
    game.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.immovable = true;
    bullet.body.allowRotation = false;
    bullet.enableBody = true;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;


    // Balls
    ballGroup = game.add.physicsGroup();

    createSpiralPath();

    // draw the balls along the path, leave room at end for pushing
    // anchor ball
    // Bullet
    anchorBall = game.add.sprite(path[pathSpacer].x, path[pathSpacer].y, 'bullets', 0);
    anchorBall.anchor.set(0.5);
    game.physics.enable(anchorBall, Phaser.Physics.ARCADE);
    anchorBall.body.immovable = true;
    anchorBall.body.allowRotation = false;
    anchorBall.enableBody = true;
    anchorBall.checkWorldBounds = true;
    anchorBall.outOfBoundsKill = true;

//    pathBall = game.add.sprite(path[0].x, path[0].y, 'bullets', 0, ballGroup);
//    pathBall.spiralIndex = i;
//    pathBall.anchor.set(0.5);
    // set ball group characteristics
    ballGroup.enableBody = true;
    ballGroup.physicsBodyType = Phaser.Physics.ARCADE;
    ballGroup.setAll('body.immovable', true);
    ballGroup.setAll('body.allowRotation', true);
    ballGroup.setAll('enableBody', true);
    ballGroup.setAll('checkWorldBounds', true);
    ballGroup.setAll('outOfBoundsKill', true);

    for (i = 0; i < path.length / 2; i += pathSpacer) {
        pathBall = game.add.sprite(path[i].x, path[i].y, 'bullets', game.rnd.between(3, 5), ballGroup);
        pathBall.spiralIndex = i;
        pathBall.anchor.set(0.5);
    }



}

function createSpiralPath() {
    "use strict";
    var theta, radius = 200, point = {    };

    for (theta = 0; theta <= 1000; theta += 1) {
        point.x = centerX + (radius * Math.cos(2 * Math.PI * theta / 1000));
        point.y = centerY + (radius * Math.sin(2 * Math.PI * theta / 1000));
        path[path.length] = point;
        point = [];
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

/*
    Update occurs as often as the frames allow and enables the steady change of sprites on the screen. This update moves balls along the spiral path during every repaint() and facilitates kills/movement in a streaming fashion
*/
function update() {
    "use strict";
    // Command to fire a bullet
    if (game.input.activePointer.isDown) {
        fire();
    }

    // Trigger collision handlers for balls that reach the path
    if (game.physics.arcade.overlap(ballGroup, bullet, collisionHandlerBullets)) {
        isInsertEnded = false;
    }

    /*
        To allow all movement to finish before checking matches, isMoveComplete
    */
    if (game.physics.arcade.overlap(ballGroup, ballGroup, collisionHandlerSpiralBalls)) {
        isMoveComplete = false;
    } else {
        isMoveComplete = true;
    }

    if (isMoveComplete && !isInsertEnded) {
        // check matches and kill 3-ball matches
        recursiveBallCheck(ballGroup.getAt(matches[0]), matches);
        killBalls(matches);

        // stop any balls being checkable
        ballGroup.setAll('canMatch', false);

        isInsertEnded = true;
    }

    // slamBack to fill gaps
    if (slamBackToBallIndex > 0) {
        // overlap means the balls met and gap filled, end the slamBack method
        if (game.physics.arcade.overlap(ballGroup.getAt(slamBackToBallIndex), ballGroup.getAt(slamBackToBallIndex + 1), collisionHandlerSpiralBalls)) {
            // check if the slamBacks trigger another kill
            // check if slamBackToBall is in the middle
            // *exclude the start and end of path as they cannot make a sandwich
            if (slamBackToBallIndex < ballGroup.length - 1) {
                // Start recursive check of two balls if they match
                if (ballGroup.getAt(slamBackToBallIndex).frame === ballGroup.getAt(slamBackToBallIndex + 1).frame) {
                    // check matches and kill 3-ball matches
                    ballGroup.getAt(slamBackToBallIndex).canMatch = true;
                    matches = [];
                    matches.push(slamBackToBallIndex);
                    recursiveBallCheck(ballGroup.getAt(slamBackToBallIndex), matches);
                    killBalls(matches);

                    // stop any balls being checkable
                    ballGroup.setAll('canMatch', false);
                } else {
                    slamBackToBallIndex = 0;
                }
            } else {
                slamBackToBallIndex = 0;
            }
        } else { // if it has yet to overlap AND a kill triggered the slam, keep moving all balls backward on path
            slamBack(slamBackToBallIndex);
        }
    }


    // Ready a new bullet once the other is either out of the screen or added to the ball group
    if (!bullet.alive || ballGroup.contains(bullet)) {
        // Bullet
        bullet = game.add.sprite(centerX, centerY, 'bullets', game.rnd.between(1, 5));
        bullet.anchor.set(0.5);
        game.physics.enable(bullet, Phaser.Physics.ARCADE);
        bullet.body.allowRotation = false;
        bullet.enableBody = true;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
    }

    // move the path based on the game speed
    checkTimeMS = game.time.totalElapsedSeconds() * 1000;
    if (checkTimeMS - lastMoveMS >= 25 && isMoveComplete && isInsertEnded) {
        // This needs to push the firstmostbal out (and trigger full spiral movement) until it passes the starting line then another ball takes its place
        lastMoveMS = checkTimeMS;
        moveBallPath();
//        tightenPath();
    }

    // tighten any remaining gaps
    if (checkTimeMS - lastTightenMS >= 1000 && isMoveComplete && isInsertEnded) {
        // This needs to slam every ball back its nearest
        tightenComplete = false;
        tightenIndex = 2;
        lastTightenMS = checkTimeMS;
    }

    if (!tightenComplete) {
         // overlap means the balls met and gap filled, end the slamBack method
        if (game.physics.arcade.overlap(ballGroup.getAt(tightenIndex), ballGroup.getAt(tightenIndex + 1), collisionHandlerSpiralBalls)) {
            if (tightenIndex > ballGroup.length - 1) {
                tightenComplete = true;
            } else {
                tightenIndex += 1;
            }
        } else { // if it has yet to overlap, keep moving all balls backward on path
            slamBack(tightenIndex);
        }
//        tightenPath();
    }
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
    // add to match array for checking if not already included
    if (matches.indexOf(ballGroup.getIndex(bulletCheck)) < 0) {
        matches.push(ballGroup.getIndex(bulletCheck));
    }

    // add an identifier to the bullet that it is the center of recursive match checks, delete the identifier when complete
    bulletCheck.canMatch = true;
}

/*
    Handles after affects from a bullet collision enabling balls to shift and check whether any 3+ balls match
*/
function collisionHandlerSpiralBalls(ballA, ballB) {
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
//    else if ((rightBall.spiralIndex + 1) < path.length) { // still room on the path, increase by 1 until not colliding
//        rightBall.spiralIndex += 1;
//    } // moved to moveSingleBall else { // kill ball TODO end game
//        rightBall.kill();
//    }
    moveSingleBall(rightBall, 1);
//    // set new position of bullet before sending to function (ought to add that to function...)
//    rightBall.x = path[rightBall.spiralIndex].x;
//    rightBall.y = path[rightBall.spiralIndex].y;

    changeLevel();
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
    var uniqueMatches, sortedMatches, i, isMiddlePath;

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
            ballGroup.getAt(sortedMatches[i] - i).kill();
            ballGroup.remove(ballGroup.getAt(sortedMatches[i] - i));
            score += pointsPerBall;
        }
        // make balls touch/nearly touch to slam back (could be used to slow secondary kills using that collision)
        slamBackToBallIndex = sortedMatches[0] - 1;
    }

    // clear array
    matches = [];

    // ups level if able
    changeLevel();
}

/*
    When ball sections "kill" it leaves a gap. This function pulls the balls ahead of the kill zone back toward the beginning of the gap.
*/
function slamBack(slamIndex) {
    "use strict";
    var i; //, stbIndex;
    // loop through each ball and decrease its index, it will stop during a collide in update()
    for (i = (slamIndex + 1); i < ballGroup.length; i += 1) {
        moveSingleBall(ballGroup.getAt(i), -1);
//        ballGroup.getAt(i).spiralIndex -= 1;
//        ballGroup.getAt(i).x = path[ballGroup.getAt(i).spiralIndex].x;
//        ballGroup.getAt(i).y = path[ballGroup.getAt(i).spiralIndex].y;
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
    // if it is still touching the anchor ball (aka behind the starting line), continue moving; otherwise, insert a new ball
    if (game.physics.arcade.overlap(leadingBall, anchorBall)) {
        // trailing ball; use to push up the rest
        moveSingleBall(trailingBall, 1);
//        trailingBall.spiralIndex += 1;
//        trailingBall.x = path[trailingBall.spiralIndex].x;
//        trailingBall.y = path[trailingBall.spiralIndex].y;
    } else {
        newBall = game.add.sprite(path[0].x, path[0].y, 'bullets', game.rnd.between(3, 5));
        newBall.anchor.set(0.5);
//        newBall = game.add.sprite(790, 390, 'bullets', game.rnd.between(1, 5));
//        newBall.spiralIndex = 0;
        ballGroup.addAt(newBall, 0, false);
        moveSingleBall(newBall, 0);
//        newBall.x = path[newBall.spiralIndex].x;
//        newBall.y = path[newBall.spiralIndex].y;
    }
//    ballGroup.forEach(function (ball) {
//        ball.spiralIndex += 1;
//        // check game end
//        if (ball.spiralIndex >= path.length) {
//            //TODO end game
//        } else if (ballGroup.getIndex(ball) > 0) {
//            ball.x = path[ball.spiralIndex].x;
//            ball.y = path[ball.spiralIndex].y;
//        }
//
//    });
//    ballOnPath.x += 2;
}

function tightenPath() {
    "use strict";
    var ball = ballGroup.getAt(tightenIndex);
    if (tightenIndex < ballGroup.length) {
//        while (!game.physics.arcade.overlap(ball, ballGroup.getAt(tightenIndex - 1))) {
            console.log(tightenIndex);
            moveSingleBall(ball, -1);
//            ball.spiralIndex -= 1;
//            ball.x = path[ball.spiralIndex].x;
//            ball.y = path[ball.spiralIndex].y;
//        }
        tightenIndex += 1;
    } else {
        tightenComplete = true;
    }
}

function moveSingleBall(ball, spiralChange) {
    "use strict";
    if ((ball.spiralIndex + spiralChange > -1) && (ball.spiralIndex + spiralChange < path.length)) {
        ball.spiralIndex = ball.spiralIndex + spiralChange;
        ball.x = path[ball.spiralIndex].x;
        ball.y = path[ball.spiralIndex].y;
    } else if (ball.spiralIndex + spiralChange < 0) {
        ball.spiralIndex = 0;
        ball.x = path[ball.spiralIndex].x;
        ball.y = path[ball.spiralIndex].y;
    } else if (ball.spiralIndex + spiralChange > path.length) {
        ball.kill();
        gameOver = true;
    }
}

function render() {
    "use strict";
    game.debug.text('Level: ' + level + ' | Score: ' + score + '| Next Level at: ' + levelThresholds[level - 1], 32, 64);
}
