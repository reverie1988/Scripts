// 配置区 ========================================
const CONFIG = {
    STORAGE_KEY: 'access_token_extractor_v3',  // 存储键名
    TARGET_KEYS: ['access-token', 'authorization'],  // 目标header字段
    NOTIFY_ICON: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f511.png'  // 锁图标
};

// 原子操作锁 ====================================
let isProcessing = false;

// 主逻辑 ========================================
function atomicTokenExtractor() {
    // 原子锁检查
    if (isProcessing) {
        console.log(`[${CONFIG.STORAGE_KEY}] 跳过: 并发请求`);
        return;
    }
    isProcessing = true;

    try {
        // 1. 环境验证
        if (!validateEnvironment()) return;

        // 2. 精确查找token
        const { foundKey, tokenValue } = findTargetToken();
        if (!tokenValue) return;

        // 3. 数据比对
        if (isDuplicateToken(tokenValue)) {
            console.log(`[${CONFIG.STORAGE_KEY}] 跳过: 重复token`);
            return;
        }

        // 4. 处理有效token
        processValidToken(foundKey, tokenValue);

    } catch (error) {
        console.log(`[${CONFIG.STORAGE_KEY}] 异常:`, error);
    } finally {
        isProcessing = false;
    }
}

// 工具函数 ======================================
function validateEnvironment() {
    if (typeof $request === 'undefined' || !$request.headers) {
        console.log(`[${CONFIG.STORAGE_KEY}] 错误: 无效请求对象`);
        return false;
    }
    return true;
}

function findTargetToken() {
    const headers = $request.headers;
    let foundKey = null;
    let tokenValue = null;

    // 不区分大小写查找目标字段
    for (const targetKey of CONFIG.TARGET_KEYS) {
        const headerKey = Object.keys(headers).find(k => 
            k.toLowerCase() === targetKey.toLowerCase()
        );
        
        if (headerKey) {
            foundKey = headerKey;
            tokenValue = headers[headerKey];
            break;
        }
    }

    // 空值验证
    if (tokenValue && typeof tokenValue === 'string') {
        tokenValue = tokenValue.trim();
        if (tokenValue === '') tokenValue = null;
    }

    if (!tokenValue) {
        console.log(`[${CONFIG.STORAGE_KEY}] 调试: 有效token未找到`, 
            `现有headers: ${JSON.stringify(Object.keys(headers))}`);
    }

    return { foundKey, tokenValue };
}

function isDuplicateToken(currentToken) {
    const lastToken = $persistentStore.read(CONFIG.STORAGE_KEY);
    return lastToken === currentToken;
}

function processValidToken(key, token) {
    // 存储完整token
    $persistentStore.write(token, CONFIG.STORAGE_KEY);
    console.log(`[${CONFIG.STORAGE_KEY}] 存储: ${token.slice(0, 15)}...`);

    // 发送富文本通知
    if (typeof $notify !== 'undefined') {
        $notify(
            '🔑 Access Token更新', 
            `来源: ${key}`,
            `前6位: ${token.slice(0, 6)}...\n长度: ${token.length}字符`,
            {
                'copy': token,
                'media-url': CONFIG.NOTIFY_ICON,
                'auto-dismiss': 5  // 5秒后自动消失
            }
        );
    }

    // 剪贴板操作
    if (typeof $clipboard !== 'undefined') {
        $clipboard.setText(token);
        console.log(`[${CONFIG.STORAGE_KEY}] 已复制到剪贴板`);
    }
}

// 执行入口 ======================================
if (typeof $done === 'function') {
    atomicTokenExtractor();
    $done({});
} else {
    console.log(`[${CONFIG.STORAGE_KEY}] 环境异常: 缺少$done`);
}
