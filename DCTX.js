// 重写规则名称：Member数据终极稳定版
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

// 替代MD5的简单哈希函数
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // 转换为32位整数
    }
    return hash.toString();
}

function rockSolidMemberExtractor() {
    // 调试标记
    const debugTag = '[Member终极版]';
    
    try {
        // 1. 基础验证
        if (typeof $request === 'undefined') {
            console.log(`${debugTag} 错误: 无$request对象`);
            return;
        }
        
        if (!$request.headers) {
            console.log(`${debugTag} 错误: 无headers对象`);
            return;
        }
        
        // 2. 查找member头（兼容各种大小写）
        const headerKeys = Object.keys($request.headers);
        const memberKey = headerKeys.find(k => k.toLowerCase() === 'member');
        
        if (!memberKey) {
            console.log(`${debugTag} 调试: 未找到member头`);
            return;
        }
        
        const memberValue = $request.headers[memberKey];
        
        // 3. 严格空值检查
        if (typeof memberValue !== 'string' || memberValue.trim() === '') {
            console.log(`${debugTag} 忽略: member值为空`);
            return;
        }
        
        // 4. JSON验证
        try {
            JSON.parse(memberValue);
        } catch (e) {
            console.log(`${debugTag} 错误: 无效JSON`, e.message);
            return;
        }
        
        // 5. 去重检查（使用简单哈希替代MD5）
        const currentHash = simpleHash(memberValue);
        const lastHash = $prefs.valueForKey('last_member_hash');
        
        if (currentHash === lastHash) {
            console.log(`${debugTag} 忽略: 数据未变化`);
            return;
        }
        
        // 6. 发送通知（仅在新数据时）
        $notify(
            '🔔 会员数据更新', 
            `长度: ${memberValue.length}字符`, 
            memberValue,
            {
                'copy': memberValue,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4d1.png'
            }
        );
        
        // 7. 存储状态
        $prefs.setValueForKey(currentHash, 'last_member_hash');
        console.log(`${debugTag} 成功: 已处理新数据`);
        
    } catch (error) {
        console.log(`${debugTag} 捕获顶级错误:`, error);
    }
}

// 安全执行
if (typeof $done === 'function') {
    rockSolidMemberExtractor();
    $done({});
} else {
    console.log('[Member终极版] 环境异常: 无$done函数');
}
