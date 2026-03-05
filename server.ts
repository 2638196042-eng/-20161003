import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple file-based database for keys
const DB_FILE = path.join(__dirname, "keys.json");

interface KeyDB {
  [key: string]: {
    deviceId: string | null;
  };
}

// Initialize DB with test key if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialDB: KeyDB = {
    "yzl11111": { deviceId: null }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
}

function getDB(): KeyDB {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveDB(db: KeyDB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/verify-key", (req, res) => {
    const { key, deviceId } = req.body;

    if (!key || !deviceId) {
      return res.status(400).json({ success: false, message: "缺少参数" });
    }

    const db = getDB();

    if (!db[key]) {
      return res.status(400).json({ success: false, message: "卡密无效" });
    }

    const keyData = db[key];

    if (keyData.deviceId === null) {
      // Bind to this device
      db[key].deviceId = deviceId;
      saveDB(db);
      return res.json({ success: true, message: "验证成功，已绑定此设备" });
    } else if (keyData.deviceId === deviceId) {
      // Already bound to this device
      return res.json({ success: true, message: "验证成功" });
    } else {
      // Bound to another device
      return res.status(403).json({ success: false, message: "该卡密已被其他设备使用" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
