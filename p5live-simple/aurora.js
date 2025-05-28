// オーロラの状態管理
window.auroraState = {
  isEnabled: false,
  particles: [],
  particleCount: 1000, // 粒子数を増やす
  colors: [
    [100, 150, 255, 80], // 深い青
    [150, 100, 255, 80], // 青紫
    [200, 100, 255, 80], // 紫
  ],
  // 中心点の設定
  center: {
    x: 0,
    y: 0,
    z: 0,
    velocity: null, // setupで初期化
    speed: 0.5, // 中心点の移動速度
    range: 300, // 移動範囲
    time: 0, // 時間
  },
  // 粒子の設定
  pointSize: {
    min: 1.2, // サイズを少し小さく
    max: 2.5,
  },
  // 追従の設定
  follow: {
    speed: 0.008, // 追従速度
    range: 200, // 中心点からの距離範囲
    waveSpeed: 0.0003, // 波の速度
    waveAmplitude: 5, // 波の振幅
  },
  // 光の設定
  glow: {
    speed: 0.003, // 光の変化速度
    minAlpha: 100, // 最小透明度を高めに
    maxAlpha: 255, // 最大透明度を最大に
    time: 0, // 時間
  },
};

// オーロラの粒子クラス
class AuroraParticle {
  constructor() {
    this.reset();
  }

  reset() {
    // ランダムな色を選択
    this.baseColor = [...random(window.auroraState.colors)];
    this.color = [...this.baseColor];

    // サイズ
    this.size = random(
      window.auroraState.pointSize.min,
      window.auroraState.pointSize.max
    );

    // 中心点からの相対位置
    this.offsetX = random(
      -window.auroraState.follow.range,
      window.auroraState.follow.range
    );
    this.offsetY = random(
      -window.auroraState.follow.range,
      window.auroraState.follow.range
    );
    this.offsetZ = random(
      -window.auroraState.follow.range,
      window.auroraState.follow.range
    );

    // 波のパラメータ
    this.waveOffset = random(TWO_PI);
    this.waveSpeed = random(0.0001, 0.0003); // 波の速度をさらに遅く

    // 光のパラメータ
    this.glowOffset = random(TWO_PI);
    this.glowSpeed = random(0.002, 0.004); // 光の変化速度を速く
  }

  update() {
    // 時間の更新
    window.auroraState.center.time += window.auroraState.follow.waveSpeed;
    window.auroraState.glow.time += window.auroraState.glow.speed;

    // 波の計算（より緩やかな波）
    let waveX =
      sin(window.auroraState.center.time + this.waveOffset) *
      window.auroraState.follow.waveAmplitude;
    let waveY =
      cos(window.auroraState.center.time * 0.3 + this.waveOffset) *
      window.auroraState.follow.waveAmplitude;
    let waveZ =
      sin(window.auroraState.center.time * 0.2 + this.waveOffset) *
      window.auroraState.follow.waveAmplitude;

    // 目標位置の計算（中心点 + オフセット + 波）
    let targetX = window.auroraState.center.x + this.offsetX + waveX;
    let targetY = window.auroraState.center.y + this.offsetY + waveY;
    let targetZ = window.auroraState.center.z + this.offsetZ + waveZ;

    // 現在位置から目標位置へ追従（より滑らかに）
    this.x = lerp(this.x || targetX, targetX, window.auroraState.follow.speed);
    this.y = lerp(this.y || targetY, targetY, window.auroraState.follow.speed);
    this.z = lerp(this.z || targetZ, targetZ, window.auroraState.follow.speed);

    // 光の強さを更新（透明度を高めに保ちながら）
    let glow = sin(window.auroraState.glow.time + this.glowOffset);
    let alpha = map(
      glow,
      -1,
      1,
      window.auroraState.glow.minAlpha,
      window.auroraState.glow.maxAlpha
    );
    this.color[3] = alpha;

    // 中心点から離れすぎたら再設定
    let dx = this.x - window.auroraState.center.x;
    let dy = this.y - window.auroraState.center.y;
    let dz = this.z - window.auroraState.center.z;
    let dist = sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > window.auroraState.follow.range * 2) {
      this.reset();
    }
  }

  draw() {
    push();
    noStroke();
    strokeWeight(this.size);
    stroke(...this.color);
    drawingContext.disable(drawingContext.DEPTH_TEST);
    point(this.x, this.y, this.z);
    drawingContext.enable(drawingContext.DEPTH_TEST);
    pop();
  }
}

// 中心点の更新
function updateCenter() {
  // 時間の更新（さらに遅く）
  window.auroraState.center.time += 0.001;

  // 中心点の動きを計算（より緩やかな3D空間での漂い）
  window.auroraState.center.x =
    sin(window.auroraState.center.time * 0.1) * window.auroraState.center.range;
  window.auroraState.center.y =
    cos(window.auroraState.center.time * 0.08) *
    window.auroraState.center.range;
  window.auroraState.center.z =
    sin(window.auroraState.center.time * 0.05) *
    window.auroraState.center.range;
}

// オーロラの描画
window.drawAurora = function () {
  if (!window.auroraState.isEnabled) return;

  // パーティクルの数を調整
  while (
    window.auroraState.particles.length < window.auroraState.particleCount
  ) {
    window.auroraState.particles.push(new AuroraParticle());
  }

  // 中心点の更新
  updateCenter();

  // パーティクルの更新と描画
  for (let particle of window.auroraState.particles) {
    particle.update();
    particle.draw();
  }
};

// オーロラの開始
window.startAurora = function () {
  window.auroraState.isEnabled = true;
  window.auroraState.particles = [];
  // 中心点の初期化
  window.auroraState.center.x = 0;
  window.auroraState.center.y = 0;
  window.auroraState.center.z = 0;
  window.auroraState.center.time = 0;
  window.auroraState.glow.time = 0;
};

// オーロラの停止
window.stopAurora = function () {
  window.auroraState.isEnabled = false;
};

// setup関数で初期化
window.setupAurora = function () {
  window.auroraState.center.time = 0;
  window.auroraState.glow.time = 0;
};
