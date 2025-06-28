const url = $request.url;
const headers = $request.headers;

if (url.includes('/gateway/api/auth/account/user/info')) {
    if (headers['access-token']) {
        const accessToken = headers['access-token'];
        
        // 保存到持久化存储
        $persistentStore.write(accessToken, 'access_token');
        
        // 可选：通知用户已获取token
        $notification.post("Access Token 已获取", "", `Token: ${accessToken}`);
        
        console.log(`成功获取 access-token: ${accessToken}`);
    } else {
        console.log("未找到 access-token 请求头");
    }
}

$done({});
