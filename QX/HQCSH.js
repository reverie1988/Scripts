// 获取请求头中的 Cookie
const cookie = $request.headers['Cookie'] || $request.headers['cookie'];

if (!cookie) {
    console.log("未找到 Cookie 头");
    $notification.post("Cookie 提取失败", "请求头中未找到 Cookie", "");
    $done();
}

// 使用正则匹配 uid- 开头的 Cookie 值
const regex = /uid-[^=]+=([^;]+)/;
const match = cookie.match(regex);

if (match && match[1]) {
    const cookieName = match[0].split('=')[0]; // 提取完整的 Cookie 名（如 uid-xxxx-xxxx）
    const cookieValue = match[1];
    
    console.log(`提取到的 Cookie: ${cookieName}=${cookieValue}`);
    
    // 发送通知
    $notification.post("Cookie 提取成功", `Cookie 名: ${cookieName}\n值: ${cookieValue}`, "");
    
    // 可选：存储到持久化变量
    $persistentStore.write(cookieValue, "dynamic_uid_cookie_value");
    
    // 可选：传递给其他脚本
    $done({ cookieName, cookieValue });
} else {
    console.log("未找到 uid- 开头的 Cookie");
    $notification.post("Cookie 提取失败", "未找到 uid- 开头的 Cookie", "");
}

$done();
