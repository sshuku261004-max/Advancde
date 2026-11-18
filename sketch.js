let mode = 0;
let playerColor = "red";
let gameDifficulty = "easy";
let gameStartTime;
let itemX;
let itemY;
let itemSize = 20;
let itemAvailable;
let bubbleRestoreAt = null;
let playerRestoreAt = null;
let itemRespawnAt = null;
let invulnerableUntil = 0;
let activeEffectText = "";
let activeEffectUntil = 0;
let stage = 1;
let stageIntroStartTime = 0;
let movementKeys = {};
let movementListenersRegistered = false;
let playerX;
let playerY;
let playerRadius;
let playerOriginalRadius;
let bubbleX;
let bubbleY;
let bubbleRadius;
let bubbleOriginalRadius;
let bubbleDangerous;
let bubbleSpeedX;
let bubbleSpeedY;
const stageTwoObstacles = [
    { x: 105, y: 130, width: 38, height: 130 },
    { x: 350, y: 250, width: 38, height: 130 }
];

function setup() {
    createCanvas(500, 500);

    movementKeys = {};
    if (!movementListenersRegistered) {
        window.addEventListener("keydown", handleMovementKeyDown);
        window.addEventListener("keyup", handleMovementKeyUp);
        window.addEventListener("blur", clearMovementKeys);
        document.addEventListener("visibilitychange", clearMovementKeysWhenHidden);
        movementListenersRegistered = true;
    }
    stage = 1;
    stageIntroStartTime = 0;
    playerX = width / 2;
    playerY = height / 2;
    playerOriginalRadius = 15;
    playerRadius = playerOriginalRadius;

    itemAvailable = gameDifficulty != "normal";
    if (itemAvailable) {
        placeItem();
    }
    bubbleRestoreAt = null;
    playerRestoreAt = null;
    itemRespawnAt = null;
    invulnerableUntil = 0;
    activeEffectText = "";
    activeEffectUntil = 0;

    createBubbles();
}

function createBubbles() {
    bubbleX = [];
    bubbleY = [];
    bubbleRadius = [];
    bubbleOriginalRadius = [];
    bubbleDangerous = [];
    bubbleSpeedX = [];
    bubbleSpeedY = [];
    for (let i = 0; i < 10; i++) {
        // プレイヤーから少し離れた位置に出す
        let x = random(0, width);
        let y = random(0, height);
        while (dist(x, y, playerX, playerY) < 100) {
            x = random(0, width);
            y = random(0, height);
        }
        bubbleX.push(x);
        bubbleY.push(y);
        let radius = random(20, 40);
        bubbleRadius.push(radius);
        bubbleOriginalRadius.push(radius);
        bubbleDangerous.push(false);
        bubbleSpeedX.push(random(-2, 2));
        bubbleSpeedY.push(random(-2, 2));
    }
}

function draw() {
    background(180, 220, 255);

    if (mode == 0) {
        // スタート画面の表示
        fill(0);
        textAlign(CENTER);
        text("シャボン玉に触れないように逃げよう", width / 2, height / 2 - 40);
        text("矢印キーで移動", width / 2, height / 2 - 10);
        text("R: 赤 / B: 青 (選択中: " + (playerColor == "red" ? "赤" : "青") + ")", width / 2, height / 2 + 20);
        text("1: イージー (速度変化なし・アイテムあり)", width / 2, height / 2 + 50);
        text("2: 普通 (速度変化なし・アイテムなし)", width / 2, height / 2 + 70);
        text("3: スーパー (2秒加速・13秒通常・アイテムあり)", width / 2, height / 2 + 90);
        text("4: ハード (常時加速・アイテムあり)", width / 2, height / 2 + 110);
        let difficultyName = { easy: "イージー", normal: "普通", super: "スーパー", hard: "ハード" }[gameDifficulty];
        text("選択中: " + difficultyName, width / 2, height / 2 + 135);
        text("スペースキーでスタート", width / 2, height / 2 + 160);
    }

    if (mode == 1) {
        let currentTime = millis();
        let elapsedTime = currentTime - gameStartTime;
        if (stage == 1 && elapsedTime >= 60000) {
            stage = 2;
            stageIntroStartTime = currentTime;
            mode = 3;
            return;
        }
        let speedMultiplier = 1;
        if (gameDifficulty == "super" && elapsedTime % 15000 < 2000) {
            speedMultiplier = 1.5;
        } else if (gameDifficulty == "hard") {
            speedMultiplier = 2;
        }

        if (invulnerableUntil > 0 && currentTime >= invulnerableUntil) {
            invulnerableUntil = 0;
            for (let i = 0; i < bubbleDangerous.length; i++) {
                bubbleDangerous[i] = false;
            }
        }

        if (bubbleRestoreAt !== null && currentTime >= bubbleRestoreAt) {
            for (let i = 0; i < bubbleRadius.length; i++) {
                bubbleRadius[i] = bubbleOriginalRadius[i];
            }
            bubbleRestoreAt = null;
        }
        if (playerRestoreAt !== null && currentTime >= playerRestoreAt) {
            playerRadius = playerOriginalRadius;
            playerRestoreAt = null;
        }
        if (activeEffectText != "" && currentTime >= activeEffectUntil) {
            activeEffectText = "";
        }
        if (itemRespawnAt !== null && currentTime >= itemRespawnAt) {
            placeItem();
            itemAvailable = true;
            itemRespawnAt = null;
        }

        // プレイヤーをキーボードで動かす (02)
        let nextX = playerX;
        let nextY = playerY;
        if (movementKeys.ArrowLeft) {
            nextX -= 5;
        }
        if (movementKeys.ArrowRight) {
            nextX += 5;
        }
        if (movementKeys.ArrowUp) {
            nextY -= 5;
        }
        if (movementKeys.ArrowDown) {
            nextY += 5;
        }
        nextX = constrain(nextX, playerRadius, width - playerRadius);
        nextY = constrain(nextY, playerRadius, height - playerRadius);

        if (stage != 2 || !overlapsStageTwoObstacle(nextX, playerY)) {
            playerX = nextX;
        }
        if (stage != 2 || !overlapsStageTwoObstacle(playerX, nextY)) {
            playerY = nextY;
        }

        // シャボン玉を等速で動かし、画面の外に出たら反対側から出てくる (03)
    for(let i = 0; i < bubbleX.length; i++){
        bubbleX[i] = bubbleX[i] + bubbleSpeedX[i] * speedMultiplier;
        bubbleY[i] = bubbleY[i] + bubbleSpeedY[i] * speedMultiplier;

        if(bubbleX[i]<0) {
            bubbleX[i] = width;
        }
        if(bubbleX[i]>width) {
            bubbleX[i] = 0;
        }
        if(bubbleY[i]<0) {
            bubbleY[i] = height
        }
        if(bubbleY[i]>height) {
            bubbleY[i] = 0;
        }
    } 
        // アイテムを取るとシャボン玉が小さくなる
        if (itemAvailable) {
            let closestX = constrain(playerX, itemX, itemX + itemSize);
            let closestY = constrain(playerY, itemY, itemY + itemSize);
            let itemTouched = dist(playerX, playerY, closestX, closestY) < playerRadius;
            if (itemTouched) {
                itemAvailable = false;
                itemRespawnAt = currentTime + 20000;

                let effect = floor(random(3));
                if (effect == 0) {
                    for (let i = 0; i < bubbleRadius.length; i++) {
                        bubbleRadius[i] = max(8, bubbleOriginalRadius[i] * 0.7);
                    }
                    bubbleRestoreAt = currentTime + 25000;
                    activeEffectText = "シャボン玉縮小中";
                    activeEffectUntil = bubbleRestoreAt;
                } else if (effect == 1) {
                    playerRadius = playerOriginalRadius * 0.7;
                    playerRestoreAt = currentTime + 15000;
                    activeEffectText = "プレイヤー縮小中";
                    activeEffectUntil = playerRestoreAt;
                } else {
                    invulnerableUntil = currentTime + 10000;
                    activeEffectText = "無敵中";
                    activeEffectUntil = invulnerableUntil;
                    for (let i = 0; i < bubbleDangerous.length; i++) {
                        bubbleDangerous[i] = random(20) < 1;
                    }
                }
            }
        }

        // シャボン玉に触れたらゲームオーバー (04)
        for(let i=0; i< bubbleX.length; i++){
            if (dist(playerX, playerY, bubbleX[i], bubbleY[i]) < playerRadius + bubbleRadius[i]) {
                if (bubbleDangerous[i] || currentTime >= invulnerableUntil) {
                    mode = 2;
                }
            }
        }

        // アイテムを表示する
        if (itemAvailable) {
            fill(255, 220, 0);
            noStroke();
            rect(itemX, itemY, itemSize, itemSize);
        }

        // プレイヤーを表示する
        if (playerColor == "red") {
            fill(255, 0, 0);
        } else {
            fill(0, 0, 255);
        }
        noStroke();
        circle(playerX, playerY, playerRadius * 2);

        // シャボン玉を表示する
        noFill();
        strokeWeight(2);
        for (let i = 0; i < bubbleX.length; i++) {
            if (bubbleDangerous[i]) {
                stroke(0, 200, 0);
            } else {
                stroke(255);
            }
            circle(bubbleX[i], bubbleY[i], bubbleRadius[i] * 2);
        }

        if (stage == 2) {
            fill(80);
            noStroke();
            for (const obstacle of stageTwoObstacles) {
                rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        }

        if (speedMultiplier > 1) {
            fill(0);
            noStroke();
            textAlign(CENTER);
            text("スピードアップ中!", width / 2, 30);
        }
        if (activeEffectText != "") {
            fill(0);
            noStroke();
            textAlign(CENTER);
            text(activeEffectText, width / 2, 55);
        }
        if (bubbleDangerous.some(isDangerous => isDangerous)) {
            fill(0);
            noStroke();
            textAlign(CENTER);
            text("接近中！", width / 2, 80);
        }
    }

    if (mode == 2) {
        // 終了画面の表示
        fill(0);
        noStroke();
        textAlign(CENTER);
        text("ゲームオーバー", width / 2, height / 2 - 20);
        text("スペースキーでスタート画面に戻る", width / 2, height / 2 + 20);
    }

    if (mode == 3) {
        let introElapsed = millis() - stageIntroStartTime;
        let introProgress = constrain(introElapsed / 2000, 0, 1);
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(lerp(130, 32, introProgress));
        text("STAGE2", width / 2, height / 2);
        textSize(12);

        if (introElapsed >= 2000) {
            mode = 1;
            gameStartTime = millis();
            clearMovementKeys();
            playerX = width / 2;
            playerY = height / 2;
            for (let i = 0; i < bubbleX.length; i++) {
                if (dist(playerX, playerY, bubbleX[i], bubbleY[i]) < playerRadius + bubbleRadius[i]) {
                    let x = random(0, width);
                    let y = random(0, height);
                    while (dist(x, y, playerX, playerY) < 100) {
                        x = random(0, width);
                        y = random(0, height);
                    }
                    bubbleX[i] = x;
                    bubbleY[i] = y;
                }
            }
        }
    }
}

function placeItem() {
    itemX = random(itemSize, width - itemSize * 2);
    itemY = random(itemSize, height - itemSize * 2);
    while (dist(itemX + itemSize / 2, itemY + itemSize / 2, playerX, playerY) < 100) {
        itemX = random(itemSize, width - itemSize * 2);
        itemY = random(itemSize, height - itemSize * 2);
    }
}

function overlapsStageTwoObstacle(x, y) {
    for (const obstacle of stageTwoObstacles) {
        let closestX = constrain(x, obstacle.x, obstacle.x + obstacle.width);
        let closestY = constrain(y, obstacle.y, obstacle.y + obstacle.height);
        if (dist(x, y, closestX, closestY) < playerRadius) {
            return true;
        }
    }
    return false;
}

function clearMovementKeys() {
    movementKeys = {};
}

function handleMovementKeyDown(event) {
    if (!event.code.startsWith("Arrow")) {
        return;
    }

    event.preventDefault();
    if (mode == 1) {
        movementKeys[event.code] = true;
    }
}

function handleMovementKeyUp(event) {
    if (event.code.startsWith("Arrow")) {
        delete movementKeys[event.code];
        event.preventDefault();
    }
}

function clearMovementKeysWhenHidden() {
    if (document.hidden) {
        clearMovementKeys();
    }
}

function keyPressed() {
    if (mode == 0 && key == "1") {
        gameDifficulty = "easy";
    }
    if (mode == 0 && key == "2") {
        gameDifficulty = "normal";
    }
    if (mode == 0 && key == "3") {
        gameDifficulty = "super";
    }
    if (mode == 0 && key == "4") {
        gameDifficulty = "hard";
    }
    if (mode == 0 && (key == "r" || key == "R")) {
        playerColor = "red";
    }
    if (mode == 0 && (key == "b" || key == "B")) {
        playerColor = "blue";
    }

    if (key == " ") {
        if (mode == 0) {
            // 変数を初期化してプレイ画面へ
            setup();
            mode = 1;
            gameStartTime = millis();
        }
        if (mode == 2) {
            // スタート画面に戻る
            mode = 0;
        }
    }

}
