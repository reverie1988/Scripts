// 使用正则表达式匹配accountId
const regex = /accountId:\s*([a-f0-9]+)/i;

// 检查请求头中是否包含accountId
if ($request.headers && $request.headers['accountId']) {
    const accountId = $request.headers['accountId'];
    // 发送通知
    $notification.post("提取到accountId", "", accountId);
    // 也可以写入持久化存储
    $persistentStore.write(accountId, "accountId");
    console.log("提取到accountId: " + accountId);
} else if (regex.test($request.headers)) {
    const matches = $request.headers.match(regex);
    if (matches && matches[1]) {
        const accountId = matches[1];
        // 发送通知
        $notification.post("提取到accountId", "", accountId);
        // 也可以写入持久化存储
        $persistentStore.write(accountId, "accountId");
        console.log("提取到accountId: " + accountId);
    }
} else {
    console.log("未找到accountId");
}

// 继续请求
$done({});
