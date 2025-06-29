// 添加重写规则到 [rewrite_local] 部分：
// ^https:\/\/channel\.cheryfs\.cn\/archer\/activity-api\/cherycar\/getLayout url script-request-header https://raw.githubusercontent.com/yourname/yourrepo/main/CheryAccountId.js

const $ = new Env("奇瑞车生活AccountId提取");
const notifyTitle = "奇瑞车生活账号提取";

if (typeof $request !== "undefined") {
    // 提取accountId
    const accountId = $request.headers["accountId"] || $request.headers["accountid"];
    
    if (accountId) {
        // 获取已保存的账号列表
        let savedAccounts = $persistentStore.read("CheryAccounts");
        let accountsArray = [];
        
        if (savedAccounts) {
            accountsArray = JSON.parse(savedAccounts);
        }
        
        // 检查是否已存在该accountId
        const exists = accountsArray.some(acc => acc.accountId === accountId);
        
        if (!exists) {
            // 添加新账号
            accountsArray.push({
                accountId: accountId,
                addTime: new Date().toLocaleString()
            });
            
            // 保存更新后的列表
            $persistentStore.write(JSON.stringify(accountsArray), "CheryAccounts");
            
            // 发送通知
            $notification.post(
                notifyTitle,
                "成功提取新账号",
                `AccountId: ${accountId}\n已保存到本地`
            );
            
            // 打印日志
            console.log(`新账号提取成功: ${accountId}`);
        } else {
            console.log(`账号已存在: ${accountId}`);
        }
    } else {
        console.log("未找到accountId");
    }
} else {
    // 非请求触发时，显示已保存的账号
    let savedAccounts = $persistentStore.read("CheryAccounts");
    
    if (savedAccounts) {
        let accountsArray = JSON.parse(savedAccounts);
        let message = `已保存 ${accountsArray.length} 个账号:\n\n`;
        
        accountsArray.forEach((acc, index) => {
            message += `${index + 1}. ${acc.accountId}\n添加时间: ${acc.addTime}\n\n`;
        });
        
        $notification.post(
            notifyTitle,
            "账号列表",
            message
        );
    } else {
        $notification.post(
            notifyTitle,
            "提示",
            "尚未保存任何账号"
        );
    }
}

$done({});
