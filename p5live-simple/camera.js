// カメラの状態管理
window.cameraState = {
  pos: { x: 0, y: 0, z: 400 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  floating: false,
  // 漂いのパラメータ
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
  // ドライブ（左右スイング）モード
  driveMode: false,
  driveAngle: 0,
  driveSpeed: 0.02,
  driveAmplitude: 80, // 揺れの大きさ
  driveTiltAmount: 0.003,
  // 疾走モードの設定
  isRushing: false,
  rushSpeed: 5,
  rushStartZ: -2000,
  rushTargetZ: 400,
  rushProgress: 0,
  rushDuration: 3000, // 疾走の持続時間（ミリ秒）
  rushStartTime: 0,
};

// カメラの更新
window.updateCamera = function () {
  if (!window.cameraState) return;

  if (window.cameraState.driveMode) {
    window.cameraState.driveAngle += window.cameraState.driveSpeed;

    // 左右にゆらゆら動く
    const offsetX =
      Math.sin(window.cameraState.driveAngle) *
      window.cameraState.driveAmplitude;

    // カメラは左右にスイング
    window.cameraState.pos.x = window.cameraState.base.x + offsetX;
    window.cameraState.pos.y = window.cameraState.base.y;
    window.cameraState.pos.z = window.cameraState.base.z;

    // 中心を見つめる（これがポイント！）
    window.cameraState.target.x = 0;
    window.cameraState.target.y = 0;
    window.cameraState.target.z = 0;

    // カメラの傾きを調整
    window.cameraState.up.x = offsetX * window.cameraState.driveTiltAmount;
  } else if (window.cameraState.floating) {
    window.cameraState.angle += window.cameraState.speed;
    // 複雑な円運動
    let x =
      window.cameraState.base.x +
      cos(window.cameraState.angle) * window.cameraState.base.radius;
    let y =
      window.cameraState.base.y +
      sin(window.cameraState.angle * 0.5) * window.cameraState.yOffset;
    let z =
      window.cameraState.base.z +
      sin(window.cameraState.angle * 0.3) * window.cameraState.zOffset;
    window.cameraState.pos.x = x;
    window.cameraState.pos.y = y;
    window.cameraState.pos.z = z;
    window.cameraState.target.x = 0;
    window.cameraState.target.y = 0;
    window.cameraState.target.z = 0;
    // floatingモードでは傾きをリセット
    window.cameraState.up.x = 0;
    window.cameraState.up.y = 1;
  } else {
    // どのモードでもない場合は傾きをリセット
    window.cameraState.up.x = 0;
    window.cameraState.up.y = 1;
  }

  if (window.cameraState.isRushing) {
    // 疾走モードの処理
    let progress =
      (millis() - window.cameraState.rushStartTime) /
      window.cameraState.rushDuration;
    if (progress < 1) {
      // 赤い立方体の自動生成
      if (frameCount % 10 === 0) {
        // 10フレームごとに生成
        window.spawnRedCubes();
      }
    } else {
      // 疾走モード終了
      window.cameraState.isRushing = false;
    }
  }

  // カメラの位置を設定
  camera(
    window.cameraState.pos.x,
    window.cameraState.pos.y,
    window.cameraState.pos.z,
    window.cameraState.target.x,
    window.cameraState.target.y,
    window.cameraState.target.z,
    window.cameraState.up.x,
    window.cameraState.up.y,
    window.cameraState.up.z
  );
};

// カメラをデフォルト位置1に移動（中央から平行に見る）
window.resetCamera = function () {
  if (!window.cameraState) return;
  window.cameraState.pos.x = 0;
  window.cameraState.pos.y = 0;
  window.cameraState.pos.z = 400;
  window.cameraState.target.x = 0;
  window.cameraState.target.y = 0;
  window.cameraState.target.z = 0;
  window.cameraState.up.x = 0;
  window.cameraState.up.y = 1;
  window.cameraState.floating = false;
  window.cameraState.driveMode = false;
};

// カメラをデフォルト位置2に移動（上から見下ろす）
window.moveToTopView = function () {
  if (!window.cameraState) return;
  window.cameraState.pos.x = 0;
  window.cameraState.pos.y = -400;
  window.cameraState.pos.z = 600;
  window.cameraState.target.x = 0;
  window.cameraState.target.y = 0;
  window.cameraState.target.z = 0;
  window.cameraState.up.x = 0;
  window.cameraState.up.y = 1;
  window.cameraState.floating = false;
  window.cameraState.driveMode = false;
};

// 激しい漂いモードの切り替え
window.toggleFloating = function () {
  // 他のモードを無効化
  window.cameraState.driveMode = false;
  window.cameraState.up.x = 0;
  window.cameraState.up.y = 1;

  if (!window.cameraState.floating) {
    window.cameraState.base.x = window.cameraState.pos.x;
    window.cameraState.base.y = window.cameraState.pos.y;
    window.cameraState.base.z = window.cameraState.pos.z;
    window.cameraState.angle = 0;
    window.cameraState.base.radius = 1200;
    window.cameraState.speed = 0.008;
    window.cameraState.yOffset = 600;
    window.cameraState.zOffset = 900;
  } else {
    window.cameraState.base.x = window.cameraState.pos.x;
    window.cameraState.base.y = window.cameraState.pos.y;
    window.cameraState.base.z = window.cameraState.pos.z;
  }

  window.cameraState.floating = !window.cameraState.floating;
};

// ドライブモードON/OFF切り替え
window.toggleDriveMode = function () {
  // ドライブモードを切り替える前に、他モードを無効化
  window.cameraState.floating = false;

  window.cameraState.driveMode = !window.cameraState.driveMode;

  if (window.cameraState.driveMode) {
    // 現在位置を基準に揺らぎ開始
    window.cameraState.base.x = window.cameraState.pos.x;
    window.cameraState.base.y = window.cameraState.pos.y;
    window.cameraState.base.z = window.cameraState.pos.z;
    window.cameraState.driveAngle = 0;
  } else {
    // ドライブモード終了時は傾きをリセット
    window.cameraState.up.x = 0;
    window.cameraState.up.y = 1;
  }
};
