// 名称: 提取 Access Token
// 描述: 从指定请求中提取 access-token 并保存到持久化存储
// 作者: YourName
// 更新时间: 2023-11-20

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === 'GET' && url.includes('/gateway/api/auth/account/user/info')) {
    if (headers['access-token']) {
        const accessToken = headers['access-token'];
        
        // 保存到持久化存储
        $persistentStore.write(accessToken, 'access_token');
        
        // 输出日志
        console.log(`成功提取 access-token: ${accessToken}`);
        $notification.post('Access Token 已提取', '', `Token: ${accessToken}`);
    } else {
        console.log('未找到 access-token 头部');
    }
}

$done({});
