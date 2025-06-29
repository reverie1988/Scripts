// 名称: 提取 accountId 并通知
// 描述: 从请求头中提取 accountId 并发送通知
// 作者: Your Name
// 日期: 2023-11-15

const method = $request.method;
const url = $request.url;
const headers = $request.headers;

if (method === "GET" && url.includes("getLayout")) {
    const accountId = headers["accountId"];
    
    if (accountId) {
        // 发送通知
        $notification.post("提取到 accountId", `accountId: ${accountId}`, `来自: ${url}`);
        
        // 将 accountId 保存到持久化存储
        $persistentStore.write(accountId, "saved_accountId");
        
        // 调试日志
        console.log(`成功提取 accountId: ${accountId}`);
    } else {
        console.log("未找到 accountId");
    }
}

$done({});
