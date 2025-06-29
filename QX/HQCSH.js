// 名称: 提取 accountId (活动页兼容版)
// 描述: 从请求头和Cookie中提取 accountId 并记录
// 作者: Your Name
// 日期: 2025-06-29

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === "GET" && url.includes("activityIndex")) {
    // 来源1：直接从请求头获取
    const headerAccountId = headers["accountId"];
    
    // 来源2：从Cookie解析（格式：uid-tenantId-wxappid=accountId）
    const cookieAccountId = (headers["Cookie"] || "").match(/uid-\d+-\d+=([a-f0-9]+)/)?.[1];
    
    // 确定最终accountId（优先级：请求头 > Cookie）
    const accountId = headerAccountId || cookieAccountId;
    
    if (accountId) {
        // 调试信息
        console.log(`请求头 accountId: ${headerAccountId || "未找到"}`);
        console.log(`Cookie accountId: ${cookieAccountId || "未找到"}`);
        
        // 通知功能（兼容多版本）
        const notifyTitle = "提取到 accountId";
        const notifySubtitle = `长度: ${accountId.length} 字符`;
        const notifyContent = `值: ${accountId}\n来源: ${url}`;
        
        if (typeof $notify !== 'undefined') {
            $notify(notifyTitle, notifySubtitle, notifyContent);
        } else if (typeof $notification !== 'undefined') {
            $notification.post(notifyTitle, notifySubtitle, notifyContent);
        } else {
            console.log(`[AccountId] ${accountId}`);
        }
        
        // 持久化存储（兼容多版本）
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(accountId, "last_accountId");
            console.log("已存储到 $persistentStore");
        } else if (typeof $prefs !== 'undefined') {
            $prefs.setValueForKey(accountId, "last_accountId");
            console.log("已存储到 $prefs");
        }
        
        // 验证accountId格式（可选）
        if (accountId.length !== 64) {
            console.warn("⚠️ accountId长度异常，可能提取错误");
        }
    } else {
        console.log("❌ 未找到 accountId");
        console.log("可用请求头:", JSON.stringify(headers, null, 2));
    }
}

$done({});
