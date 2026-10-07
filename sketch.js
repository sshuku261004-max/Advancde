let mode = 0;
let playerX;
let playerY;
let playerRadius;
let bubbleX;
let bubbleY;
let bubbleRadius;
let bubbleSpeedX;
let bubbleSpeedY;

function setup() {
    createCanvas(500, 500);

    playerX = width / 2;
    playerY = height / 2;
    playerRadius = 15;

    // シャボン玉の位置・半径をランダムに決める
    bubbleX = [];
    bubbleY = [];
    bubbleRadius = [];
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
        bubbleRadius.push(random(20, 40));
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
        text("スペースキーでスタート", width / 2, height / 2 + 30);
    }

    if (mode == 1) {
        // プレイヤーをキーボードで動かす (02)

        // シャボン玉を等速で動かし、画面の外に出たら反対側から出てくる (03)

        // シャボン玉に触れたらゲームオーバー (04)

        // プレイヤーを表示する
        fill(255, 100, 150);
        noStroke();
        circle(playerX, playerY, playerRadius * 2);

        // シャボン玉を表示する
        noFill();
        stroke(255);
        strokeWeight(2);
        for (let i = 0; i < bubbleX.length; i++) {
            circle(bubbleX[i], bubbleY[i], bubbleRadius[i] * 2);
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

function keyPressed() {
    if (key == " ") {
        if (mode == 0) {
            // 変数を初期化してプレイ画面へ
            setup();
            mode = 1;
        }
        if (mode == 2) {
            // スタート画面に戻る
            mode = 0;
        }
    }
}
