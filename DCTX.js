// 重写规则名称：调试Member提取问题
// 匹配URL：^https?:\/\/m\.aihoge\.com\/api\/lotteryhy\/api\/client\/cj\/send\/pak

function debugMemberExtraction() {
    console.log(`[调试] 开始处理请求: ${$request.url}`);
    
    // 记录所有请求头
    const headers = $request.headers;
    console.log(`[调试] 所有请求头keys: ${Object.keys(headers).join(', ')}`);
    
    // 检查member头
    const memberHeader = getMemberHeader(headers);
    
    if (!memberHeader) {
        console.log('[调试] 未找到member头，完整headers:', JSON.stringify(headers, null, 2));
        $notify('❌ Member提取失败', '调试信息已记录', '请查看QX日志获取详细信息');
        return;
    }
    
    console.log('[调试] 找到member头:', memberHeader);
    
    try {
        const memberData = JSON.parse(memberHeader);
        $notify('✅ Member数据', '', JSON.stringify(memberData, null, 2));
    } catch (e) {
        console.log('[调试] 解析member数据失败:', e);
        $notify('❌ Member解析失败', '', e.message);
    }
}

// 更全面的header获取方法
function getMemberHeader(headers) {
    const possibleKeys = [
        'member', 'Member', 'MEMBER',
        'x-member', 'X-Member', 'X-MEMBER',
        'user-member', 'User-Member', 'USER-MEMBER'
    ];
    
    for (const key of possibleKeys) {
        if (headers[key]) {
            console.log(`[调试] 从key ${key} 找到member头`);
            return headers[key];
        }
    }
    return null;
}

debugMemberExtraction();
$done({});
