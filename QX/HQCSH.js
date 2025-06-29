// 使用Quantumult X脚本提取accountId并推送
const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === 'GET' && url.includes('findPoint')) {
    // 提取accountId
    const accountId = headers['accountId'] || headers['Accountid'] || headers['ACCOUNTID'];
    
    if (accountId) {
        // 构造推送内容
        const message = `提取到accountId: ${accountId}`;
        const title = 'AccountID提取通知';
        
        // 使用其他方式推送（因为不支持$notification API）
        // 方法1：使用$notify（如果可用）
        if (typeof $notify !== 'undefined') {
            $notify(title, '', message);
        } 
        // 方法2：使用console.log输出（可以在日志中查看）
        else {
            console.log(`[AccountID提取] ${message}`);
            
            // 方法3：使用HTTP请求发送到推送服务（需要自行实现）
            // 例如使用Bark、Server酱等推送服务
            // $task.fetch({ url: `https://api.push.com/send?title=${title}&body=${message}` });
            
            // 方法4：将结果存储在持久化存储中供其他脚本使用
            $persistentStore.write(accountId, 'extracted_accountId');
        }
        
        // 返回修改后的请求（如果需要）
        $done({});
    } else {
        console.log('未找到accountId请求头');
        $done({});
    }
} else {
    $done({});
}
