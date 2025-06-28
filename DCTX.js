// ==Quantumult X 重写脚本==
// @name Member数据提取器
// @description 从m.aihoge.com请求中提取member信息并推送
// @version 2.0

(function() {
    'use strict';
    
    // 调试信息头
    console.log("🚀===== Member提取脚本启动 =====");
    
    // 1. 验证执行环境
    if (typeof $request === 'undefined') {
        console.log("❌ 错误：未在Quantumult X环境中运行");
        return;
    }
    
    // 2. 提取member数据（兼容大小写）
    const memberKey = Object.keys($request.headers).find(k => 
        k.toLowerCase() === 'member'
    );
    
    if (!memberKey) {
        console.log("⚠️ 未找到member请求头");
        $notification.post("提取失败", "请求头缺少member字段", $request.url);
        return $done();
    }
    
    const rawMember = $request.headers[memberKey];
    console.log("📦 原始member数据:", rawMember);
    
    // 3. 数据处理
    try {
        // 处理URL编码的nick_name
        const decodedMember = rawMember.replace(/%([0-9A-F]{2})/g, (_, p1) => 
            String.fromCharCode('0x' + p1)
        );
        
        const memberObj = JSON.parse(decodedMember);
        console.log("✅ 解析后的member对象:", JSON.stringify(memberObj, null, 2));
        
        // 4. 格式化推送内容
        const notifyContent = `
👤 用户ID: ${memberObj.id}
📱 手机号: ${memberObj.mobile || "未绑定"}
🔑 主Token: ${memberObj.token.slice(0, 6)}...${memberObj.token.slice(-4)}
🛡️ 设备标识: ${memberObj.mark}
⏰ 过期时间: ${new Date(memberObj.expire * 1000).toLocaleString()}
        `.trim();
        
        // 5. 发送通知
        $notification.post(
            "🎯 会员信息提取成功", 
            `来源: ${memberObj.source}`, 
            notifyContent,
            { "open-url": $request.url }
        );
        
        // 6. 数据持久化存储
        $persistentStore.write(decodedMember, "latest_member_data");
        console.log("💾 数据已保存到持久化存储");
        
    } catch (e) {
        console.log("❌ 解析错误:", e);
        $notification.post(
            "⚠️ Member数据解析失败",
            e.message,
            rawMember.slice(0, 100) + "..."
        );
    }
    
    console.log("🏁===== 脚本执行完成 =====");
    $done();
})();
