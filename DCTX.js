const url = $request.url;
const method = $request.method;
const headers = $request.headers;
const member = headers['member'];

if (member) {
    // 解码URL编码的nick_name
    const decodedMember = member.replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    });

    // 发送推送通知
    $notification.post('Member信息提取', '', decodedMember);

    // 可选：将member保存到持久化存储
    $persistentStore.write(decodedMember, 'member_data');

    // 可选：记录到日志
    console.log('提取到的member信息: ' + decodedMember);
} else {
    console.log('未找到member字段');
}

$done({});
