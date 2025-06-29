// 名称: 提取 accountId (多来源兼容版)
// 描述: 从URL参数和请求头中提取 accountId
// 作者: Your Name
// 日期: 2025-06-29

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === "GET" && url.includes("saveupdateAccount")) {
    // 从URL参数获取
    const urlParams = new URL(url).searchParams;
    const urlAccountId = urlParams.get("accountId");
    
    // 从请求头获取
    const headerAccountId = headers["accountId"];
    
    // 从Cookie获取
    const cookieHeader = headers["Cookie"] || "";
    const cookieAccountId = cookieHeader.match(/uid-\d+-\d+=([a-f0-9]+)/)?.[1];
    
    // 确定最终使用的accountId (优先级: URL参数 > 请求头 > Cookie)
    const accountId = urlAccountId || headerAccountId || cookieAccountId;
    
    if (accountId) {
        // 调试输出
        console.log(`从URL参数获取: ${urlAccountId}`);
        console.log(`从请求头获取: ${headerAccountId}`);
        console.log(`从Cookie获取: ${cookieAccountId}`);
        console.log(`最终确定 accountId: ${accountId}`);
        
        // 通知方案
        if (typeof $notify !== 'undefined') {
            $notify("提取到 accountId", `accountId: ${accountId}`, `来源: ${url}`);
        } else if (typeof $notification !== 'undefined') {
            $notification.post("提取到 accountId", `accountId: ${accountId}`, `来源: ${url}`);
        } else {
            console.log(`[AccountId] 提取成功: ${accountId}`);
        }
        
        // 持久化存储
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(accountId, "saved_accountId");
        } else if (typeof $prefs !== 'undefined') {
            $prefs.setValueForKey(accountId, "saved_accountId");
        }
    } else {
        console.log("未找到 accountId");
    }
}

$done({});
