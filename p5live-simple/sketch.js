function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  window.waveT = 0;
  window.waveStartProgress = 0;
  window.waveEnabled = false;
  window.waveSpreadZ = false; // z方向広がりフラグ
  window.particles = []; // パーティクル配列を初期化
  window.particleCount = 100; // パーティクルの数
  window.particleSpeed = 1.0; // パーティクルの速度倍率
  window.particleEnabled = false; // パーティクル表示フラグ
  window.particleRange = 200; // パーティクルの出現範囲

  // カメラの初期設定
  window.cameraState = {
    pos: { x: 0, y: 0, z: 400 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    floating: false,
    base: {
      x: 0,
      y: 0,
      z: 400,
      radius: 400,
    },
    angle: 0,
    speed: 0.008,
    yOffset: 600,
    zOffset: 900,
    smoothTransition: false,
    transitionProgress: 0,
    startPos: null,
    targetPos: null,
    driveMode: false,
    driveAngle: 0,
    driveSpeed: 0.02,
    driveAmplitude: 80,
    driveTiltAmount: 0.003,
    isRushing: false,
    rushSpeed: 5,
    rushStartZ: -2000,
    rushTargetZ: 400,
    rushProgress: 0,
    rushDuration: 3000,
    rushStartTime: 0,
  };

  // カメラを初期位置に設定
  window.cameraState.pos.x = 0;
  window.cameraState.pos.y = 0;
  window.cameraState.pos.z = 400;
  window.cameraState.target.x = 0;
  window.cameraState.target.y = 0;
  window.cameraState.target.z = 0;

  setupGrid(); // グリッドの初期化
  window.setupAurora(); // オーロラの初期化
}

function resetCamera() {
  camera(0, 0, 400, 0, 0, 0, 0, 1, 0);
}

function draw() {
  background(0);
  updateCamera();

  // wave ----------------------
  // drawWaveSystem();
  // wave解除中------------------
  // if (window.waveEnabled === true) {
  //   window.waveEnabled = false;
  // }
  // circle --------------------
  // drawAmbientSphere();
  // particle コメントアウトしなくていい
  if (window.particleEnabled) {
    drawParticleSystem();
  }
  // grid ----------------------
  // drawGrid(1.0); // グリッドの描画
  // cube animation ------------
  drawCubeAnimation();
  // red cube animation --------
  drawRedCubes();
  // hexagon frame -------------
  drawHexagonFrame();
  // aurora --------------------
  drawAurora();
}

function drawWaveSystem() {
  if (window.waveEnabled === false) {
    window.waveT = 0;
    window.waveStartProgress = 0;
    window.waveEnabled = true;
    return;
  }

  let waveCount = 40;
  let lastDelay = (waveCount - 1) * 0.06;
  if (window.waveStartProgress < 1 + lastDelay) {
    window.waveStartProgress += 0.002;
  }

  for (let i = 0; i < 40; i++) {
    let baseY = -150 + i * 10;
    let delay = i * 0.06;
    let waveProgress = map(
      max(0, window.waveStartProgress - delay),
      0,
      1,
      0,
      1
    );
    drawWave(baseY, i, waveProgress);
  }
  window.waveT += 0.02;
}

function drawWave(baseY, index, waveProgress) {
  noFill();
  stroke(200, 220, 255, 100);
  strokeWeight(0.8);
  beginShape();
  for (let x = -1200; x < 1200; x += 3) {
    let progress = map(waveProgress, 0, 1, -1200, 1200);
    if (x < progress) {
      let amplitude1 = map(sin(window.waveT * 0.2), -1, 1, 5, 30);
      let amplitude2 = map(sin(window.waveT * 0.15), -1, 1, 2, 15);
      let amplitude3 = map(sin(window.waveT * 0.1), -1, 1, 1, 10);
      let startScale = map(waveProgress, 0, 1, 0.2, 1);
      amplitude1 *= startScale;
      amplitude2 *= startScale;
      amplitude3 *= startScale;
      let wave1 = sin(x * 0.02 + window.waveT) * amplitude1;
      let wave2 = sin(x * 0.01 + window.waveT * 0.7 + index * 0.2) * amplitude2;
      let wave3 = cos(x * 0.03 + window.waveT * 0.5 + index * 0.1) * amplitude3;
      let y = baseY + wave1 + wave2 + wave3;

      // z方向の広がり
      let z = 0;
      if (window.waveSpreadZ) {
        z = sin(x * 0.015 + window.waveT * 0.7 + index * 0.3) * 120;
      }

      vertex(x, y, z);
    }
  }
  endShape();
}

function drawAmbientSphere() {
  push();
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.01);

  let t = frameCount * 0.02;
  let baseRadius = 80;
  let ambientRadius = baseRadius + sin(t * 0.3) * 20 + sin(t * 0.13) * 10;

  let detail = 300;
  let latStep = PI / detail;
  let lonStep = TWO_PI / detail;

  noStroke();
  fill(180, 200, 255, 200); // 超薄い面＝線に見える
  drawingContext.disable(drawingContext.DEPTH_TEST);

  // 横方向の帯（緯度線）
  for (let lat = 0; lat < PI; lat += latStep * 5) {
    beginShape(TRIANGLE_STRIP);
    for (let lon = 0; lon <= TWO_PI + lonStep; lon += lonStep) {
      for (let i = 0; i <= 1; i++) {
        let currentLat = lat + i * latStep;
        let deform =
          sin(lon * 2 + t * 1.2) * 4 + sin(currentLat * 2 + t * 0.8) * 3;
        let r = ambientRadius + deform;
        let x = r * sin(currentLat) * cos(lon);
        let y = r * sin(currentLat) * sin(lon);
        let z = r * cos(currentLat);
        vertex(x, y, z);
      }
    }
    endShape();
  }

  // 縦方向の帯（経度線）
  for (let lon = 0; lon < TWO_PI; lon += lonStep * 5) {
    beginShape(TRIANGLE_STRIP);
    for (let lat = 0; lat <= PI; lat += latStep) {
      for (let i = 0; i <= 1; i++) {
        let currentLon = lon + i * lonStep;
        let deform =
          sin(currentLon * 2 + t * 1.2) * 4 + sin(lat * 2 + t * 0.8) * 3;
        let r = ambientRadius + deform;
        let x = r * sin(lat) * cos(currentLon);
        let y = r * sin(lat) * sin(currentLon);
        let z = r * cos(lat);
        vertex(x, y, z);
      }
    }
    endShape();
  }

  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}

function keyPressed() {
  if (key === "z" || key === "Z") {
    window.waveSpreadZ = !window.waveSpreadZ;
  }
  // 立方体アニメーションの開始/停止
  if (key === "c" || key === "C") {
    window.toggleCubeAnimation(!window.cubeState.isEnabled);
  }
  // 立方体の生成と成長を停止/再開
  if (key === "s" || key === "S") {
    window.toggleCubeFreeze();
  }
  // 立方体の爆発を開始
  if (key === "x" || key === "X") {
    window.startCubeExplosion();
  }
  // 赤い立方体の生成
  if (key === "v" || key === "V") {
    window.spawnRedCubes();
  }
  // 赤い立方体のクリア
  if (key === "b" || key === "B") {
    window.clearRedCubes();
  }
  // パーティクルの表示/非表示
  if (key === "p" || key === "P") {
    window.particleEnabled = !window.particleEnabled;
  }
  // パーティクル数の調整
  if (key === "+" || key === ";") {
    window.particleCount = min(window.particleCount + 50, 1000);
  }
  if (key === "-" || key === "=") {
    window.particleCount = max(window.particleCount - 50, 10);
  }
  // パーティクル速度の調整
  if (key === "[" || key === "{") {
    window.particleSpeed = max(window.particleSpeed - 0.2, 0.1);
  }
  if (key === "]" || key === "}") {
    window.particleSpeed = min(window.particleSpeed + 0.2, 5.0);
  }
  // パーティクル出現範囲の調整
  if (key === "r" || key === "R") {
    window.particleRange = min(window.particleRange + 100, 1000);
  }
  if (key === "f" || key === "F") {
    window.particleRange = max(window.particleRange - 100, 50);
  }
  // グリッドの波形効果をキーボードに割り当て
  if (key === "w" || key === "W") {
    toggleWavingGrid(!gridState.isWaving);
  }
  // カメラのリセット（デフォルト位置1）
  if (key === "o" || key === "O") {
    window.cameraState.pos.x = 0;
    window.cameraState.pos.y = 0;
    window.cameraState.pos.z = 400;
    window.cameraState.target.x = 0;
    window.cameraState.target.y = 0;
    window.cameraState.target.z = 0;
  }
  // 上から見下ろすカメラ位置に移動（デフォルト位置2）
  if (key === "t" || key === "T") {
    window.moveToTopView();
  }
  // 漂いモードの切り替え
  if (key === "m" || key === "M") {
    window.toggleFloating();
  }
  // ドライブモードの切り替え
  if (key === "d" || key === "D") {
    window.toggleDriveMode();
  }
  if (key === "h" || key === "H") {
    // window.startRushMode();
    window.startHexagonFrame();
  }
  if (key === "a" || key === "A") {
    window.auroraState.isEnabled = !window.auroraState.isEnabled;
    if (window.auroraState.isEnabled) {
      window.startAurora();
    }
  }
}

window.Particle = class {
  constructor() {
    this.reset();
    this.maxLife = random(100, 255);
    this.life = this.maxLife;
  }

  reset() {
    this.x = random(-window.particleRange, window.particleRange);
    this.y = random(-window.particleRange, window.particleRange);
    this.z = random(-window.particleRange, window.particleRange);
    this.size = random(1, 3);
    this.speed = random(0.5, 2) * window.particleSpeed; // 速度に倍率を適用
    this.maxLife = random(100, 255);
    this.life = this.maxLife;
    this.color = color(255, 255, 255, this.life);
  }

  update() {
    this.y -= this.speed;
    this.x += random(-0.5, 0.5);
    this.z += random(-0.5, 0.5);
    this.life -= random(1, 3); // 減少量をランダムに
    this.color = color(255, 255, 255, this.life);

    if (this.life <= 0) {
      this.reset();
    }
  }

  draw() {
    push();
    noStroke();
    fill(this.color);
    drawingContext.disable(drawingContext.DEPTH_TEST);
    translate(this.x, this.y, this.z);
    sphere(this.size);
    drawingContext.enable(drawingContext.DEPTH_TEST);
    pop();
  }
};

function drawParticleSystem() {
  // パーティクルの数を調整
  if (window.particles.length < window.particleCount) {
    // 足りない場合は追加
    while (window.particles.length < window.particleCount) {
      window.particles.push(new window.Particle());
    }
  } else if (window.particles.length > window.particleCount) {
    // 多い場合は配列を切り詰める
    window.particles = window.particles.slice(0, window.particleCount);
  }

  // パーティクルの更新と描画
  for (let particle of window.particles) {
    particle.update();
    particle.draw();
  }
}
