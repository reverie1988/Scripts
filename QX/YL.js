// 名称: Access-Token 提取器
// 描述: 从指定API提取access-token并推送通知
// 目标域名: msmarket.msx.digitalyili.com
// 更新时间: 2025-06-29

console.log("🛠️ 脚本开始执行...");

// 调试信息输出
const showDebugInfo = true; // 设为false关闭调试日志
if (showDebugInfo) {
    console.log("🔍 请求URL:", $request.url);
    console.log("📋 请求方法:", $request.method);
}

// 主提取逻辑
if ($request.method === 'GET' && 
    $request.url.includes('/gateway/api/auth/account/user/info')) {
    
    const token = $request.headers['access-token'];
    
    if (token) {
        console.log("✅ 提取成功:", token);
        
        // 推送通知（兼容写法）
        try {
            if (typeof $notify !== 'undefined') {
                $notify("🎯 Access-Token 已捕获", 
                       "点击查看详情", 
                       token.substring(0, 16) + "...");
            } else {
                console.log("ℹ️ 通知API不可用，请查看日志获取完整token");
            }
            
            // 自动复制到剪贴板（仅TF/越狱版支持）
            try {
                if (typeof $clipboard !== 'undefined') {
                    $clipboard.setString(token);
                    console.log("📋 已自动复制到剪贴板");
                }
            } catch (e) {}
            
        } catch (e) {
            console.log("⚠️ 通知发送失败:", e);
        }
        
        // 高亮输出token到日志
        const divider = "━".repeat(40);
        console.log(`\n${divider}\n📌 完整Token:\n${token}\n${divider}\n`);
        
    } else {
        console.log("❌ 请求头中未找到access-token");
    }
} else {
    console.log("⏩ 非目标请求，跳过处理");
}

$done({});
