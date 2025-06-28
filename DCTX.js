// 重写规则名称：精确格式推送Member数据
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/lotteryhy\/api\/client\/cj\/send\/pak

function pushMemberDataWithExactFormat() {
    try {
        // 获取请求头
        const headers = $request.headers;
        
        // 查找member头（不区分大小写）
        const memberHeader = headers['member'] || headers['Member'] || headers['MEMBER'];
        
        if (!memberHeader) {
            $notify('❌ 提取失败', '', '未在请求头中找到member字段');
            return;
        }
        
        // 直接使用原始member字符串，确保格式完全一致
        const memberJson = memberHeader.trim();
        
        // 验证JSON格式
        JSON.parse(memberJson);
        
        // 解码昵称用于通知标题
        let nickname = '未知用户';
        try {
            const memberData = JSON.parse(memberJson);
            nickname = memberData.nick_name && memberData.nick_name.startsWith('%') 
                ? decodeURIComponent(memberData.nick_name) 
                : memberData.nick_name || '未知用户';
        } catch (e) {
            nickname = '未知用户';
        }
        
        // 发送通知（使用原始member字符串）
        $notify(
            `📌 Member数据 [${nickname}]`,
            '',
            memberJson,
            {
                // 点击通知后复制全部内容到剪贴板
                'copy': memberJson,
                // 使用文档图标
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dc.png'
            }
        );
        
        // 保存到持久化存储（原始格式）
        $prefs.setValueForKey(memberJson, 'last_member_data');
        
    } catch (error) {
        $notify('❌ 处理Member数据失败', '', error.message);
    }
}

// 执行主函数
pushMemberDataWithExactFormat();
$done({});
