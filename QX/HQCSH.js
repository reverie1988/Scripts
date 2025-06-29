// 修正后的 accountId_notify.js
const accountId = $request.headers['AccountId'] || $request.headers['accountId'];

if (accountId) {
    $notify("AccountID 提取成功", "", `提取到的 AccountID: ${accountId}`);
} else {
    $notify("AccountID 提取失败", "", "未找到 AccountID 字段");
}

$done({});
