// 提取 accountId 并记录日志（兼容无 $notification 的环境）
const method = $request.method;
const url = $request.url;
const headers = $request.headers;

// 调试：记录请求基本信息
console.log(`[Debug] 请求方法: ${method}, URL: ${url}`);

if (method === 'GET' && url.includes('findPoint')) {
    // 调试：输出所有请求头（确认 headers 存在）
    console.log('[Debug] 请求头:', JSON.stringify(headers, null, 2));
    
    // 提取 accountId（兼容大小写）
    const accountId = headers['accountId'] || headers['Accountid'] || headers['ACCOUNTID'];
    
    if (accountId) {
        // 构造推送内容
        const message = `提取到 accountId: ${accountId}`;
        const title = 'AccountID 提取通知';
        
        // 方法1：尝试使用 $notify（如果存在）
        if (typeof $notify !== 'undefined') {
            $notify(title, '', message);
            console.log(`[Success] 已通过 $notify 推送: ${message}`);
        } 
        // 方法2：仅记录日志（确保日志可见）
        else {
            console.log(`[Success] ${title} - ${message}`);
            
            // 可选：将 accountId 存储到持久化变量
            $persistentStore.write(accountId, 'extracted_accountId');
            console.log(`[Info] accountId 已保存到持久化存储`);
        }
    } else {
        console.log('[Error] 未找到 accountId 请求头');
    }
} else {
    console.log('[Info] 请求未匹配条件，跳过处理');
}

$done({});
