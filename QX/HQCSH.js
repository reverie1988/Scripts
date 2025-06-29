// 带持久化存储的版本
const accountId = $request.headers['AccountId'] || $request.headers['accountId'];
const savedId = $persistentStore.read("lastAccountId");

if (accountId) {
    if (accountId !== savedId) {
        $persistentStore.write(accountId, "lastAccountId");
        $notify("发现新 AccountID", "", accountId);
    }
    $done({});
} else {
    $notify("AccountID 提取失败", "", "检查请求头");
    $done({});
}
