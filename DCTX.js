// 重写规则名称：Member数据单次推送
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat

// 存储最后成功提取的member数据MD5，用于去重
const LAST_MEMBER_MD5 = 'last_member_md5';

function extractMemberOnce() {
    try {
        // 获取请求头
        const headers = $request.headers;
        const memberValue = headers['member'] || headers['Member'] || headers['MEMBER'];
        
        // 检查member值是否存在且有效
        if (!memberValue || memberValue.trim() === '') {
            console.log('[Member提取] 忽略空值请求');
            return;
        }
        
        // 计算当前member数据的MD5
        const currentMD5 = $text.MD5(memberValue);
        const lastMD5 = $prefs.valueForKey(LAST_MEMBER_MD5);
        
        // 检查是否与上次相同
        if (currentMD5 === lastMD5) {
            console.log('[Member提取] 忽略重复数据');
            return;
        }
        
        // 验证JSON格式
        try {
            JSON.parse(memberValue);
        } catch (e) {
            console.log('[Member提取] 无效JSON格式:', e);
            return;
        }
        
        // 发送通知（仅在新数据时）
        $notify(
            '✅ Member数据更新', 
            '点击复制完整数据', 
            memberValue,
            {
                'copy': memberValue,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4d1.png'
            }
        );
        
        // 存储当前MD5
        $prefs.setValueForKey(currentMD5, LAST_MEMBER_MD5);
        console.log('[Member提取] 新数据已存储并通知');
        
    } catch (error) {
        console.log('[Member提取] 全局错误:', error);
    }
}

// 执行
extractMemberOnce();
$done({});
