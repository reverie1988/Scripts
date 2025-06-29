// 增强版 Cookie 提取脚本
(() => {
    // 获取请求头（兼容大小写）
    const headers = $request?.headers || {};
    const cookie = headers['Cookie'] || headers['cookie'] || '';
    
    if (!cookie) {
        console.log("[Error] 请求头中未找到 Cookie");
        // 兼容没有 $notification 的环境
        try {
            $notification?.post("Cookie 提取失败", "请求头中未找到 Cookie", "");
        } catch (e) {
            console.log("[Notice] 当前环境不支持 $notification API");
        }
        return $done();
    }
    
    // 动态匹配 uid- 开头的 Cookie（更健壮的正则）
    const regex = /(uid-[a-zA-Z0-9\-_]+)=([^;]+)/i;
    const match = cookie.match(regex);
    
    if (match) {
        const [fullMatch, cookieName, cookieValue] = match;
        console.log(`[Success] 提取到动态 Cookie:\n${cookieName}=${cookieValue}`);
        
        // 兼容性通知处理
        const notify = (title, subtitle, body) => {
            try {
                $notification?.post(title, subtitle, body);
            } catch {
                console.log(`[Notice] ${title}: ${subtitle}`);
            }
        };
        
        notify("Cookie 提取成功", `名称: ${cookieName}\n值: ${cookieValue}`, "");
        
        // 持久化存储（可选）
        try {
            $persistentStore?.write(cookieValue, "latest_uid_cookie");
        } catch (e) {
            console.log("[Notice] 持久化存储不可用");
        }
        
        return $done({ cookieName, cookieValue });
    }
    
    console.log("[Error] 未找到 uid- 开头的 Cookie");
    try {
        $notification?.post("Cookie 提取失败", "未找到 uid- 开头的 Cookie", "");
    } catch {
        console.log("[Notice] 未找到目标 Cookie");
    }
    $done();
})();
