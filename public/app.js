const $ = (selector) => document.querySelector(selector);

function formatSeconds(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} 요청 실패: ${response.status}`);
  }

  return response.json();
}

async function loadStatus() {
  const status = await fetchJson("/api/status");

  $("#runtime").textContent = status.runtime;
  $("#platform").textContent = `${status.platform} / ${status.environment}`;
  $("#region").textContent = status.region;
  $("#uptime").textContent = formatSeconds(status.uptimeSeconds);
  $("#hostname").textContent = status.hostname;
}

async function loadMetrics() {
  const metrics = await fetchJson("/api/metrics");

  $("#cpuText").textContent = `${metrics.cpu}%`;
  $("#memoryText").textContent = `${metrics.memory}%`;
  $("#latencyText").textContent = `${metrics.latency}ms`;

  $("#cpuBar").style.width = `${metrics.cpu}%`;
  $("#memoryBar").style.width = `${metrics.memory}%`;
  $("#latencyBar").style.width = `${Math.min(metrics.latency / 2, 100)}%`;

  $("#requests").textContent = metrics.requests.toLocaleString("ko-KR");
  $("#successRate").textContent = `${metrics.successRate}%`;
}

async function loadOrders() {
  const data = await fetchJson("/api/orders");

  $("#orders").innerHTML = data.items
    .map(
      (order) => `
        <div class="order">
          <strong>${order.id}</strong>
          <div class="order-meta">
            <span>${order.customer}</span>
            <span>${order.product}</span>
            <span>${formatCurrency(order.amount)}</span>
            <span>${order.status}</span>
          </div>
        </div>
      `
    )
    .join("");
}

async function loadTimeline() {
  const items = await fetchJson("/api/timeline");

  $("#timeline").innerHTML = items
    .map(
      (item) => `
        <div class="timeline-item">
          <div class="timeline-time">${item.time}</div>
          <div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-detail">${item.detail}</div>
          </div>
        </div>
      `
    )
    .join("");
}

async function refreshDashboard() {
  try {
    await Promise.all([loadStatus(), loadMetrics(), loadOrders(), loadTimeline()]);
  } catch (error) {
    console.error(error);
    alert("대시보드 데이터를 불러오는 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
  }
}

$("#refreshBtn").addEventListener("click", refreshDashboard);

refreshDashboard();
setInterval(() => {
  loadStatus();
  loadMetrics();
}, 5000);