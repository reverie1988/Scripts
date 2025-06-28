// 重写规则名称：精确格式推送Member数据
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/lotteryhy\/api\/client\/cj\/send\/pak

function pushExactMemberFormat() {
    try {
        // 获取请求头
        const headers = $request.headers;
        
        // 查找member头（不区分大小写）
        const memberHeader = headers['member'] || headers['Member'] || headers['MEMBER'];
        
        if (!memberHeader) {
            $notify('❌ 提取失败', '', '未在请求头中找到member字段');
            return;
        }
        
        // 解析JSON数据
        const memberData = JSON.parse(memberHeader);
        
        // 解码昵称用于通知标题
        let nickname = '未知用户';
        try {
            nickname = memberData.nick_name && memberData.nick_name.startsWith('%') 
                ? decodeURIComponent(memberData.nick_name) 
                : memberData.nick_name || '未知用户';
        } catch (e) {
            nickname = memberData.nick_name || '未知用户';
        }
        
        // 生成完全紧凑的JSON字符串（无空格换行）
        const compactJson = JSON.stringify(memberData);
        
        // 发送通知（完全按照您要求的格式）
        $notify(
            `📌 Member数据 [${nickname}]`,
            '',
            compactJson,
            {
                // 点击通知后复制全部内容到剪贴板
                'copy': compactJson,
                // 使用文档图标
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dc.png'
            }
        );
        
        // 保存到持久化存储（同样使用紧凑格式）
        $prefs.setValueForKey(compactJson, 'last_member_data');
        
    } catch (error) {
        $notify('❌ 处理Member数据失败', '', error.message);
    }
}

// 执行主函数
pushExactMemberFormat();
$done({});
