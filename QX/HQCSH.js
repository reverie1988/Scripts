// == 终极 Cookie 提取脚本（带完整调试）==
(() => {
    // 调试模式开关（设为 true 显示完整请求信息）
    const DEBUG_MODE = true;
    
    // 1. 获取完整请求信息
    const dumpRequest = () => {
        return {
            url: $request?.url,
            method: $request?.method,
            headers: $request?.headers,
            body: $request?.body
        };
    };

    // 2. 调试输出
    if (DEBUG_MODE) {
        console.log("[Debug] 完整请求结构:\n" + JSON.stringify(dumpRequest(), null, 2));
    }

    // 3. 检查 Cookie 是否存在（兼容大小写）
    const headers = $request?.headers || {};
    const cookie = headers['Cookie'] || headers['cookie'] || '';
    
    if (!cookie) {
        const errorMsg = "[Error] 请求头中未找到 Cookie 字段";
        console.log(errorMsg);
        
        // 尝试用更原始的方式获取 Cookie（某些特殊环境）
        const rawHeaders = $request?.rawHeaders || [];
        for (let i = 0; i < rawHeaders.length; i += 2) {
            if (rawHeaders[i].toLowerCase() === 'cookie') {
                const foundCookie = rawHeaders[i + 1];
                console.log("[Notice] 通过 rawHeaders 找到 Cookie:", foundCookie);
                processCookie(foundCookie);
                return;
            }
        }
        
        console.log("[Debug] 所有请求头键名:", Object.keys(headers));
        return $done();
    }

    // 4. 处理 Cookie 的主逻辑
    function processCookie(cookieStr) {
        // 增强版正则（支持更多变体）
        const regex = /(uid[^=]*)=([^;]+)/i;
        const match = cookieStr.match(regex);
        
        if (match) {
            const [_, name, value] = match;
            const successMsg = `[Success] 提取到动态 Cookie:\n${name}=${value}`;
            console.log(successMsg);
            
            // 环境兼容的输出方式
            try {
                // 尝试所有可能的通知方式
                if (typeof $notification !== 'undefined') {
                    $notification.post("Cookie 提取成功", `名称: ${name}`, value);
                } else if (typeof $notify !== 'undefined') {
                    $notify("Cookie 提取成功", `名称: ${name}`, value);
                } else {
                    console.log(successMsg);
                }
                
                // 尝试写入剪贴板（iOS 捷径兼容）
                if (typeof $clipboard !== 'undefined') {
                    $clipboard.setString(value);
                    console.log("[Notice] 已复制到剪贴板");
                }
            } catch (e) {
                console.log("[Notice] 通知/剪贴板功能不可用");
            }
            
            return $done({ cookieName: name, cookieValue: value });
        }
        
        console.log("[Error] Cookie 中未找到 uid 开头的键值");
        console.log("[Debug] 原始 Cookie:", cookieStr);
    }

    // 执行主逻辑
    processCookie(cookie);
})();
