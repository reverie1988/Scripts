// [mitm] n*.sentezhenxuan.com
// [rewrite_local] ^https:\/\/n\d+\.sentezhenxuan\.com\/api\/video\/list\?page=\d+&limit=\d+&status=\d+&source=\d+&isXn=\d+ url script-response-body https://raw.githubusercontent.com/reverie1988/Scripts/refs/heads/main/YYZH.js

console.log("🔍 调试信息开始 ================");
console.log(`请求URL: ${$request.url}`);
console.log("请求头:", JSON.stringify($request.headers, null, 2));
console.log("环境变量:", JSON.stringify($environment, null, 2));

const authKey = Object.keys($request.headers).find(k => 
    k.toLowerCase().includes("authori-zation")
);

if (authKey) {
    const token = $request.headers[authKey];
    $notify("✅ 调试模式-提取成功", $request.url, token);
    console.log("提取到的Token:", token);
} else {
    $notify("❌ 调试模式-未找到Token", $request.url, "检查请求头");
    console.log("未找到authori-zation头");
}

$done();
