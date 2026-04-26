/*******************************
 * Quantumult X 策略/流媒体检测
 * 根据你的策略组名称定制
 *******************************/

const POLICIES = {
  HOME: "家里内网",
  PROXY: "策略选择",
  GPT: "GPT",
  GEMINI: "Gemini",
  GITHUB: "GitHub",
  YOUTUBE: "YouTube",
  NETFLIX: "Netflix",
  DISNEY: "Disney+",
  TELEGRAM: "Telegram"
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const TIMEOUT = 6000;

function flag(code) {
  if (!code) return "🏳️";
  code = code.toUpperCase();
  if (code === "UK") code = "GB";
  if (code.length !== 2) return code;
  return code.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function getHeader(headers, name) {
  if (!headers) return "";
  const target = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === target) return headers[k];
  }
  return "";
}

function fetchWithPolicy(url, policy, extra = {}) {
  const req = {
    url,
    method: extra.method || "GET",
    timeout: extra.timeout || TIMEOUT,
    opts: {
      policy: policy
    },
    headers: Object.assign({
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9"
    }, extra.headers || {})
  };

  if (extra.body) req.body = extra.body;
  if (extra.redirection === false) req.redirection = false;

  return $task.fetch(req);
}

async function getPolicyState(policy) {
  return new Promise(resolve => {
    const message = {
      action: "get_policy_state",
      content: policy
    };

    $configuration.sendMessage(message).then(res => {
      try {
        if (res && res.ret && res.ret[policy]) {
          const output = JSON.stringify(res.ret[policy])
            .replace(/\"|\[|\]/g, "")
            .replace(/,/g, " ➟ ");
          resolve(output);
        } else {
          resolve(policy);
        }
      } catch (e) {
        resolve(policy);
      }
    }, () => {
      resolve(policy);
    });
  });
}

async function safe(name, fn) {
  try {
    return await fn();
  } catch (e) {
    return `<b>${name}: </b>检测异常 ❗️`;
  }
}

async function checkHome() {
  const res = await fetchWithPolicy("http://192.168.31.1", POLICIES.HOME, {
    timeout: 5000
  });

  if (res.statusCode >= 200 && res.statusCode < 500) {
    return `<b>家里内网: </b>连通 ➟ 192.168.31.1 ✅`;
  }

  return `<b>家里内网: </b>未连通 🚫`;
}

async function checkGitHub() {
  const res = await fetchWithPolicy("https://raw.githubusercontent.com/github/gitignore/main/README.md", POLICIES.GITHUB);

  if (res.statusCode === 200 && res.body && res.body.indexOf("gitignore") !== -1) {
    return `<b>GitHub: </b>可访问 ✅`;
  }

  if (res.statusCode === 200) {
    return `<b>GitHub: </b>可访问 ✅`;
  }

  return `<b>GitHub: </b>异常 ➟ HTTP ${res.statusCode} 🚫`;
}

async function checkTelegram() {
  const res = await fetchWithPolicy("https://telegram.org/", POLICIES.TELEGRAM);

  if (res.statusCode === 200) {
    return `<b>Telegram: </b>可访问 ✅`;
  }

  return `<b>Telegram: </b>异常 ➟ HTTP ${res.statusCode} 🚫`;
}

async function checkYouTube() {
  const res = await fetchWithPolicy("https://www.youtube.com/premium", POLICIES.YOUTUBE);
  const body = res.body || "";

  if (res.statusCode !== 200) {
    return `<b>YouTube Premium: </b>检测失败 ➟ HTTP ${res.statusCode} ❗️`;
  }

  if (body.indexOf("Premium is not available in your country") !== -1) {
    return `<b>YouTube Premium: </b>未支持 🚫`;
  }

  let region = "US";
  const m = body.match(/"GL":"([A-Z]{2})"/);
  if (m && m[1]) region = m[1];

  return `<b>YouTube Premium: </b>支持 ➟ ⟦${flag(region)} ${region}⟧ 🎉`;
}

async function checkNetflix() {
  const filmId = "81280792";
  const res = await fetchWithPolicy(`https://www.netflix.com/title/${filmId}`, POLICIES.NETFLIX);
  const code = res.statusCode;

  if (code === 403) {
    return `<b>Netflix: </b>未支持 🚫`;
  }

  if (code === 404) {
    return `<b>Netflix: </b>仅支持自制剧 ⚠️`;
  }

  if (code === 200) {
    const originUrl = getHeader(res.headers, "X-Originating-URL");
    let region = "US";

    if (originUrl) {
      const parts = originUrl.split("/");
      if (parts.length >= 4 && parts[3] && parts[3] !== "title") {
        region = parts[3].split("-")[0].toUpperCase();
      }
    }

    return `<b>Netflix: </b>完整支持 ➟ ⟦${flag(region)} ${region}⟧ 🎉`;
  }

  return `<b>Netflix: </b>检测失败 ➟ HTTP ${code} ❗️`;
}

async function checkDisney() {
  const res = await fetchWithPolicy("https://www.disneyplus.com/", POLICIES.DISNEY);
  const body = res.body || "";

  if (res.statusCode !== 200) {
    return `<b>Disney+: </b>检测失败 ➟ HTTP ${res.statusCode} ❗️`;
  }

  if (body.indexOf("not available in your region") !== -1) {
    return `<b>Disney+: </b>未支持 🚫`;
  }

  let region = "";
  const m = body.match(/Region:\s*([A-Za-z]{2})/);
  if (m && m[1]) region = m[1].toUpperCase();

  if (region) {
    return `<b>Disney+: </b>可访问 ➟ ⟦${flag(region)} ${region}⟧ 🎉`;
  }

  return `<b>Disney+: </b>可访问 🎉`;
}

async function checkGPT() {
  const trace = await fetchWithPolicy("https://chatgpt.com/cdn-cgi/trace", POLICIES.GPT);
  let region = "";

  if (trace.statusCode === 200 && trace.body) {
    const m = trace.body.match(/loc=([A-Z]{2})/);
    if (m && m[1]) region = m[1];
  }

  const home = await fetchWithPolicy("https://chatgpt.com/", POLICIES.GPT, {
    redirection: false
  });

  const body = home.body || "";
  if (
    home.statusCode === 403 ||
    body.indexOf("unsupported_country") !== -1 ||
    body.indexOf("Sorry, you have been blocked") !== -1
  ) {
    return `<b>ChatGPT: </b>未支持${region ? ` ➟ ⟦${flag(region)} ${region}⟧` : ""} 🚫`;
  }

  if (home.statusCode >= 200 && home.statusCode < 400) {
    return `<b>ChatGPT: </b>可访问${region ? ` ➟ ⟦${flag(region)} ${region}⟧` : ""} 🎉`;
  }

  return `<b>ChatGPT: </b>检测失败 ➟ HTTP ${home.statusCode} ❗️`;
}

async function checkGemini() {
  const res = await fetchWithPolicy("https://gemini.google.com/", POLICIES.GEMINI, {
    redirection: false
  });

  if (res.statusCode >= 200 && res.statusCode < 400) {
    return `<b>Gemini: </b>可访问 🎉`;
  }

  if (res.statusCode === 403 || res.statusCode === 451) {
    return `<b>Gemini: </b>未支持 ➟ HTTP ${res.statusCode} 🚫`;
  }

  return `<b>Gemini: </b>检测失败 ➟ HTTP ${res.statusCode} ❗️`;
}

async function checkProxy() {
  const res = await fetchWithPolicy("http://www.gstatic.com/generate_204", POLICIES.PROXY, {
    timeout: 5000
  });

  if (res.statusCode === 204 || res.statusCode === 200) {
    return `<b>策略选择: </b>基础连通 ✅`;
  }

  return `<b>策略选择: </b>异常 ➟ HTTP ${res.statusCode} ❗️`;
}

async function main() {
  const results = await Promise.all([
    safe("家里内网", checkHome),
    safe("策略选择", checkProxy),
    safe("GitHub", checkGitHub),
    safe("Telegram", checkTelegram),
    safe("ChatGPT", checkGPT),
    safe("Gemini", checkGemini),
    safe("YouTube", checkYouTube),
    safe("Netflix", checkNetflix),
    safe("Disney+", checkDisney)
  ]);

  const statePolicies = [
    POLICIES.HOME,
    POLICIES.PROXY,
    POLICIES.GITHUB,
    POLICIES.GPT,
    POLICIES.GEMINI,
    POLICIES.YOUTUBE,
    POLICIES.NETFLIX,
    POLICIES.DISNEY,
    POLICIES.TELEGRAM
  ];

  const states = await Promise.all(
    statePolicies.map(async p => {
      const s = await getPolicyState(p);
      return `<b>${p}</b> ➟ ${s}`;
    })
  );

  const html = `
  <p style="text-align:center;font-family:-apple-system;font-size:large;">
    <b>策略 / 流媒体检测</b><br>
    --------------------------------------<br><br>
    ${results.join("<br><br>")}
    <br><br>--------------------------------------<br>
    <font color="#CD5C5C">${states.join("<br>")}</font>
  </p>`;

  $done({
    title: "策略/流媒体检测",
    htmlMessage: html
  });
}

main().catch(err => {
  $done({
    title: "策略/流媒体检测",
    htmlMessage: `<p style="text-align:center;">检测异常：${err}</p>`
  });
});