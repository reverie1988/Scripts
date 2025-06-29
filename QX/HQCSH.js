// ==QXScript==
// @name         提取奇瑞签到accountId
// @description  仅针对 /archer/activity-api/signinact/activityIndex 请求提取accountId
// @version      1.0
// @author       YourName
// @target       request
// @match        https://channel.cheryfs.cn/archer/activity-api/signinact/activityIndex
// ==/QXScript==

(function() {
    'use strict';
    
    // 严格匹配目标URL
    if (!$request || !$request.url.includes('/archer/activity-api/signinact/activityIndex')) {
        console.log('🚫 非目标请求，跳过处理');
        $done({});
        return;
    }

    // 优先从请求头获取
    if ($request.headers && $request.headers['accountId']) {
        handleAccountId($request.headers['accountId']);
        $done({});
        return;
    }

    // 备选方案：从Cookie中提取（根据原始请求中的uid格式）
    if ($request.headers && $request.headers['Cookie']) {
        const cookieMatch = $request.headers['Cookie'].match(/uid-[^-]+-[^-]+=([a-f0-9]{64})/i);
        if (cookieMatch && cookieMatch[1]) {
            handleAccountId(cookieMatch[1]);
            $done({});
            return;
        }
    }

    console.log('⚠️ 未能在目标请求中找到accountId');
    $done({});

    // 统一处理accountId
    function handleAccountId(accountId) {
        console.log(`✅ 成功提取 accountId: ${accountId}`);
        
        // 持久化存储
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(accountId, 'chery_accountId');
            console.log('📦 已存储到持久化存储');
        }
        
        // 尝试通知（兼容写法）
        try {
            if (typeof $notification !== 'undefined') {
                $notification.post('奇瑞签到', '成功提取accountId', accountId);
            } else if (typeof alert !== 'undefined') {
                alert(`奇瑞accountId: ${accountId}`);
            }
        } catch (e) {
            console.log('🔔 通知发送失败:', e);
        }
    }
})();
