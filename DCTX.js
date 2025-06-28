// 重写规则名称：稳定提取Member数据
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

function getMemberDataStable() {
    // 调试日志
    console.log(`[Member提取] 请求URL: ${$request.url}`);
    
    // 获取所有header的精确键名（解决大小写问题）
    const headers = $request.headers;
    const headerKeys = Object.keys(headers);
    console.log(`[Member提取] 实际Header键名: ${headerKeys.join(', ')}`);
    
    // 精确查找member键（保持原样大小写）
    let memberKey = headerKeys.find(key => key.toLowerCase() === 'member');
    
    if (!memberKey) {
        console.log('[Member提取] 错误: 未找到任何形式的member键');
        $notify('❌ Member提取失败', 'Header检查', '未找到member键\n\n完整Headers:\n' + JSON.stringify(headers, null, 2));
        return;
    }
    
    const memberValue = headers[memberKey];
    console.log(`[Member提取] 找到member键: "${memberKey}" 值长度: ${memberValue ? memberValue.length : 'null'}`);
    
    if (!memberValue || memberValue.trim() === '') {
        console.log('[Member提取] 错误: member值为空');
        $notify('❌ Member值为空', '会话可能已过期', '请重新登录后重试');
        return;
    }
    
    try {
        // 直接使用原始member字符串（保持格式）
        const notificationMsg = `ℹ️ 原始Member数据:\n\n${memberValue}`;
        
        $notify(
            '✅ 成功提取Member数据', 
            `Key: ${memberKey}`, 
            notificationMsg,
            {
                'copy': memberValue,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dc.png'
            }
        );
        
        // 存储原始数据
        $prefs.setValueForKey(memberValue, 'last_member_data');
        
    } catch (error) {
        console.log(`[Member提取] 解析错误: ${error}`);
        $notify('❌ 处理Member数据失败', '错误详情', error.message);
    }
}

// 执行
getMemberDataStable();
$done({});
