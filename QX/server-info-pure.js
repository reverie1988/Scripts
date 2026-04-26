/***
@Name: 节点纯度检测 Pure
@Author: Custom
@Description: 使用 IPPure API 查询当前 QX 节点出口 IP、ASN、地区、类型、欺诈分数和纯度等级
@Update: 2026-04-26

[task_local]
event-interaction https://你的脚本地址/server-info-pure.js, tag=节点纯度检测, img-url=checkmark.shield.fill.system, enabled=true
***/

const API_URL = "https://my.ippure.com/v1/info";
const POLICY = ($environment && $environment.params) ? String($environment.params).trim() : "";

const request = {
  url: API_URL,
  method: "GET",
  headers: {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Accept": "application/json,text/plain,*/*",
    "Cache-Control": "no-cache"
  },
  timeout: 8000
};

if (POLICY) {
  request.opts = {
    policy: POLICY
  };
}

$task.fetch(request).then(resp => {
  try {
    if (!resp || !resp.body) {
      return finishError("接口无返回数据");
    }

    const data = JSON.parse(resp.body);
    const htmlMessage = buildHtml(data);

    const ip = safe(data.ip);
    const score = numberValue(data.fraudScore, 0);
    const asn = data.asn ? `AS${data.asn}` : "N/A";

    console.log(
      `节点：${POLICY || "当前默认策略"}\n` +
      `IP：${ip}\n` +
      `ASN：${asn}\n` +
      `欺诈分：${score}`
    );

    $done({
      title: "🔎 节点纯度检测",
      htmlMessage
    });

  } catch (err) {
    finishError("数据解析失败", err.message);
  }
}, err => {
  finishError("查询失败或超时", String(err));
});


function buildHtml(data) {
  const ip = safe(data.ip);
  const countryCode = safe(data.countryCode);
  const flag = getFlagEmoji(countryCode);
  const region = safe(data.region);
  const city = safe(data.city);

  const asn = data.asn ? `AS${data.asn}` : "N/A";
  const isp = safe(data.asOrganization || data.isp || data.org);

  const score = numberValue(data.fraudScore, 0);

  const isResidential = boolValue(data.isResidential);
  const isHosting = boolValue(data.isHosting);
  const isProxy = boolValue(data.isProxy);
  const isVpn = boolValue(data.isVpn || data.isVPN);
  const isTor = boolValue(data.isTor);
  const isMobile = boolValue(data.isMobile);

  const netType = getNetworkType({
    isResidential,
    isHosting,
    isProxy,
    isVpn,
    isTor,
    isMobile
  });

  const risk = getRiskLevel(score);
  const pure = getPureLevel(score, {
    isResidential,
    isHosting,
    isProxy,
    isVpn,
    isTor,
    isMobile
  });

  let location = `${flag} ${countryCode || "N/A"}`;
  if (region !== "N/A") location += ` - ${region}`;
  if (city !== "N/A") location += ` - ${city}`;

  const rows = [
    ["出口 IP", ip],
    ["位置", location],
    ["ASN", asn],
    ["运营商", isp],
    ["网络类型", netType],
    ["欺诈分数", `${score} / 100`],
    ["风险等级", risk],
    ["纯度判断", pure],
    ["住宅 IP", yesNo(isResidential)],
    ["机房 IP", yesNo(isHosting)],
    ["代理识别", yesNo(isProxy)],
    ["VPN 识别", yesNo(isVpn)],
    ["Tor 识别", yesNo(isTor)],
    ["移动网络", yesNo(isMobile)]
  ];

  let html = `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.55;
    color: #111;
    padding: 2px 4px;
  ">
    <div style="text-align:center;font-size:17px;font-weight:700;margin-bottom:8px;">
      🔎 IPPure 节点纯度检测
    </div>

    <div style="
      border-radius: 12px;
      background: #f5f5f7;
      padding: 10px 12px;
      margin-bottom: 10px;
    ">
  `;

  rows.forEach(([key, value]) => {
    html += `
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e0e0e0;padding:5px 0;">
        <span style="color:#666;font-weight:600;">${escapeHtml(key)}</span>
        <span style="text-align:right;max-width:68%;">${value}</span>
      </div>
    `;
  });

  html += `
    </div>

    <div style="
      text-align:center;
      color:#6959CD;
      font-size:13px;
      font-weight:600;
      word-break:break-all;
    ">
      节点 ➟ ${escapeHtml(POLICY || "当前默认策略")}
    </div>

    <div style="
      margin-top:8px;
      text-align:center;
      color:#999;
      font-size:12px;
    ">
      结果仅代表当前出口 IP，节点切换后需重新检测
    </div>
  </div>
  `;

  return html;
}


function getNetworkType(info) {
  if (info.isTor) return "<font color='#dc3545'><b>Tor 网络 ‼️</b></font>";
  if (info.isProxy || info.isVpn) return "<font color='#ff8c00'><b>代理 / VPN 网络 ⚠️</b></font>";
  if (info.isResidential) return "<font color='#28a745'><b>住宅网络 🏠</b></font>";
  if (info.isMobile) return "<font color='#28a745'><b>移动网络 📱</b></font>";
  if (info.isHosting) return "<font color='#ff8c00'><b>数据中心 / 机房 🏢</b></font>";
  return "<font color='#666'>未知类型</font>";
}


function getRiskLevel(score) {
  if (score <= 20) return "<font color='#28a745'><b>低风险 ✅</b></font>";
  if (score <= 45) return "<font color='#ffc107'><b>中低风险 🟡</b></font>";
  if (score <= 70) return "<font color='#ff8c00'><b>高风险 ⚠️</b></font>";
  return "<font color='#dc3545'><b>极高风险 ‼️</b></font>";
}


function getPureLevel(score, info) {
  if (info.isTor) {
    return "<font color='#dc3545'><b>极低，不建议用于账号登录</b></font>";
  }

  if (info.isProxy || info.isVpn) {
    if (score <= 35) {
      return "<font color='#ffc107'><b>一般，可用于普通浏览</b></font>";
    }
    return "<font color='#dc3545'><b>偏低，容易触发风控</b></font>";
  }

  if (info.isResidential || info.isMobile) {
    if (score <= 25) {
      return "<font color='#28a745'><b>较高，适合账号类服务</b></font>";
    }
    if (score <= 50) {
      return "<font color='#ffc107'><b>中等，建议谨慎使用</b></font>";
    }
    return "<font color='#ff8c00'><b>偏低，可能有历史污染</b></font>";
  }

  if (info.isHosting) {
    if (score <= 25) {
      return "<font color='#ffc107'><b>普通机房 IP，纯度一般</b></font>";
    }
    return "<font color='#ff8c00'><b>机房风险偏高</b></font>";
  }

  if (score <= 25) {
    return "<font color='#28a745'><b>较干净</b></font>";
  }

  if (score <= 50) {
    return "<font color='#ffc107'><b>一般</b></font>";
  }

  return "<font color='#dc3545'><b>偏脏，不建议登录重要账号</b></font>";
}


function yesNo(value) {
  return value
    ? "<font color='#dc3545'><b>是</b></font>"
    : "<font color='#28a745'>否</font>";
}


function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === "N/A") return "🌍";

  try {
    return countryCode
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .split("")
      .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
      .join("");
  } catch (e) {
    return "🌍";
  }
}


function boolValue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}


function numberValue(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}


function safe(value) {
  if (value === undefined || value === null || value === "") return "N/A";
  return escapeHtml(String(value));
}


function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


function finishError(title, detail = "") {
  const htmlMessage = `
  <div style="
    text-align:center;
    font-family:-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    padding:10px;
  ">
    <div style="font-size:18px;font-weight:700;color:#dc3545;">🛑 ${escapeHtml(title)}</div>
    <div style="font-size:13px;color:#999;margin-top:8px;word-break:break-all;">
      ${escapeHtml(detail || "请检查网络、节点或 IPPure 接口状态")}
    </div>
    <div style="font-size:13px;color:#6959CD;margin-top:8px;word-break:break-all;">
      节点 ➟ ${escapeHtml(POLICY || "当前默认策略")}
    </div>
  </div>
  `;

  $done({
    title: "🔎 节点纯度检测",
    htmlMessage
  });
}