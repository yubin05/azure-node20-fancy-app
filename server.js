import express from "express";
import compression from "compression";
import helmet from "helmet";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

const PORT = process.env.PORT || 3000;
const APP_TITLE = process.env.APP_TITLE || "Soldesk Cloud Pulse";
const REGION_NAME = process.env.REGION_NAME || "Azure Korea Central";
const ENV_NAME = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startedAt = new Date();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(compression());
app.use(express.json());

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1h",
    etag: true
  })
);

const orders = [
  {
    id: "ORD-2026-SEOUL-001",
    customer: "Seoul Retail Lab",
    product: "Cloud Starter Kit",
    amount: 1380000,
    status: "처리중",
    region: "Korea Central"
  },
  {
    id: "ORD-2026-SEOUL-002",
    customer: "Busan Commerce",
    product: "Premium Monitoring Pack",
    amount: 2450000,
    status: "배송준비",
    region: "Korea Central"
  },
  {
    id: "ORD-2026-SEOUL-003",
    customer: "Incheon Logistics",
    product: "API Acceleration Plan",
    amount: 980000,
    status: "완료",
    region: "Korea Central"
  }
];

function getUptimeSeconds() {
  return Math.floor((Date.now() - startedAt.getTime()) / 1000);
}

function createRandomMetrics() {
  return {
    cpu: Math.floor(35 + Math.random() * 45),
    memory: Math.floor(40 + Math.random() * 35),
    latency: Math.floor(40 + Math.random() * 160),
    requests: Math.floor(1200 + Math.random() * 900),
    successRate: Number((98 + Math.random() * 1.8).toFixed(2))
  };
}

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: APP_TITLE,
    runtime: "Node.js 20",
    environment: ENV_NAME,
    region: REGION_NAME,
    uptimeSeconds: getUptimeSeconds(),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    title: APP_TITLE,
    message: "Azure App Service + Node.js 20 + GitHub Actions 배포 성공!",
    runtime: process.version,
    platform: process.platform,
    hostname: os.hostname(),
    region: REGION_NAME,
    environment: ENV_NAME,
    uptimeSeconds: getUptimeSeconds(),
    startedAt: startedAt.toISOString()
  });
});

app.get("/api/metrics", (req, res) => {
  res.json(createRandomMetrics());
});

app.get("/api/orders", (req, res) => {
  res.json({
    count: orders.length,
    items: orders
  });
});

app.post("/api/orders", (req, res) => {
  const { customer, product, amount } = req.body;

  if (!customer || !product || !amount) {
    return res.status(400).json({
      message: "customer, product, amount 값이 필요합니다."
    });
  }

  const newOrder = {
    id: `ORD-${Date.now()}`,
    customer,
    product,
    amount: Number(amount),
    status: "신규",
    region: REGION_NAME
  };

  orders.unshift(newOrder);

  res.status(201).json(newOrder);
});

app.get("/api/timeline", (req, res) => {
  res.json([
    {
      time: "로컬 개발",
      title: "Node.js 20 앱 작성",
      detail: "Express 서버와 화려한 정적 UI를 구성합니다."
    },
    {
      time: "GitHub Push",
      title: "Repository에 코드 업로드",
      detail: "main 브랜치 push 이벤트가 GitHub Actions를 실행합니다."
    },
    {
      time: "GitHub Actions",
      title: "빌드 및 배포",
      detail: "npm ci, 테스트, ZIP 패키징 후 App Service로 배포합니다."
    },
    {
      time: "Azure App Service",
      title: "운영 반영",
      detail: "Azure Linux Web App에서 Node.js 앱이 실행됩니다."
    }
  ]);
});

app.use("/api/*", (req, res) => {
  res.status(404).json({
    message: "요청한 API를 찾을 수 없습니다.",
    path: req.originalUrl
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 ${APP_TITLE} is running on port ${PORT}`);
  console.log(`🌐 Environment: ${ENV_NAME}`);
  console.log(`📍 Region: ${REGION_NAME}`);
});
