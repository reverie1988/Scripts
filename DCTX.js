// ==Quantumult X 响应体脚本==
// 必须作为response-type脚本使用
(() => {
    // 环境检测
    const isQX = typeof $response !== 'undefined';
    if (!isQX) {
        console.log("❌ 请确保脚本用于Quantumult X重写规则");
        return;
    }

    console.log("🔍 开始处理请求...");
    
    // 获取请求头（兼容不同QX版本）
    const headers = $request?.headers || $response?.headers || {};
    console.log("📋 请求头:", JSON.stringify(headers, null, 2));

    // 查找member字段（不区分大小写）
    const memberKey = Object.keys(headers).find(k => 
        k.toLowerCase() === 'member'
    ) || 'member'; // 默认键名
    
    if (!headers[memberKey]) {
        console.log("⚠️ 未找到member数据");
        return $done({});
    }

    try {
        // 处理数据
        const rawData = headers[memberKey];
        const decodedData = decodeURIComponent(rawData);
        const member = JSON.parse(decodedData);
        
        console.log("✅ 解析结果:", JSON.stringify(member, null, 2));
        
        // 发送通知（带错误捕获）
        try {
            $notification.post(
                '会员数据提取',
                `用户: ${member.nick_name || '未知'}`,
                `Token: ${member.token?.slice(0, 6)}...`
            );
        } catch (e) {
            console.log("⚠️ 通知发送失败:", e);
        }
        
        // 存储数据
        $persistentStore.write(decodedData, 'member_cache');
        
    } catch (e) {
        console.log("❌ 数据处理失败:", e);
        console.log("原始数据:", headers[memberKey]);
    }
    
    $done({});
})();
