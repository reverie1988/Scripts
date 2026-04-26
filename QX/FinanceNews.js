/******************************
 * Quantumult X 每日财经新闻推送
 * 文件名：DailyFinanceNews.js
 *
 * 来源：微信公众号文章
 * 格式：
 * 2026年4月26日 / 星期日
 * 来源：财经早餐
 *
 * ► 央广网：......
 *
 * ► 证券时报：......
 *
 *        宏观经济
 *
 * 1、央视新闻：......
 ******************************/

console.log("DailyFinanceNews start");

const CONFIG = {
  URL: "https://mp.weixin.qq.com/s/HX8JBsmH4YrvQqNUGb6XwQ",

  TITLE: "每日财经新闻",
  DEFAULT_SOURCE: "财经早餐",

  TIMEOUT: 15000,

  // 每个分组最多保留多少条
  MAX_SECTION_ITEMS: 20,

  // 顶部摘要最多保留多少条
  MAX_TOP_ITEMS: 10,

  // 单条最长字数
  MAX_ITEM_LENGTH: 800,

  // 是否显示原文链接
  SHOW_LINK: false,

  // 不建议把 Cookie 上传到 GitHub
  // 访问失败时，可只在本地填写 Cookie
  COOKIE: ""
};

const SECTION_TITLES = [
  "宏观经济",
  "地产动态",
  "股市盘点",
  "财富聚焦",
  "行业观察",
  "公司要闻",
  "环球视野",
  "金融数据",
  "楼市动态",
  "产业观察",
  "国内财经",
  "国际财经",
  "债市观察",
  "期货市场",
  "商品市场",
  "基金动态",
  "今日关注",
  "财经要闻",
  "市场动态",
  "国内新闻",
  "国际新闻",
  "产业新闻",
  "公司新闻"
];

const NOISE_WORDS = [
  "点击上方",
  "蓝字关注",
  "关注我们",
  "设为星标",
  "微信扫一扫",
  "继续滑动看下一个",
  "轻触阅读原文",
  "点击阅读原文",
  "喜欢此内容的人还喜欢",
  "分享到朋友圈",
  "分享、点赞、在看",
  "广告",
  "免责声明",
  "风险提示",
  "投资有风险",
  "仅供参考",
  "不构成投资建议",
  "财经早餐",
  "FEMORNING"
];

function fetchPage(url) {
  return new Promise(resolve => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Connection": "keep-alive"
    };

    if (CONFIG.COOKIE && CONFIG.COOKIE.trim()) {
      headers["Cookie"] = CONFIG.COOKIE.trim();
    }

    const req = {
      url,
      method: "GET",
      timeout: CONFIG.TIMEOUT,
      headers
    };

    const timer = setTimeout(() => {
      resolve({
        ok: false,
        statusCode: 0,
        body: "",
        error: "timeout"
      });
    }, CONFIG.TIMEOUT + 3000);

    $task.fetch(req).then(resp => {
      clearTimeout(timer);

      resolve({
        ok: resp.statusCode >= 200 && resp.statusCode < 400,
        statusCode: resp.statusCode,
        body: resp.body || "",
        error: ""
      });
    }, err => {
      clearTimeout(timer);

      resolve({
        ok: false,
        statusCode: 0,
        body: "",
        error: stringifyError(err)
      });
    });
  });
}

function stringifyError(err) {
  try {
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

function decodeHtml(str) {
  if (!str) return "";

  return String(str)
    .replace(/\\x26/g, "&")
    .replace(/\\x3c/g, "<")
    .replace(/\\x3e/g, ">")
    .replace(/\\x22/g, "\"")
    .replace(/\\x27/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ensp;/g, " ")
    .replace(/&emsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanText(str) {
  if (!str) return "";

  return decodeHtml(str)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtmlToText(html) {
  if (!html) return "";

  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<img[\s\S]*?>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/section>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h\d>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/►/g, "\n► ")
    .replace(/每日金曲[:：][\s\S]*?(?=\n►|\n\d+[、.．]|\n宏观经济|\n地产动态|\n股市盘点|\n财富聚焦|\n行业观察|\n公司要闻|\n环球视野|\n金融数据)/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cutText(str, maxLen) {
  str = String(str || "").trim();

  if (str.length <= maxLen) return str;

  return str.slice(0, maxLen).trim() + "……";
}

function todayDateText() {
  const d = new Date();
  const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 / ${weeks[d.getDay()]}`;
}

function dateFromTimestamp(ts) {
  if (!ts) return "";

  const d = new Date(Number(ts) * 1000);
  if (isNaN(d.getTime())) return "";

  const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 / ${weeks[d.getDay()]}`;
}

function centerLine(text, totalWidth = 26) {
  text = String(text || "").trim();
  const displayLength = text.replace(/[^\x00-\xff]/g, "xx").length;
  const spaceCount = Math.max(0, Math.floor((totalWidth * 2 - displayLength) / 4));
  return " ".repeat(spaceCount) + text;
}

function pickMeta(html, name) {
  if (!html) return "";

  const reg1 = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );

  const reg2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`,
    "i"
  );

  const m = html.match(reg1) || html.match(reg2);
  return m && m[1] ? cleanText(m[1]) : "";
}

function extractWxTitle(html) {
  let title = "";

  const m =
    html.match(/var\s+msg_title\s*=\s*['"]([^'"]+)['"]/i) ||
    html.match(/msg_title\s*=\s*['"]([^'"]+)['"]/i);

  if (m && m[1]) title = decodeHtml(m[1]);

  if (!title) {
    title = pickMeta(html, "og:title") || pickMeta(html, "twitter:title");
  }

  if (!title) {
    const mt = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (mt && mt[1]) title = stripHtmlToText(mt[1]);
  }

  return cleanText(title)
    .replace(/微信公众平台/g, "")
    .trim();
}

function extractWxAuthor(html) {
  let author = "";

  const m =
    html.match(/var\s+nickname\s*=\s*['"]([^'"]+)['"]/i) ||
    html.match(/nickname\s*=\s*['"]([^'"]+)['"]/i);

  if (m && m[1]) author = decodeHtml(m[1]);

  if (!author) {
    author =
      pickMeta(html, "og:article:author") ||
      pickMeta(html, "author") ||
      CONFIG.DEFAULT_SOURCE;
  }

  author = cleanText(author);

  if (!author || author.includes("微信公众平台")) {
    author = CONFIG.DEFAULT_SOURCE;
  }

  return author;
}

function extractWxDate(html) {
  const m =
    html.match(/var\s+ct\s*=\s*["']?(\d{10})["']?/i) ||
    html.match(/ct\s*=\s*["']?(\d{10})["']?/i);

  if (m && m[1]) {
    const date = dateFromTimestamp(m[1]);
    if (date) return date;
  }

  return todayDateText();
}

function extractWxContentHtml(html) {
  if (!html) return "";

  let m = html.match(/<div[^>]+id=["']js_content["'][^>]*>([\s\S]*?)<\/div>\s*<script/i);
  if (m && m[1]) return m[1];

  m = html.match(/<div[^>]+id=["']js_content["'][^>]*>([\s\S]*)/i);
  if (m && m[1]) {
    const sub = m[1];
    const idx = sub.search(/<script/i);
    return idx >= 0 ? sub.slice(0, idx) : sub;
  }

  return "";
}

function normalizeLine(line) {
  line = cleanText(line)
    .replace(/^[\s　]+|[\s　]+$/g, "")
    .replace(/^[-—*•●]+/g, "")
    .replace(/^\d{1,2}\s*$/g, "")
    .replace(/^FEMORNING$/i, "")
    .replace(/^FE\s*MORNING$/i, "")
    .replace(/^No\.\d+$/i, "")
    .trim();

  // 保留摘要前面的 ►
  line = line.replace(/^►\s*/, "► ");

  // 把英文冒号统一成中文冒号
  line = line.replace(/^([^：:\s]{1,20}):/, "$1：");

  return line;
}

function isNoiseLine(line) {
  if (!line) return true;

  const t = line.trim();

  if (t.length <= 1) return true;
  if (/^\d{1,2}$/.test(t)) return true;
  if (/^[—\-_=]+$/.test(t)) return true;
  if (/^[A-Z\s]{2,20}$/.test(t) && !/[一-龥]/.test(t)) return true;

  if (/^每日金曲[:：]/.test(t)) return true;
  if (/^歌曲[:：]/.test(t)) return true;
  if (/^音乐[:：]/.test(t)) return true;

  for (const w of NOISE_WORDS) {
    if (t.includes(w)) return true;
  }

  return false;
}

function isSectionTitle(line) {
  const t = line.replace(/\s+/g, "").trim();

  return SECTION_TITLES.some(s => t === s);
}

function normalizedSectionTitle(line) {
  const t = line.replace(/\s+/g, "").trim();
  const hit = SECTION_TITLES.find(s => t === s);
  return hit || line.trim();
}

function startsWithNumber(line) {
  return /^\d{1,2}[、.．]\s*/.test(line);
}

function removeNumberPrefix(line) {
  return line.replace(/^\d{1,2}[、.．]\s*/, "").trim();
}

function hasSourceColon(line) {
  const m = line.match(/^([一-龥A-Za-z0-9·（）()]{2,18})[：:]/);
  if (!m) return false;

  const source = m[1];

  if (source.length > 18) return false;
  if (/^\d+$/.test(source)) return false;

  return true;
}

function splitSourceArticle(text) {
  const lines = text
    .split(/\n+/)
    .map(normalizeLine)
    .filter(line => !isNoiseLine(line));

  const topItems = [];
  const sections = [];

  let currentSection = null;
  let currentItem = null;
  let reachedSection = false;

  function pushCurrentItem() {
    if (!currentItem) return;

    currentItem = cutText(currentItem.trim(), CONFIG.MAX_ITEM_LENGTH);

    if (!currentItem) {
      currentItem = null;
      return;
    }

    if (currentSection) {
      if (currentSection.items.length < CONFIG.MAX_SECTION_ITEMS) {
        currentSection.items.push(currentItem);
      }
    } else {
      if (topItems.length < CONFIG.MAX_TOP_ITEMS) {
        topItems.push(currentItem);
      }
    }

    currentItem = null;
  }

  function pushSection(title) {
    pushCurrentItem();

    currentSection = {
      title,
      items: []
    };

    sections.push(currentSection);
    reachedSection = true;
  }

  for (let raw of lines) {
    let line = normalizeLine(raw);
    if (!line || isNoiseLine(line)) continue;

    if (isSectionTitle(line)) {
      pushSection(normalizedSectionTitle(line));
      continue;
    }

    if (/^►\s*/.test(line)) {
      pushCurrentItem();
      currentItem = line.replace(/^►\s*/, "► ");
      continue;
    }

    if (startsWithNumber(line)) {
      pushCurrentItem();
      currentItem = removeNumberPrefix(line);
      continue;
    }

    if (hasSourceColon(line)) {
      pushCurrentItem();

      if (!currentSection) {
        currentItem = "► " + line;
      } else {
        currentItem = line;
      }

      continue;
    }

    // 普通续行
    if (currentItem) {
      currentItem += line.match(/^[，。；、,.!?！？]/) ? line : line;
    } else {
      if (!reachedSection && line.length >= 12) {
        currentItem = line;
      }
    }
  }

  pushCurrentItem();

  const validSections = sections.filter(s => s.items && s.items.length > 0);

  return {
    topItems,
    sections: validSections
  };
}

function parseFinanceArticle(html) {
  const title = extractWxTitle(html);
  const source = extractWxAuthor(html);
  const date = extractWxDate(html);
  const contentHtml = extractWxContentHtml(html);

  let text = stripHtmlToText(contentHtml);

  if (!text) {
    text = pickMeta(html, "og:description") || pickMeta(html, "description");
  }

  const parsed = splitSourceArticle(text);

  return {
    title,
    source,
    date,
    topItems: parsed.topItems,
    sections: parsed.sections,
    rawText: text
  };
}

function buildPlain(data) {
  const lines = [];

  lines.push(data.date);
  lines.push(`来源：${data.source || CONFIG.DEFAULT_SOURCE}`);
  lines.push("");

  for (const item of data.topItems) {
    let text = item.trim();

    if (!text.startsWith("►")) {
      text = "► " + text;
    }

    lines.push(text);
    lines.push("");
  }

  for (const sec of data.sections) {
    lines.push(centerLine(sec.title, 26));
    lines.push("");

    sec.items.forEach((item, index) => {
      lines.push(`${index + 1}、${item}`);
      lines.push("");
    });
  }

  if (CONFIG.SHOW_LINK) {
    lines.push("原文链接：");
    lines.push(CONFIG.URL);
  }

  return lines.join("\n").trim();
}

function buildHtml(data) {
  const topHtml = data.topItems.map(item => {
    let text = item.trim();

    if (!text.startsWith("►")) {
      text = "► " + text;
    }

    return `
      <div style="
        margin: 0 0 20px 0;
        line-height: 1.75;
        font-size: 16px;
        font-weight: 500;
        color: #222;
      ">
        ${escapeHtml(text)}
      </div>
    `;
  }).join("");

  const sectionsHtml = data.sections.map(sec => {
    const itemsHtml = sec.items.map((item, index) => {
      return `
        <div style="
          margin: 0 0 16px 0;
          line-height: 1.75;
          font-size: 16px;
          font-weight: 500;
          color: #222;
        ">
          ${index + 1}、${escapeHtml(item)}
        </div>
      `;
    }).join("");

    return `
      <div style="margin-top: 30px; margin-bottom: 18px; text-align: center;">
        <span style="
          display: inline-block;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #333;
        ">
          ${escapeHtml(sec.title)}
        </span>
      </div>

      ${itemsHtml}
    `;
  }).join("");

  const linkHtml = CONFIG.SHOW_LINK
    ? `
      <div style="margin-top:24px;font-size:13px;color:#999;line-height:1.5;">
        原文链接：<br>
        <a href="${CONFIG.URL}">${CONFIG.URL}</a>
      </div>
    `
    : "";

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      padding: 18px;
      background: #fffdf6;
      color: #222;
    ">
      <div style="margin-bottom: 22px;">
        <div style="
          font-size: 16px;
          color: #555;
          font-weight: 700;
          margin-bottom: 8px;
        ">
          ${escapeHtml(data.date)}
        </div>

        <div style="
          font-size: 15px;
          color: #666;
          font-weight: 600;
        ">
          来源：${escapeHtml(data.source || CONFIG.DEFAULT_SOURCE)}
        </div>
      </div>

      ${topHtml}

      ${sectionsHtml}

      ${linkHtml}
    </div>
  `;
}

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
      title,
      content,
      htmlMessage: html
    });
  } catch (e) {
    $done();
  }
}

async function main() {
  const resp = await fetchPage(CONFIG.URL);

  if (!resp.ok || !resp.body) {
    const msg = `每日财经新闻获取失败\nstatus=${resp.statusCode || ""}\nerror=${resp.error || ""}`;

    console.log(msg);
    notify(CONFIG.TITLE, "获取失败", msg);
    done(CONFIG.TITLE, msg, `<p>${escapeHtml(msg).replace(/\n/g, "<br>")}</p>`);
    return;
  }

  const data = parseFinanceArticle(resp.body);

  const totalCount =
    (data.topItems ? data.topItems.length : 0) +
    (data.sections || []).reduce((sum, s) => sum + s.items.length, 0);

  console.log(`Parsed topItems=${data.topItems.length}, sections=${data.sections.length}, total=${totalCount}`);

  if (!totalCount) {
    const preview = cutText(data.rawText || "", 1000);
    const msg =
      "已访问页面，但没有解析到有效财经新闻内容。\n" +
      "可能是微信公众号反爬、需要 Cookie，或文章结构变化。\n\n" +
      "正文预览：\n" +
      preview;

    console.log(msg);
    notify(CONFIG.TITLE, "解析失败", msg);
    done(CONFIG.TITLE, msg, `<p>${escapeHtml(msg).replace(/\n/g, "<br>")}</p>`);
    return;
  }

  const plain = buildPlain(data);
  const html = buildHtml(data);

  // 通知标题不显示时间
  notify(CONFIG.TITLE, "", plain);

  console.log("DailyFinanceNews done");

  done(CONFIG.TITLE, plain, html);
}

main().catch(e => {
  const msg = "脚本异常：" + stringifyError(e);

  console.log(msg);
  notify(CONFIG.TITLE, "脚本异常", msg);
  done(CONFIG.TITLE, msg, `<p>${escapeHtml(msg)}</p>`);
});