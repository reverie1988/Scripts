// 提取accountId的QX脚本（兼容版）

// 方法1：从请求头直接获取
if (typeof $request !== 'undefined' && $request.headers && $request.headers['accountId']) {
    const accountId = $request.headers['accountId'];
    // 方法1：使用console.log输出到日志
    console.log("✅ 提取到accountId: " + accountId);
    // 方法2：使用$persistentStore存储
    if (typeof $persistentStore !== 'undefined') {
        $persistentStore.write(accountId, "accountId");
    }
    // 方法3：使用alert弹出提示（部分QX版本支持）
    if (typeof alert !== 'undefined') {
        alert("提取到accountId: " + accountId);
    }
    $done({});
}

// 方法2：从请求头字符串中正则匹配
const headerStr = JSON.stringify($request.headers);
const regex = /accountId[\s:]*([a-f0-9]{64})/i;
const matches = headerStr.match(regex);

if (matches && matches[1]) {
    const accountId = matches[1];
    console.log("✅ 通过正则提取到accountId: " + accountId);
    if (typeof $persistentStore !== 'undefined') {
        $persistentStore.write(accountId, "accountId");
    }
    if (typeof alert !== 'undefined') {
        alert("正则提取到accountId: " + accountId);
    }
    $done({});
}

console.log("❌ 未找到accountId");
$done({});
