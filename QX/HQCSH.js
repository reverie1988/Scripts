const $ = new API("accountId-extractor");
const accountId = $request.headers['accountid'];

if (accountId) {
    $.notify("AccountID 提取成功", "", `提取到的 AccountID: ${accountId}`);
    $.done({});
} else {
    $.notify("AccountID 提取失败", "", "未找到 AccountID 字段");
    $.done({});
}

function API(name) {
    this.name = name;
    this.notify = (title, subtitle, body) => {
        $notification.post(title, subtitle, body);
    };
    this.done = (obj) => {
        $done(obj);
    };
}
