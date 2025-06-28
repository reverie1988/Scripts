// 名称: Access Token 日志输出
// 描述: 将 access-token 输出到 Quantumult X 日志
// 兼容性: 最低版本要求 (无特殊API依赖)
// 更新时间: 2025-06-29

const log = (content) => {
  // 兼容不同环境的日志输出方式
  if (typeof console.log === 'function') {
    console.log(content);
  } else if (typeof $console !== 'undefined') {
    $console.log(content);
  }
};

if ($request.method === 'GET' && 
    $request.url.includes('/gateway/api/auth/account/user/info')) {
  
  const token = $request.headers?.['access-token'];
  if (token) {
    log('====== TOKEN START ======');
    log(token);
    log('====== TOKEN END ======');
    
    // 尝试用基础方式触发通知（非标准API）
    try {
      const body = { title: 'Token Captured', body: token };
      const notify = new Notification(body.title, { body: body.body });
    } catch(e) { /* 忽略通知错误 */ }
  }
}

$done({});
