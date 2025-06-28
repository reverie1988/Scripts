console.log("🔍 ==== 调试脚本开始 ====");

// 1. 打印关键调试信息
try {
    console.log(`📌 请求URL: ${$request?.url || "未获取到URL"}`);
    console.log("🔧 请求头:", JSON.stringify($request?.headers || {}, null, 2));
    console.log("🌐 环境变量:", JSON.stringify($environment || {}, null, 2));
} catch (e) {
    console.log(`❌ 调试信息打印失败: ${e}`);
}

// 2. 定义可能的Token字段名（不区分大小写）
const TOKEN_KEYS = [
    "access-token",
    "authorization",
    "x-token",
    "token"
];

// 3. 查找Token字段
let foundToken = null;
let foundKey = null;

try {
    const headers = $request?.headers || {};
    
    // 遍历所有可能的Token字段名
    for (const key of TOKEN_KEYS) {
        const headerKey = Object.keys(headers).find(k => 
            k.toLowerCase().includes(key.toLowerCase())
        );
        
        if (headerKey) {
            foundKey = headerKey;
            foundToken = headers[headerKey];
            break;
        }
    }
} catch (e) {
    console.log(`❌ 查找Token失败: ${e}`);
}

// 4. 处理结果
if (foundToken) {
    console.log(`✅ 提取成功 - [${foundKey}]: ${foundToken}`);
    
    // 尝试存储Token
    try {
        if (typeof $persistentStore !== 'undefined') {
            $persistentStore.write(foundToken, 'extracted_token');
            console.log("💾 已保存到persistentStore");
        } else if (typeof $prefs !== 'undefined') {
            $prefs.setValueForKey(foundToken, 'extracted_token');
            console.log("💾 已保存到prefs");
        }
    } catch (e) {
        console.log(`❌ 存储Token失败: ${e}`);
    }
    
    // 尝试发送通知（兼容旧版QX）
    try {
        if (typeof $notify !== 'undefined') {
            $notify("✅ Token提取成功", `字段: ${foundKey}`, foundToken);
        } else if (typeof $notification !== 'undefined') {
            $notification.post("✅ Token提取成功", `字段: ${foundKey}`, foundToken);
        }
    } catch (e) {
        console.log(`❌ 通知发送失败: ${e}`);
    }
    
    // 尝试复制到剪贴板
    try {
        if (typeof $clipboard !== 'undefined') {
            $clipboard.setText(foundToken);
            console.log("📋 已复制到剪贴板");
        }
    } catch (e) {
        console.log(`❌ 复制失败: ${e}`);
    }
} else {
    console.log("❌ 未找到Token字段");
    console.log("ℹ️ 现有请求头字段:", Object.keys($request?.headers || {}).join(", "));
    
    try {
        if (typeof $notify !== 'undefined') {
            $notify("❌ 未找到Token", "请检查请求头", "可用字段见日志");
        }
    } catch (e) {
        console.log(`❌ 错误通知发送失败: ${e}`);
    }
}

console.log("🔚 ==== 调试脚本结束 ====");
$done({});
