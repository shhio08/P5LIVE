// 六角形フレームの状態管理
window.hexagonState = {
  isEnabled: false,
  size: 300,
  color: [255, 50, 50, 200],
  hexagons: [],
  spawnInterval: 1000, // ms
  lastSpawnTime: 0,
  speed: 10, // z方向の移動速度
  spawnZ: -2000, // 生成位置
};

// 六角形クラス
class Hexagon {
  constructor(centerX, centerY, cameraZ) {
    this.x = centerX;
    this.y = centerY;
    this.z = window.hexagonState.spawnZ;
    this.targetZ = cameraZ;
    this.size = window.hexagonState.size;
    this.color = [...window.hexagonState.color];
    this.isActive = true;
  }

  update() {
    this.z += window.hexagonState.speed;
    // カメラを通り過ぎたら消す
    if (this.z > this.targetZ + 100) {
      this.isActive = false;
    }
  }

  draw() {
    push();
    translate(this.x, this.y, this.z);
    // 回転なし
    stroke(...this.color);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i;
      let x = cos(angle) * this.size;
      let y = sin(angle) * this.size;
      vertex(x, y, 0);
    }
    endShape(CLOSE);
    pop();
  }
}

// 六角形フレームの描画
function drawHexagonFrame() {
  const now = millis();
  if (
    window.hexagonState.isEnabled &&
    now - window.hexagonState.lastSpawnTime > window.hexagonState.spawnInterval
  ) {
    // カメラの中心座標を取得
    const cam = window.cameraState
      ? window.cameraState.pos
      : { x: 0, y: 0, z: 400 };
    window.hexagonState.hexagons.push(new Hexagon(cam.x, cam.y, cam.z));
    window.hexagonState.lastSpawnTime = now;
  }
  window.hexagonState.hexagons = window.hexagonState.hexagons.filter((hex) => {
    hex.update();
    if (hex.isActive) {
      hex.draw();
      return true;
    }
    return false;
  });
}

// 六角形フレームの開始
window.startHexagonFrame = function () {
  window.hexagonState.isEnabled = !window.hexagonState.isEnabled;
  if (window.hexagonState.isEnabled) {
    window.hexagonState.lastSpawnTime = millis();
    window.hexagonState.hexagons = [];
  }
};

// 六角形フレームの停止
window.stopHexagonFrame = function () {
  window.hexagonState.isEnabled = false;
  window.hexagonState.hexagons = [];
};
