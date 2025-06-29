// 名称: AccountId 提取器 (终极稳定版)
// 描述: 从活动页请求中提取accountId，适配QX 2025环境
// 最后测试: 2025-06-29

const START_TIME = Date.now();
const VERSION = "2.1";

function debugLog(message) {
    console.log(`[${Date.now() - START_TIME}ms] ${message}`);
}

function safeExtract() {
    try {
        // 核心提取逻辑
        const req = $request;
        if (!req || !req.headers) {
            debugLog("⚠️ 异常请求：缺少headers");
            return null;
        }

        // 来源1：请求头直接获取
        const headerId = req.headers["accountId"];
        
        // 来源2：从Cookie解析（兼容多格式）
        const cookieId = (req.headers["Cookie"] || "").match(/(?:uid|accountId)[-=]([a-f0-9]{64})/)?.[1];
        
        // 验证并返回结果
        const finalId = headerId || cookieId;
        if (finalId && finalId.length === 64) {
            debugLog(`✅ 验证通过: ${finalId.substr(0, 8)}...${finalId.substr(-8)}`);
            return finalId;
        }
        
        debugLog("❌ 未找到有效accountId");
        debugLog(`请求头样本: ${JSON.stringify(req.headers).substr(0, 150)}...`);
        return null;
        
    } catch (e) {
        debugLog(`⚠️ 提取异常: ${e.message}`);
        return null;
    }
}

// 主执行流程
if ($request && $request.url.includes("activityIndex")) {
    debugLog(`🚀 脚本启动 v${VERSION}`);
    
    const accountId = safeExtract();
    if (accountId) {
        // 持久化存储（多版本兼容）
        const storage = $persistentStore || $prefs;
        if (storage) {
            storage.write(accountId, "last_account_id");
            debugLog("📦 存储成功");
        }
        
        // 通知功能（静默模式兼容）
        if (typeof $notify !== 'undefined') {
            $notify("奇瑞账号捕获成功", 
                   `ID: ${accountId.substr(0, 12)}...`, 
                   `来自: ${$request.url.split('?')[0]}`);
        }
    }
} else {
    debugLog("🛑 请求未匹配规则");
}

$done({});
