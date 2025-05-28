// 赤い立方体の状態管理
window.redCubeState = {
  cubes: [], // 立方体の配列
  spawnCount: 4, // 一度に生成する立方体の数
  minSize: 20, // 最小サイズ
  maxSize: 50, // 最大サイズ
  color: [255, 50, 50, 200], // 立方体の色（赤系）
  isEnabled: false, // アニメーションの有効/無効
  driftSpeed: 0.02, // 漂う速度
  driftRange: 100, // 漂う範囲
  spawnRange: 500, // 出現範囲
};

// 赤い立方体クラス
class RedCube {
  constructor() {
    this.reset();
  }

  reset() {
    // ランダムな初期位置（範囲を広げる）
    this.position = {
      x: random(
        -window.redCubeState.spawnRange,
        window.redCubeState.spawnRange
      ),
      y: random(
        -window.redCubeState.spawnRange,
        window.redCubeState.spawnRange
      ),
      z: random(
        -window.redCubeState.spawnRange,
        window.redCubeState.spawnRange
      ),
    };
    // ランダムな初期回転
    this.rotation = {
      x: random(TWO_PI),
      y: random(TWO_PI),
      z: random(TWO_PI),
    };
    // ランダムな回転速度
    this.rotationSpeed = {
      x: random(-0.02, 0.02),
      y: random(-0.02, 0.02),
      z: random(-0.02, 0.02),
    };
    // ランダムなサイズ
    this.size = random(
      window.redCubeState.minSize,
      window.redCubeState.maxSize
    );
    // 漂う動きのための変数
    this.driftOffset = {
      x: random(TWO_PI),
      y: random(TWO_PI),
      z: random(TWO_PI),
    };
  }

  update() {
    // 回転を更新
    this.rotation.x += this.rotationSpeed.x;
    this.rotation.y += this.rotationSpeed.y;
    this.rotation.z += this.rotationSpeed.z;

    // 漂う動きを更新
    let t = frameCount * window.redCubeState.driftSpeed;
    this.position.x += sin(t + this.driftOffset.x) * 0.5;
    this.position.y += sin(t + this.driftOffset.y) * 0.5;
    this.position.z += sin(t + this.driftOffset.z) * 0.5;
  }

  draw() {
    push();
    // 位置を移動
    translate(this.position.x, this.position.y, this.position.z);

    // 回転を適用
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);

    // 色の設定
    stroke(
      window.redCubeState.color[0],
      window.redCubeState.color[1],
      window.redCubeState.color[2],
      window.redCubeState.color[3]
    );
    strokeWeight(2);
    noFill();

    // 立方体を描画
    box(this.size);
    pop();
  }
}

// 赤い立方体の描画
function drawRedCubes() {
  if (!window.redCubeState.isEnabled) return;

  // すべての立方体を更新して描画
  for (let cube of window.redCubeState.cubes) {
    cube.update();
    cube.draw();
  }
}

// 赤い立方体の生成
window.spawnRedCubes = function () {
  window.redCubeState.isEnabled = true;
  // 指定された数の立方体を生成
  for (let i = 0; i < window.redCubeState.spawnCount; i++) {
    window.redCubeState.cubes.push(new RedCube());
  }
};

// 赤い立方体のクリア
window.clearRedCubes = function () {
  window.redCubeState.cubes = [];
  window.redCubeState.isEnabled = false;
};
