console.log("FinanceNews start");

/**
 * Quantumult X 财经 / 股市新闻推送
 * 适配策略组：策略选择
 * 建议文件路径：QX/FinanceNews.js
 */

const CONFIG = {
  // 拉取新闻时使用哪个 QX 策略组
  POLICY: "策略选择",

  // 每次最多推送几条
  MAX_PUSH: 8,

  // 只看最近多少小时新闻
  LOOKBACK_HOURS: 36,

  // 没有新新闻时是否推送提示
  // 测试时可以 true，稳定后建议 false
  PUSH_EMPTY: false,

  // 去重缓存数量
  SEEN_LIMIT: 300,

  // 存储键名
  STORE_KEY: "QX_FINANCE_NEWS_SEEN_V1"
};

/**
 * 重点关注词
 * 你可以按自己持仓/关注方向继续加
 */
const WATCH_WORDS = [
  "中国电建",
  "中国能建",
  "多氟多",
  "潞化科技",
  "正泰电源",
  "雅博股份",
  "华天酒店",
  "通程控股",
  "电力",
  "算力",
  "边缘算力",
  "锂电",
  "氟化工",
  "煤化工",
  "氢能",
  "旅游",
  "酒店"
];

/**
 * 股市/财经关键词
 */
const MARKET_KEYWORDS = [
  "A股",
  "沪指",
  "深成指",
  "创业板指",
  "科创板",
  "北证",
  "北交所",
  "沪深",
  "上证",
  "股市",
  "股票",
  "证券",
  "券商",
  "证监会",
  "交易所",
  "央行",
  "财政部",
  "发改委",
  "商务部",
  "降准",
  "降息",
  "利率",
  "汇率",
  "人民币",
  "美元",
  "美联储",
  "港股",
  "美股",
  "纳指",
  "道指",
  "标普",
  "涨停",
  "跌停",
  "连板",
  "炸板",
  "龙虎榜",
  "北向资金",
  "主力资金",
  "融资融券",
  "量化",
  "ETF",
  "基金",
  "重组",
  "并购",
  "定增",
  "减持",
  "增持",
  "回购",
  "业绩",
  "预增",
  "预亏",
  "分红",
  "年报",
  "季报",
  "中报",
  "板块",
  "概念股",
  "龙头股",
  "题材",
  "低空经济",
  "机器人",
  "人工智能",
  "半导体",
  "芯片",
  "新能源",
  "光伏",
  "风电",
  "储能",
  "电网",
  "特高压",
  "煤炭",
  "化肥",
  "甲醇",
  "有色",
  "稀土",
  "房地产",
  "消费",
  "医药",
  "减肥药",
  "脑机接口"
];

/**
 * 排除词，减少无关娱乐/体育新闻
 */
const BLOCK_WORDS = [
  "彩票",
  "体育",
  "足球",
  "篮球",
  "明星",
  "综艺",
  "八卦",
  "游戏攻略",
  "电影票房"
];

function googleNews(query) {
  return "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=zh-CN&gl=CN&ceid=CN:zh-Hans";
}

function bingNews(query) {
  return "https://www.bing.com/news/search?q=" +
    encodeURIComponent(query) +
    "&format=rss&mkt=zh-CN";
}

/**
 * 新闻源
 * 这里选 Google News + Bing News，稳定性比直接抓网页更好
 */
const FEEDS = [
  {
    name: "Google财经股市",
    url: googleNews("(A股 OR 沪深 OR 股市 OR 证监会 OR 央行 OR 涨停 OR 跌停 OR 北向资金 OR 龙虎榜 OR 业绩 OR 重组) when:1d")
  },
  {
    name: "Google重点股票",
    url: googleNews("(中国电建 OR 中国能建 OR 多氟多 OR 潞化科技 OR 正泰电源 OR 雅博股份 OR 华天酒店 OR 通程控股) when:3d")
  },
  {
    name: "Bing财经股市",
    url: bingNews("A股 股市 证监会 央行 涨停 跌停 北向资金 龙虎榜 业绩 重组")
  },
  {
    name: "Bing重点股票",
    url: bingNews("中国电建 中国能建 多氟多 潞化科技 正泰电源 雅博股份 华天酒店 通程控股")
  }
];

function notify(title, subtitle, body) {
  try {
    $notify(title, subtitle, body);
  } catch (e) {
    console.log("notify error: " + e);
  }
}

function done(title, content, html) {
  try {
    $done({
      title: title,
      content: content,
      htmlMessage: html
    });
  } catch (e) {
    $done();
  }
}

function now() {
  return Date.now();
}

function decodeHtml(str) {
  if (!str) return "";

  return String(str)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(str) {
  return decodeHtml(str)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(block, tag) {
  const reg = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
  const m = block.match(reg);
  return m ? stripHtml(m[1]) : "";
}

function pickAtomLink(block) {
  let m = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (m && m[1]) return decodeHtml(m[1]);

  m = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (m && m[1]) return stripHtml(m[1]);

  return "";
}

function simpleHash(str) {
  str = String(str || "");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function parseDate(text) {
  if (!text) return 0;
  const t = Date.parse(text);
  return Number.isNaN(t) ? 0 : t;
}

function parseFeed(xml, sourceName) {
  const list = [];
  if (!xml) return list;

  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const item of items) {
    const title = pickTag(item, "title");
    const link = pickTag(item, "link");
    const desc = pickTag(item, "description");
    const pub = pickTag(item, "pubDate") || pickTag(item, "dc:date");
    const pubTime = parseDate(pub);

    if (!title) continue;

    list.push({
      source: sourceName,
      title,
      link,
      desc,
      pubTime,
      id: simpleHash(title + "|" + link)
    });
  }

  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  for (const entry of entries) {
    const title = pickTag(entry, "title");
    const link = pickAtomLink(entry);
    const desc = pickTag(entry, "summary") || pickTag(entry, "content");
    const pub = pickTag(entry, "updated") || pickTag(entry, "published");
    const pubTime = parseDate(pub);

    if (!title) continue;

    list.push({
      source: sourceName,
      title,
      link,
      desc,
      pubTime,
      id: simpleHash(title + "|" + link)
    });
  }

  return list;
}

function scoreItem(item) {
  const text = (item.title + " " + item.desc).toLowerCase();

  for (const w of BLOCK_WORDS) {
    if (text.includes(w.toLowerCase())) return -999;
  }

  let score = 0;

  for (const w of WATCH_WORDS) {
    if (text.includes(w.toLowerCase())) score += 5;
  }

  for (const w of MARKET_KEYWORDS) {
    if (text.includes(w.toLowerCase())) score += 2;
  }

  // 标题命中权重更高
  const title = item.title.toLowerCase();
  for (const w of MARKET_KEYWORDS) {
    if (title.includes(w.toLowerCase())) score += 2;
  }

  return score;
}

function isFresh(item) {
  if (!item.pubTime) return true;
  const age = now() - item.pubTime;
  return age <= CONFIG.LOOKBACK_HOURS * 3600 * 1000;
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

function loadSeen() {
  try {
    const raw = $prefs.valueForKey(CONFIG.STORE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.log("loadSeen error: " + e);
    return [];
  }
}

function saveSeen(ids) {
  try {
    const arr = ids.slice(0, CONFIG.SEEN_LIMIT);
    $prefs.setValueForKey(JSON.stringify(arr), CONFIG.STORE_KEY);
  } catch (e) {
    console.log("saveSeen error: " + e);
  }
}

function fetchFeed(feed) {
  return new Promise(resolve => {
    const req = {
      url: feed.url,
      method: "GET",
      opts: {
        policy: CONFIG.POLICY
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      }
    };

    const timer = setTimeout(() => {
      resolve({
        ok: false,
        source: feed.name,
        error: "timeout"
      });
    }, 8000);

    $task.fetch(req).then(resp => {
      clearTimeout(timer);
      resolve({
        ok: resp.statusCode >= 200 && resp.statusCode < 400,
        source: feed.name,
        status: resp.statusCode,
        body: resp.body || ""
      });
    }, err => {
      clearTimeout(timer);
      resolve({
        ok: false,
        source: feed.name,
        error: String(err)
      });
    });
  });
}

function buildPush(items) {
  const lines = [];
  const htmlLines = [];

  items.forEach((item, index) => {
    const time = formatTime(item.pubTime);
    const prefix = `${index + 1}.`;
    const source = item.source ? `【${item.source}】` : "";
    const timeText = time ? ` ${time}` : "";

    lines.push(`${prefix} ${source}${timeText}\n${item.title}\n${item.link || ""}`);

    const htmlLink = item.link
      ? `<a href="${item.link}">${item.title}</a>`
      : item.title;

    htmlLines.push(
      `<b>${prefix}</b> ${source}${timeText}<br>${htmlLink}`
    );
  });

  return {
    plain: lines.join("\n\n"),
    html: htmlLines.join("<br><br>")
  };
}

async function main() {
  const seen = loadSeen();
  const seenSet = new Set(seen);

  const responses = await Promise.all(FEEDS.map(fetchFeed));
  let all = [];
  let failCount = 0;

  for (const res of responses) {
    if (!res.ok) {
      failCount++;
      console.log(`Feed failed: ${res.source} ${res.status || ""} ${res.error || ""}`);
      continue;
    }

    const items = parseFeed(res.body, res.source);
    console.log(`Feed ok: ${res.source}, items=${items.length}`);
    all = all.concat(items);
  }

  const map = new Map();

  for (const item of all) {
    if (!isFresh(item)) continue;

    const score = scoreItem(item);
    if (score < 2) continue;

    item.score = score;

    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  let candidates = Array.from(map.values());

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.pubTime || 0) - (a.pubTime || 0);
  });

  const fresh = candidates.filter(item => !seenSet.has(item.id));
  const pushItems = fresh.slice(0, CONFIG.MAX_PUSH);

  if (pushItems.length === 0) {
    const msg = `暂无新的股市相关新闻\n抓取源：${FEEDS.length} 个\n失败源：${failCount} 个`;

    console.log(msg);

    if (CONFIG.PUSH_EMPTY) {
      notify("财经股市新闻", "暂无新增", msg);
    }

    done(
      "财经股市新闻",
      msg,
      `<p style="font-family:-apple-system;text-align:center;">${msg.replace(/\n/g, "<br>")}</p>`
    );
    return;
  }

  const ids = pushItems.map(i => i.id).concat(seen);
  saveSeen(ids);

  const content = buildPush(pushItems);

  const title = `财经股市新闻 ${pushItems.length} 条`;
  const subtitle = "A股 / 板块 / 政策 / 重点个股";

  notify(title, subtitle, content.plain);

  const html = `
  <p style="font-family:-apple-system;font-size:medium;">
    <b>${title}</b><br>
    ${subtitle}<br>
    --------------------------------------<br><br>
    ${content.html}
    <br><br>--------------------------------------<br>
    <font color="#CD5C5C">已自动去重，重点关注 A股 / 政策 / 板块 / 重点个股</font>
  </p>`;

  console.log("FinanceNews done");

  done(title, content.plain, html);
}

main().catch(e => {
  const msg = "财经新闻脚本异常：" + e;
  console.log(msg);
  notify("财经股市新闻", "脚本异常", msg);
  done("财经股市新闻", msg, `<p>${msg}</p>`);
});