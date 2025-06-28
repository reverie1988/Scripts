// 名称: Access-Token 提取器（完整显示）
// 描述: 从目标API提取 access-token 并在通知中完整显示
// 目标域名: msmarket.msx.digitalyili.com
// 更新时间: 2025-06-29

console.log("🛠️ 脚本开始执行...");

if ($request.method === 'GET' && 
    $request.url.includes('/gateway/api/auth/account/user/info')) {
    
    const token = $request.headers['access-token'];
    
    if (token) {
        console.log("✅ 提取成功:", token);
        
        // 推送通知（完整显示 Token）
        try {
            if (typeof $notify !== 'undefined') {
                $notify(
                    "🎯 Access-Token 已捕获", 
                    "完整 Token 如下👇", 
                    token // 直接显示完整 Token
                );
            } else {
                console.log("ℹ️ 通知API不可用，请查看日志获取完整 Token");
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
        
        // 高亮输出 Token 到日志
        const divider = "━".repeat(40);
        console.log(`\n${divider}\n📌 完整 Token:\n${token}\n${divider}\n`);
        
    } else {
        console.log("❌ 请求头中未找到 access-token");
    }
} else {
    console.log("⏩ 非目标请求，跳过处理");
}

$done({});
