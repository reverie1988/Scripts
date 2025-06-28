// 项目: 大潮
// 名称: member 提取器
// [mitm] m.aihoge.com
// [rewrite_local] ^https:\/\/m\.aihoge\.com\/api\/publichy\/client\/activity\/info\?source=wechat url script-response-body https://raw.githubusercontent.com/reverie1988/Scripts/main/QX/DCTX.js

// 存储键名（避免冲突）
const STORAGE_KEY = 'member_extractor_last_data_v2';

// 原子操作锁（防止并行请求重复处理）
let isProcessing = false;

function atomicMemberExtractor() {
    // 如果正在处理，直接返回
    if (isProcessing) {
        console.log('[Member原子版] 跳过: 已有处理中的请求');
        return;
    }
    
    isProcessing = true;
    
    try {
        // 1. 基础环境检查
        if (typeof $request === 'undefined' || !$request.headers) {
            console.log('[Member原子版] 错误: 无效请求对象');
            return;
        }

        // 2. 精确查找member头
        const headers = $request.headers;
        const memberKey = Object.keys(headers).find(k => k.toLowerCase() === 'member');
        
        if (!memberKey) {
            console.log('[Member原子版] 调试: 未找到member头');
            return;
        }

        const memberValue = headers[memberKey];
        
        // 3. 严格空值验证
        if (typeof memberValue !== 'string' || memberValue.trim() === '') {
            console.log('[Member原子版] 忽略: 空值请求');
            return;
        }

        // 4. 验证JSON格式
        let parsedData;
        try {
            parsedData = JSON.parse(memberValue);
        } catch (e) {
            console.log('[Member原子版] 错误: 无效JSON', e.message);
            return;
        }

        // 5. 获取上次存储的完整数据（而不仅是哈希）
        const lastData = $prefs.valueForKey(STORAGE_KEY);
        
        // 6. 数据比对（全等比较）
        if (lastData === memberValue) {
            console.log('[Member原子版] 忽略: 数据完全相同');
            return;
        }

        // 7. 发送通知（确保只推送一次）
        $notify(
            '🌟 会员数据', 
            `ID: ${parsedData.id || '未知'}`, 
            memberValue,
            {
                'copy': memberValue,
                'media-url': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f465.png'
            }
        );

        // 8. 存储完整数据（用于精确比对）
        $prefs.setValueForKey(memberValue, STORAGE_KEY);
        console.log('[Member原子版] 成功: 已存储新数据');

    } catch (error) {
        console.log('[Member原子版] 捕获异常:', error);
    } finally {
        isProcessing = false;
    }
}

// 执行入口
if (typeof $done === 'function') {
    atomicMemberExtractor();
    $done({});
} else {
    console.log('[Member原子版] 环境异常: 缺少$done');
}
