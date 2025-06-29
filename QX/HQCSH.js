// 名称: 提取 accountId (兼容版)
// 描述: 从请求头中提取 accountId 并记录
// 作者: Your Name
// 日期: 2025-06-29

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === "GET" && url.includes("getLayout")) {
    const accountId = headers["accountId"];
    
    if (accountId) {
        // 替代通知方案：使用 $notify 或直接记录到日志
        if (typeof $notify !== 'undefined') {
            $notify("提取到 accountId", `accountId: ${accountId}`, `来自: ${url}`);
        } else {
            console.log(`[AccountId] 提取成功: ${accountId}`);
        }
        
        // 持久化存储方案
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(accountId, "saved_accountId");
        } else if (typeof $prefs !== 'undefined') {
            $prefs.setValueForKey(accountId, "saved_accountId");
        }
        
        // 调试日志
        console.log(`成功提取 accountId: ${accountId}`);
    } else {
        console.log("未找到 accountId");
    }
}

$done({});
