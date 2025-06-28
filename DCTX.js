// 重写规则名称：Member数据稳定单次推送
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

function stableMemberExtraction() {
    // 调试日志
    console.log('[Member提取] 启动请求处理');
    
    try {
        // 1. 安全获取headers
        if (!$request || !$request.headers) {
            console.log('[Member提取] 错误: 无效请求对象');
            return;
        }
        
        // 2. 查找member头（兼容大小写）
        const headers = $request.headers;
        const memberKey = Object.keys(headers).find(k => k.toLowerCase() === 'member');
        
        if (!memberKey) {
            console.log('[Member提取] 调试: 请求头不包含member');
            return;
        }
        
        const memberValue = headers[memberKey];
        
        // 3. 空值检查
        if (!memberValue || typeof memberValue !== 'string' || memberValue.trim() === '') {
            console.log('[Member提取] 忽略: member值为空');
            return;
        }
        
        // 4. 验证JSON格式
        try {
            JSON.parse(memberValue);
        } catch (e) {
            console.log('[Member提取] 错误: 无效JSON格式', e);
            return;
        }
        
        // 5. MD5去重检查
        const md5 = $text.MD5(memberValue);
        const lastMD5 = $prefs.valueForKey('last_member_md5');
        
        if (md5 === lastMD5) {
            console.log('[Member提取] 忽略: 数据未变化');
            return;
        }
        
        // 6. 发送通知（仅在新数据时）
        $notify(
            '🔄 会员数据更新', 
            '点击通知复制完整数据', 
            memberValue,
            {
                'copy': memberValue,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4d1.png'
            }
        );
        
        // 7. 存储当前状态
        $prefs.setValueForKey(md5, 'last_member_md5');
        console.log('[Member提取] 成功: 新数据已处理');
        
    } catch (error) {
        console.log('[Member提取] 捕获全局异常:', error);
    }
}

// 执行入口
if (typeof $request !== 'undefined') {
    stableMemberExtraction();
} else {
    console.log('[Member提取] 错误: 未检测到$request对象');
}
$done({});
