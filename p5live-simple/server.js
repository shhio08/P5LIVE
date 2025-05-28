const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 静的ファイルの提供
app.use(express.static(__dirname));

// 監視するファイルのパス
const CODE_FILE = path.join(__dirname, "sketch.js");

// WebSocket接続の処理
wss.on("connection", (ws) => {
  console.log("Client connected");

  // 接続時に現在のコードを送信
  if (fs.existsSync(CODE_FILE)) {
    const code = fs.readFileSync(CODE_FILE, "utf8");
    ws.send(
      JSON.stringify({
        type: "code-update",
        code: code,
      })
    );
  }
});

// ファイル監視の設定
const watcher = chokidar.watch(CODE_FILE, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 50,
    pollInterval: 10,
  },
});

// ファイル変更時の処理
watcher.on("change", (path) => {
  const code = fs.readFileSync(path, "utf8");

  // 接続中の全クライアントに送信
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "code-update",
          code: code,
        })
      );
    }
  });
});

// サーバーの起動
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
