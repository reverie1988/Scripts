/******************************
 * Quantumult X 滴滴附近加油站油价推送
 * 响应体解析版
 *
 * 作用：
 * 打开滴滴加油列表页后，QX 自动解析真实返回数据并推送
 *
 * 优点：
 * 不需要填写 ticket
 * 不需要填写 wsgsig
 * 不会因为重放请求导致 501
 ******************************/

console.log("DidiOilResponse start");

const CONFIG = {
  TITLE: "附近加油站油价",
  MAX_SHOW: 10,

  // 防止同一次刷新多次推送，单位毫秒
  NOTIFY_INTERVAL: 60 * 1000
};

const PREF_LAST_NOTIFY = "didi_oil_last_notify";

function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("JSON parse failed: " + e);
    return null;
  }
}

function safeGet(obj, path, def = "") {
  try {
    const result = path.split(".").reduce((o, k) => {
      if (o && Object.prototype.hasOwnProperty.call(o, k)) return o[k];
      return undefined;
    }, obj);

    return result === undefined || result === null ? def : result;
  } catch (e) {
    return def;
  }
}

function fenToYuan(value) {
  if (value === undefined || value === null || value === "") return "-";

  const n = Number(value);
  if (isNaN(n)) return "-";

  return (n / 100).toFixed(2);
}

function moneyText(value) {
  const p = fenToYuan(value);
  return p === "-" ? "-" : "¥" + p;
}

function distanceText(meter) {
  const n = Number(meter);

  if (isNaN(n)) return "";

  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "km";
  }

  return Math.round(n) + "m";
}

function nowText() {
  const d = new Date();
  const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const pad = n => String(n).padStart(2, "0");

  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 / ${weeks[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getCityName(json) {
  const list = safeGet(json, "data.storeList", []);

  if (Array.isArray(list) && list.length > 0) {
    const address = safeGet(list[0], "location.address", "");

    if (address.includes("威海")) return "威海市";
  }

  return "当前位置";
}

function getPriceInfo(store) {
  const price = store.priceInfoContainer || {};

  return {
    vipPrice: safeGet(price, "vipPriceInfo.price", null),
    memberPrice: safeGet(price, "memberPriceInfo.price", null),
    storePrice: safeGet(price, "storePriceInfo.price", null),
    cityPrice: safeGet(price, "cityPriceInfo.price", null),
    couponDesc: safeGet(price, "couponDesc", ""),
    vipLegal: safeGet(price, "vipPriceInfo.legalInfo", ""),
    openHours: store.openHoursTip || "",
    distance: store.distance || ""
  };
}

function parseStations(json) {
  const list = safeGet(json, "data.storeList", []);

  if (!Array.isArray(list)) return [];

  return list.map(store => {
    const p = getPriceInfo(store);

    return {
      name: store.name || "未知加油站",
      address: safeGet(store, "location.address", ""),
      openHours: p.openHours,
      distance: p.distance,
      vipPrice: p.vipPrice,
      memberPrice: p.memberPrice,
      storePrice: p.storePrice,
      cityPrice: p.cityPrice,
      couponDesc: p.couponDesc,
      vipLegal: p.vipLegal
    };
  });
}

function buildPlain(stations, rawJson) {
  const lines = [];

  const total = safeGet(rawJson, "data.total", stations.length);
  const city = getCityName(rawJson);

  lines.push("附近加油站油价");
  lines.push(`${nowText()} / ${city}`);
  lines.push(`共找到：${total} 家，显示前 ${Math.min(CONFIG.MAX_SHOW, stations.length)} 家`);
  lines.push("");

  stations.slice(0, CONFIG.MAX_SHOW).forEach((s, index) => {
    lines.push(`${index + 1}. ${s.name}`);
    lines.push("");

    const priceParts = [];

    if (s.vipPrice) priceParts.push(`滴滴价 ${moneyText(s.vipPrice)}`);
    if (s.memberPrice) priceParts.push(`会员价 ${moneyText(s.memberPrice)}`);
    if (s.storePrice) priceParts.push(`油站价 ${moneyText(s.storePrice)}`);
    if (s.cityPrice) priceParts.push(`城市价 ${moneyText(s.cityPrice)}`);

    lines.push(priceParts.length ? priceParts.join(" / ") : "暂无价格信息");

    const extra = [];

    if (s.distance) extra.push(`距离 ${distanceText(s.distance)}`);
    if (s.openHours) extra.push(s.openHours);
    if (s.couponDesc) extra.push(s.couponDesc);

    if (extra.length) {
      lines.push(extra.join(" / "));
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

function shouldNotify() {
  const now = Date.now();
  const last = Number($prefs.valueForKey(PREF_LAST_NOTIFY) || 0);

  if (now - last < CONFIG.NOTIFY_INTERVAL) {
    console.log("Skip notify: too frequent");
    return false;
  }

  $prefs.setValueForKey(String(now), PREF_LAST_NOTIFY);
  return true;
}

function notify(title, subtitle, body) {
  try {
    $notify(title, subtitle, body);
  } catch (e) {
    console.log("notify error: " + e);
  }
}

try {
  const body = $response.body || "";
  const json = parseJson(body);

  if (!json) {
    console.log("No valid json");
    $done({});
  }

  if (json.success !== true && json.code !== "SERVICE_RUN_SUCCESS") {
    console.log("Didi response not success: " + body.slice(0, 200));
    $done({});
  }

  const stations = parseStations(json);

  if (!stations.length) {
    console.log("No station data");
    $done({});
  }

  const plain = buildPlain(stations, json);

  console.log(plain);

  if (shouldNotify()) {
    notify(CONFIG.TITLE, "", plain);
  }
} catch (e) {
  console.log("DidiOilResponse error: " + e);
}

$done({});