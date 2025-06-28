// 名称: Access Token 实时推送
// 描述: 检测到 access-token 时直接推送通知
// 作者: YourName
// 更新时间: 2025-06-29

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === 'GET' && url.includes('/gateway/api/auth/account/user/info')) {
    if (headers['access-token']) {
        const token = headers['access-token'];
        // 直接推送完整 token
        $notification.post('⚠️ 检测到 Access Token', '', `Token: ${token}`);
        // 控制台输出（可选）
        console.log(`实时推送 token: ${token}`);
    }
}

$done({});
