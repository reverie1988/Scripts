// ==Quantumult X重写脚本==
// @name Member信息提取器
// @description 从m.aihoge.com的API请求中提取member信息
// @version 1.1

console.log("🔍 [MemberExtract] 调试模式启动 ================");

// 调试输出完整请求信息
console.log("🌐 请求URL:", $request.url);
console.log("📝 请求方法:", $request.method);
console.log("📋 请求头:", JSON.stringify($request.headers, null, 2));

// 提取member字段（兼容大小写）
const memberHeader = Object.keys($request.headers).find(key => 
    key.toLowerCase() === 'member'
);

if (memberHeader) {
    const memberData = $request.headers[memberHeader];
    
    // 深度解码JSON数据（处理URL编码的nick_name）
    try {
        const decodedMember = JSON.parse(
            memberData.replace(/%([0-9A-F]{2})/g, (match, p1) => 
                String.fromCharCode('0x' + p1)
            )
        );
        
        console.log("✅ 提取到的member数据:", JSON.stringify(decodedMember, null, 2));
        
        // 格式化推送内容
        const pushContent = `
🆔 ID: ${decodedMember.id}
📱 手机: ${decodedMember.mobile || '未绑定'}
🔑 Token: ${decodedMember.token.slice(0, 6)}...${decodedMember.token.slice(-6)}
⏳ 过期: ${new Date(decodedMember.expire * 1000).toLocaleString()}
📛 昵称: ${decodedMember.nick_name}
        `.trim();
        
        // 发送通知（带超链接）
        $notification.post(
            '🎯 Member信息提取成功', 
            `来源: ${decodedMember.source}`,
            pushContent,
            { 'open-url': $request.url }
        );
        
        // 持久化存储（供其他脚本使用）
        $persistentStore.write(
            JSON.stringify(decodedMember),
            'member_auth_data'
        );
        
    } catch (e) {
        console.log("❌ JSON解析失败:", e);
        $notification.post(
            '⚠️ Member解析错误',
            '请检查数据格式',
            memberData.slice(0, 100) + '...'
        );
    }
} else {
    console.log("❌ 未找到member请求头");
    $notification.post(
        '⚠️ Member提取失败',
        $request.url,
        '请求头中未找到member字段'
    );
}

console.log("🔚 [MemberExtract] 脚本执行结束 ================");
$done();
