// 重写规则名称：提取并推送Member数据（POST版）
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/lotteryhy\/api\/client\/cj\/send\/pak

function extractAndNotifyMemberData() {
    try {
        // 获取请求头
        const headers = $request.headers;
        
        // 查找member头（不区分大小写）
        const memberHeader = headers['member'] || headers['Member'] || headers['MEMBER'];
        
        if (!memberHeader) {
            $notify('❌ 提取失败', 'Member头未找到', '请在POST请求头中检查member字段');
            return;
        }
        
        // 解析JSON数据
        const memberData = JSON.parse(memberHeader);
        
        // 解码昵称（处理URL编码和emoji）
        let nickname = '未知';
        try {
            nickname = memberData.nick_name && memberData.nick_name.startsWith('%') 
                ? decodeURIComponent(memberData.nick_name) 
                : memberData.nick_name || '未知';
        } catch (e) {
            nickname = memberData.nick_name || '未知';
        }
        
        // 构造推送的member信息（原始JSON，美化格式）
        const formattedMember = JSON.stringify(memberData, null, 2);
        
        // 发送通知（只推送member信息）
        $notify(
            '✅ 提取到Member数据', 
            nickname, 
            `📋 完整Member数据:\n\n${formattedMember}`
        );
        
        // 保存到持久化存储
        $prefs.setValueForKey(formattedMember, 'last_member_data');
        
    } catch (error) {
        $notify('❌ 处理Member数据失败', '错误详情', error.message);
    }
}

// 执行主函数
extractAndNotifyMemberData();
$done({});
