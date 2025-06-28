// 重写规则名称：Member数据稳定提取
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

function stableMemberExtractor() {
    // 调试日志
    console.log(`[Member提取] 启动处理: ${$request.url}`);
    
    // 获取精确header键名
    const headers = $request.headers;
    const exactMemberKey = Object.keys(headers).find(k => k.toLowerCase() === 'member');
    
    if (!exactMemberKey) {
        console.log('[Member提取] 致命错误: 未找到member键');
        $notify('❌ 配置错误', 'member键不存在', '请联系脚本开发者');
        return;
    }
    
    const memberValue = headers[exactMemberKey];
    const valueLength = memberValue ? memberValue.length : 0;
    console.log(`[Member提取] 状态: key="${exactMemberKey}" 长度=${valueLength}`);
    
    // 空值处理
    if (!memberValue || memberValue.trim() === '') {
        console.log('[Member提取] 会话异常: member值为空');
        $notify('⚠️ 会话已过期', '请重新登录', '检测到空member值\n\n可能原因:\n1. 登录状态失效\n2. 服务器限制\n3. 网络切换');
        return;
    }
    
    // 验证JSON格式
    try {
        JSON.parse(memberValue);
    } catch (e) {
        console.log('[Member提取] 数据异常: 无效JSON格式');
        $notify('❌ 数据损坏', 'member格式错误', e.message);
        return;
    }
    
    // 成功处理
    $notify(
        '✅ Member数据', 
        `长度: ${valueLength}字符`, 
        memberValue,
        {
            'copy': memberValue,
            'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4d1.png'
        }
    );
    $prefs.setValueForKey(memberValue, 'last_member_data');
}

// 执行
stableMemberExtractor();
$done({});
