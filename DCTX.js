const url = $request.url;
const method = $request.method;
const headers = $request.headers;

console.log("ℹ️ 请求URL: " + url);
console.log("ℹ️ 请求头: " + JSON.stringify(headers, null, 2));

const member = headers['member'] || headers['Member'];
if (member) {
    const decodedMember = decodeURIComponent(member);
    console.log("✅ 解码后的member: " + decodedMember);
    $notification.post('Member信息提取', '提取成功', decodedMember);
    $persistentStore.write(decodedMember, 'member_data');
} else {
    console.log("❌ 未找到member字段");
    $notification.post('Member信息提取', '提取失败', '未找到member字段');
}

$done({});
