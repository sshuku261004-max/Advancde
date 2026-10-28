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

function setup() {
    createCanvas(500, 500);

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

    // シャボン玉の位置・半径をランダムに決める
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
        text("3: スーパー (3秒加速・12秒通常・アイテムあり)", width / 2, height / 2 + 90);
        text("4: ハード (常時加速・アイテムあり)", width / 2, height / 2 + 110);
        let difficultyName = { easy: "イージー", normal: "普通", super: "スーパー", hard: "ハード" }[gameDifficulty];
        text("選択中: " + difficultyName, width / 2, height / 2 + 135);
        text("スペースキーでスタート", width / 2, height / 2 + 160);
    }

    if (mode == 1) {
        let currentTime = millis();
        let elapsedTime = currentTime - gameStartTime;
        let speedMultiplier = 1;
        if (gameDifficulty == "super" && elapsedTime % 15000 < 3000) {
            speedMultiplier = 2;
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
        if(keyIsDown(LEFT_ARROW)){
            playerX = playerX - 5;
        }
        if(keyIsDown(RIGHT_ARROW)){
            playerX = playerX + 5;
        }  
        if(keyIsDown(UP_ARROW)){
            playerY = playerY - 5;
        }
        if(keyIsDown(DOWN_ARROW)){
            playerY = playerY + 5
        }
        playerX = constrain(playerX, playerRadius, width - playerRadius);
        playerY = constrain(playerY, playerRadius, height - playerRadius);

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
            if (dist(playerX, playerY, closestX, closestY) < playerRadius) {
                let effect = floor(random(3));
                itemAvailable = false;

                if (effect == 0) {
                    for (let i = 0; i < bubbleRadius.length; i++) {
                        bubbleRadius[i] = max(8, bubbleOriginalRadius[i] * 0.7);
                    }
                    bubbleRestoreAt = currentTime + 25000;
                    itemRespawnAt = bubbleRestoreAt + 60000;
                    activeEffectText = "シャボン玉縮小中";
                    activeEffectUntil = bubbleRestoreAt;
                } else if (effect == 1) {
                    playerRadius = playerOriginalRadius * 0.7;
                    playerRestoreAt = currentTime + 15000;
                    itemRespawnAt = playerRestoreAt + 60000;
                    activeEffectText = "プレイヤー縮小中";
                    activeEffectUntil = playerRestoreAt;
                } else {
                    invulnerableUntil = currentTime + 10000;
                    itemRespawnAt = invulnerableUntil + 60000;
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

        if (speedMultiplier == 2) {
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
}

function placeItem() {
    itemX = random(itemSize, width - itemSize * 2);
    itemY = random(itemSize, height - itemSize * 2);
    while (dist(itemX + itemSize / 2, itemY + itemSize / 2, playerX, playerY) < 100) {
        itemX = random(itemSize, width - itemSize * 2);
        itemY = random(itemSize, height - itemSize * 2);
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
