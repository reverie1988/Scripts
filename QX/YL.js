// 项目: 伊利
// 名称: Access-Token 提取器
// [mitm] msmarket.msx.digitalyili.com
// [rewrite_local] ^https:\/\/msmarket\.msx\.digitalyili\.com\/gateway\/api\/auth\/account\/user\/info -url script-response-header https://raw.githubusercontent.com/reverie1988/Scripts/refs/heads/main/QX/YL.js

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
