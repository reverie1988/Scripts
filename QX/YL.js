const url = $request.url;
const headers = $request.headers;

if (url.includes('/gateway/api/auth/account/user/info')) {
    if (headers['access-token']) {
        const accessToken = headers['access-token'];
        
        // 尝试使用 $persistentStore，如果失败则改用其他方式
        try {
            if (typeof $persistentStore !== 'undefined') {
                $persistentStore.write(accessToken, 'access_token');
            } else if (typeof $prefs !== 'undefined') {
                $prefs.setValueForKey(accessToken, 'access_token');
            } else {
                // 如果都不支持，直接输出到日志
                console.log('无法存储 token，当前环境不支持 $persistentStore 或 $prefs');
            }
            
            // 强制显示通知（测试用）
            $notification.post("ACCESS-TOKEN 提取成功", "点击复制", accessToken);
            console.log(`[DEBUG] access-token: ${accessToken}`);
        } catch (e) {
            console.log(`存储 token 失败: ${e}`);
        }
    } else {
        console.log("[DEBUG] 请求头中没有 access-token");
    }
}

$done({});
