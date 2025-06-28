// 重写规则名称：提取并推送Member数据
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

function getMemberData() {
    try {
        // 获取请求头
        const headers = $request.headers;
        
        // 查找member头（不区分大小写）
        const memberHeader = headers['member'] || headers['Member'] || headers['MEMBER'];
        
        if (!memberHeader) {
            // 如果没有找到member头，列出所有请求头用于调试
            const allHeaders = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');
            $notify('⚠️ Member头未找到', '请检查请求头', `未发现member字段\n\n完整请求头:\n${allHeaders}`);
            return;
        }
        
        // 解析JSON数据
        const memberData = JSON.parse(memberHeader);
        
        // 验证必要字段
        if (!memberData.id || !memberData.token) {
            throw new Error('Member数据缺少必要字段');
        }
        
        // 解码昵称（如果是URL编码）
        const nickname = memberData.nick_name && memberData.nick_name.startsWith('%') 
            ? decodeURIComponent(memberData.nick_name) 
            : memberData.nick_name || '未知';
        
        // 构造推送消息
        const message = `
🎯 会员数据提取成功
━━━━━━━━━━━━━━
👤 昵称: ${nickname}
📱 手机: ${memberData.mobile || '未绑定'}
🆔 ID: ${memberData.id}
🔐 Token: ${memberData.token.substring(0, 6)}******
⏰ 过期时间: ${memberData.expire ? new Date(memberData.expire * 1000).toLocaleString() : '未知'}
━━━━━━━━━━━━━━
ℹ️ 数据已保存至本地
        `;
        
        // 发送通知
        $notify('✅ 会员数据提取', nickname, message.trim());
        
        // 保存完整数据到持久化存储
        $prefs.setValueForKey(JSON.stringify(memberData, null, 2), 'last_member_data');
        
    } catch (error) {
        $notify('❌ 处理Member数据失败', '错误详情', error.message);
    }
}

// 执行主函数
getMemberData();
$done({});
