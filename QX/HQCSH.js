// 终极兼容版 accountId_notify.js
const accountId = $request.headers['AccountId'] || $request.headers['accountId'];

// 使用兼容性通知方法
function notify(title, subtitle, content) {
    try {
        // 尝试Quantumult X原生方法
        if (typeof $notify !== 'undefined') {
            $notify(title, subtitle, content);
            return;
        }
        // 尝试Surge兼容方法
        if (typeof $notification !== 'undefined') {
            $notification.post(title, subtitle, content);
            return;
        }
        // 终极fallback - 写入持久化存储
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(content, "LastAccountId");
        }
    } catch (e) {
        console.log("通知发送失败: " + e);
    }
}

if (accountId) {
    notify("AccountID 提取成功", "", accountId);
} else {
    notify("AccountID 提取失败", "", "未找到AccountID字段");
}

$done({});
