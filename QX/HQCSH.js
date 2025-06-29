// QX脚本：提取Cookie并推送通知
// 脚本名称: Extract Cookie and Notify
// 匹配URL: https://channel.cheryfs.cn/archer/activity-api/common/visibility/batch
// 触发时机: response-body

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === 'POST' && url.includes('/archer/activity-api/common/visibility/batch')) {
    // 提取Cookie和其他重要信息
    const cookie = headers['Cookie'] || '';
    const accountId = headers['accountId'] || '';
    const tenantId = headers['tenantId'] || '';
    const wxappid = headers['wxappid'] || '';
    const activityId = headers['activityId'] || '';
    
    // 构造消息内容
    const message = `
    🍪 Cookie提取成功 🍪
    URL: ${url}
    Cookie: ${cookie}
    AccountId: ${accountId}
    TenantId: ${tenantId}
    WxAppId: ${wxappid}
    ActivityId: ${activityId}
    `;
    
    // 由于不支持$notification，使用其他方式推送
    // 方法1: 使用$notify的替代方案（如果部分支持）
    try {
        if (typeof $notify !== 'undefined') {
            $notify('Cookie提取成功', '', message);
        } else {
            // 方法2: 使用console.log输出到日志
            console.log(message);
            
            // 方法3: 使用HTTP请求发送到webhook
            // 需要替换为你的webhook地址
            const webhookUrl = 'https://your-webhook-url.com';
            $task.fetch({
                url: webhookUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Cookie提取通知',
                    content: message
                })
            }).then(response => {
                console.log('Webhook通知发送成功');
            }, reason => {
                console.log('Webhook通知发送失败: ' + reason.error);
            });
        }
    } catch (e) {
        console.log('通知发送失败: ' + e);
    }
    
    // 保存到持久化存储
    $prefs.setValueForKey(cookie, 'extracted_cookie');
    $prefs.setValueForKey(accountId, 'extracted_accountId');
    
    // 返回原始响应
    $done({});
} else {
    $done({});
}
