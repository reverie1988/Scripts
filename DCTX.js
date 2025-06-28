// 重写规则名称：提取并推送原始Member数据
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/lotteryhy\/api\/client\/cj\/send\/pak

function extractAndNotifyRawMemberData() {
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
        
        // 将member数据转换为格式化的JSON字符串
        const rawMemberJson = JSON.stringify(memberData, null, 2);
        
        // 发送通知（显示原始JSON数据）
        $notify(
            `📌 Member数据 [${nickname}]`,
            '',
            rawMemberJson,
            {
                // 可选：点击通知后复制全部内容到剪贴板
                'copy': rawMemberJson,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dc.png'
            }
        );
        
        // 保存到持久化存储
        $prefs.setValueForKey(rawMemberJson, 'last_member_data');
        
    } catch (error) {
        $notify('❌ 处理Member数据失败', '', error.message);
    }
}

// 执行主函数
extractAndNotifyRawMemberData();
$done({});
