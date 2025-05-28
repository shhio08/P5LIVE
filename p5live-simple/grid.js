// グリッドのパラメータ
const gridSize = 4000; // グリッドの広さを大きく
const gridStep = 200; // 線の間隔を小さくして密度を上げる
let gridWavePhase = 0; // 波のフェーズ

// グリッドの状態
window.gridState = {
  isWaving: false,
  waveAmplitude: 0,
  targetWaveAmplitude: 0,
  transitionSpeed: 0.05,
};

// グリッドの初期化
function setupGrid() {
  window.gridState.isWaving = false;
  window.gridState.waveAmplitude = 0;
  window.gridState.targetWaveAmplitude = 0;
}

// グリッドの描画
function drawGrid(alpha) {
  push();
  let baseAlpha = 150;
  let gridAlpha = baseAlpha * alpha;
  stroke(100, 150, 255, gridAlpha);
  strokeWeight(1);
  noFill();

  // グリッドを手前に移動
  translate(0, 0, -500);

  updateGridState();
  gridWavePhase += 0.03;

  // 横線（Z方向）
  for (let z = -gridSize; z <= gridSize; z += gridStep) {
    beginShape();
    for (let x = -gridSize; x <= gridSize; x += gridStep / 2) {
      let y = calculateGridYPosition(x, z);
      vertex(x, y, z);
    }
    endShape();
  }

  // 縦線（X方向）
  for (let x = -gridSize; x <= gridSize; x += gridStep) {
    beginShape();
    for (let z = -gridSize; z <= gridSize; z += gridStep / 2) {
      let y = calculateGridYPosition(x, z);
      vertex(x, y, z);
    }
    endShape();
  }
  pop();
}

// 状態の更新
function updateGridState() {
  if (
    window.gridState.isWaving &&
    window.gridState.waveAmplitude < window.gridState.targetWaveAmplitude
  ) {
    window.gridState.waveAmplitude += window.gridState.transitionSpeed;
  } else if (!window.gridState.isWaving && window.gridState.waveAmplitude > 0) {
    window.gridState.waveAmplitude -= window.gridState.transitionSpeed;
  }

  window.gridState.waveAmplitude = constrain(
    window.gridState.waveAmplitude,
    0,
    window.gridState.targetWaveAmplitude
  );
}

// Y座標の計算
function calculateGridYPosition(x, z) {
  let waveY = 0;
  if (window.gridState.waveAmplitude > 0) {
    waveY = getWaveY(x, z, gridWavePhase, window.gridState.waveAmplitude);
  }
  return -1 * waveY;
}

function getWaveY(x, z, phase, amplitude) {
  return sin(x * 0.06 + z * 0.06 + phase) * amplitude;
}

// 波形有効化
window.toggleWavingGrid = function (enable) {
  console.log("波形効果: " + (enable ? "ON" : "OFF"));
  window.gridState.isWaving = enable;
  window.gridState.targetWaveAmplitude = enable ? 300 : 0;
};
