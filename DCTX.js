// 重写规则名称：提取member数据并推送
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

$task.fetch({
    url: $request.url,
    method: $request.method,
    headers: $request.headers,
    body: $request.body
}).then(response => {
    try {
        // 获取member头数据
        const memberHeader = response.headers['member'] || response.headers['Member'];
        if (!memberHeader) {
            throw new Error('未找到member头数据');
        }
        
        // 解析JSON数据
        const memberData = JSON.parse(memberHeader);
        
        // 构造推送消息
        let message = `🎯 成功提取会员数据\n`;
        message += `👤 昵称: ${decodeURIComponent(memberData.nick_name)}\n`;
        message += `📱 手机: ${memberData.mobile || '未绑定'}\n`;
        message += `🆔 ID: ${memberData.id}\n`;
        message += `🔑 Token: ${memberData.token.substring(0, 6)}...\n`;
        message += `⏱ 过期时间: ${new Date(memberData.expire * 1000).toLocaleString()}`;
        
        // 发送通知
        $notify('会员数据提取成功', '', message);
        
        // 可选：将数据保存到持久化存储
        $prefs.setValueForKey(JSON.stringify(memberData), 'last_member_data');
        
        $done({});
    } catch (error) {
        $notify('提取member数据失败', '', error.message);
        $done({});
    }
}, reason => {
    $notify('请求失败', '', reason.error);
    $done({});
});
