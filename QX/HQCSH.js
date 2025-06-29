// ==QXScript==
// @name         奇瑞签到accountId提取器(queryByActivityId)
// @description  从queryByActivityId接口提取accountId
// @version      1.1
// @author       -
// @target       request
// @match        https://channel.cheryfs.cn/archer/activity-api/signinact/queryByActivityId
// ==/QXScript==

(function() {
    'use strict';
    
    // 调试用：打印完整请求头
    // console.log("完整请求头：" + JSON.stringify($request.headers, null, 2));
    
    // 验证目标请求
    if (!$request || !$request.url.includes('/queryByActivityId')) {
        console.log('⚠️ 非目标请求，跳过处理');
        $done({});
        return;
    }

    // 主提取方案：从请求头直接获取
    if ($request.headers && $request.headers['accountId']) {
        const accountId = $request.headers['accountId'];
        if (validateAccountId(accountId)) {
            processSuccess(accountId, '请求头');
            $done({});
            return;
        }
    }

    // 备选方案1：从Cookie中的uid字段提取
    if ($request.headers && $request.headers['Cookie']) {
        const cookieAccountId = extractFromCookie($request.headers['Cookie']);
        if (cookieAccountId) {
            processSuccess(cookieAccountId, 'Cookie');
            $done({});
            return;
        }
    }

    // 备选方案2：从请求体提取（如果需要）
    // if ($request.body) {
    //     const bodyAccountId = extractFromBody($request.body);
    //     if (bodyAccountId) {
    //         processSuccess(bodyAccountId, '请求体');
    //         $done({});
    //         return;
    //     }
    // }

    console.log('❌ 未能在请求中找到有效的accountId');
    $done({});

    // 验证accountId格式（64位hex）
    function validateAccountId(id) {
        return /^[a-f0-9]{64}$/i.test(id);
    }

    // 从Cookie提取
    function extractFromCookie(cookie) {
        const patterns = [
            /uid-[^-]+-[^-]+=([a-f0-9]{64})/i,  // uid-xxx-xxx=accountId
            /accountId=([a-f0-9]{64})/i         // 直接accountId=xxx
        ];
        
        for (const pattern of patterns) {
            const match = cookie.match(pattern);
            if (match && validateAccountId(match[1])) {
                return match[1];
            }
        }
        return null;
    }

    // 成功处理逻辑
    function processSuccess(accountId, source) {
        console.log(`✅ 从${source}提取到有效accountId: ${accountId}`);
        
        // 存储到持久化
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(accountId, 'chery_queryByActivityId_accountId');
            console.log('📦 已存储到持久化存储');
        }
        
        // 发送通知
        try {
            if (typeof $notification !== 'undefined') {
                $notification.post(
                    '奇瑞accountId提取成功', 
                    `来源: ${source}`,
                    accountId
                );
            } else if (typeof alert !== 'undefined') {
                alert(`[奇瑞] accountId: ${accountId}\n来源: ${source}`);
            }
        } catch (e) {
            console.log('通知发送失败:', e);
        }
    }
})();
