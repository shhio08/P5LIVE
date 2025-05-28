// 立方体アニメーションの状態管理
window.cubeState = {
  cubes: [], // 立方体の配列
  maxCubes: 15, // 最大立方体数
  minSize: 5, // 最小サイズ
  maxSize: 2000, // 最大サイズ
  growthSpeed: 1.5, // 成長速度
  rotationSpeed: 0.02, // 回転速度
  color: [100, 150, 255, 150], // 立方体の色
  isEnabled: false, // アニメーションの有効/無効
  spawnInterval: 1300, // 立方体生成の間隔（ミリ秒）
  lastSpawnTime: 0, // 最後に立方体を生成した時間
  isFrozen: false, // 生成と成長を停止するフラグ
  isExploding: false, // 爆発中フラグ
  explosionStartTime: 0, // 爆発開始時間
  explosionDuration: 2000, // 爆発の持続時間（ミリ秒）
  explosionSpeed: 0.1, // 爆発の速度
  explosionColor: [255, 100, 100, 200], // 爆発時の色（赤系）
};

// 立方体クラス
class Cube {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = window.cubeState.minSize;
    this.rotation = {
      x: random(TWO_PI),
      y: random(TWO_PI),
      z: random(TWO_PI),
    };
    this.rotationSpeed = {
      x: random(-0.02, 0.02),
      y: random(-0.02, 0.02),
      z: random(-0.02, 0.02),
    };
    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  update() {
    if (window.cubeState.isExploding) {
      // 爆発中の処理
      let progress =
        (millis() - window.cubeState.explosionStartTime) /
        window.cubeState.explosionDuration;
      if (progress < 1) {
        // 爆発の進行に応じて速度を更新
        this.velocity.x += random(-0.5, 0.5) * window.cubeState.explosionSpeed;
        this.velocity.y += random(-0.5, 0.5) * window.cubeState.explosionSpeed;
        this.velocity.z += random(-0.5, 0.5) * window.cubeState.explosionSpeed;

        // 位置を更新
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // サイズを徐々に小さく
        this.size *= 0.99;
      }
    } else if (!window.cubeState.isFrozen) {
      // 通常の成長処理
      this.size += window.cubeState.growthSpeed;
      if (this.size >= window.cubeState.maxSize) {
        this.reset();
      }
    }

    // 回転は常に更新
    this.rotation.x += this.rotationSpeed.x;
    this.rotation.y += this.rotationSpeed.y;
    this.rotation.z += this.rotationSpeed.z;
  }

  draw() {
    push();
    // 爆発中は位置を移動
    if (window.cubeState.isExploding) {
      translate(this.position.x, this.position.y, this.position.z);
    }

    // 透明度をサイズに応じて調整
    let alpha = map(
      this.size,
      window.cubeState.minSize,
      window.cubeState.maxSize,
      255,
      50
    );

    // 色の設定
    if (window.cubeState.isExploding) {
      // 爆発中は赤系の色
      stroke(
        window.cubeState.explosionColor[0],
        window.cubeState.explosionColor[1],
        window.cubeState.explosionColor[2],
        alpha
      );
    } else {
      // 通常時は青系の色
      stroke(
        window.cubeState.color[0],
        window.cubeState.color[1],
        window.cubeState.color[2],
        alpha
      );
    }

    strokeWeight(1);
    noFill();

    // 回転を適用
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);

    // 立方体を描画
    box(this.size);
    pop();
  }
}

// 立方体アニメーションの描画
function drawCubeAnimation() {
  if (!window.cubeState.isEnabled) return;

  // 爆発中でない場合のみ新しい立方体を生成
  if (
    !window.cubeState.isExploding &&
    !window.cubeState.isFrozen &&
    window.cubeState.cubes.length < window.cubeState.maxCubes
  ) {
    let currentTime = millis();
    if (
      currentTime - window.cubeState.lastSpawnTime >
      window.cubeState.spawnInterval
    ) {
      window.cubeState.cubes.push(new Cube());
      window.cubeState.lastSpawnTime = currentTime;
    }
  }

  push();
  // 中心に配置
  translate(0, 0, 0);

  // すべての立方体を更新して描画
  for (let cube of window.cubeState.cubes) {
    cube.update();
    cube.draw();
  }
  pop();
}

// 立方体アニメーションの有効/無効を切り替え
window.toggleCubeAnimation = function (enable) {
  window.cubeState.isEnabled = enable;
  if (enable) {
    // 有効化時に立方体をクリア
    window.cubeState.cubes = [];
    window.cubeState.lastSpawnTime = millis();
    window.cubeState.isFrozen = false;
    window.cubeState.isExploding = false;
  }
};

// 立方体の生成と成長を停止/再開
window.toggleCubeFreeze = function () {
  window.cubeState.isFrozen = !window.cubeState.isFrozen;
};

// 立方体の爆発を開始
window.startCubeExplosion = function () {
  window.cubeState.isExploding = true;
  window.cubeState.explosionStartTime = millis();
  // 爆発時の色を設定（赤系）
  window.cubeState.explosionColor = [255, 100, 100, 200];
};
