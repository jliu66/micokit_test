/**
 * Created by UGEN75 on 2015/10/16.
 */

/**
 * 返回请求的签名
 */
function getRequestSign() {
    var now = Math.round(new Date().getTime() / 1000);
    var sign = $.md5(appKey + now);
    return sign + ", " + now;
}

/**
 * 得到微信openID
 * @param access_token
 * @param requestHeader
 */
function getUserName(access_token, requestHeader) {
    var uname = "";
    $.ajax({
        type: "POST",
        async: false,
        url: "http://api.easylink.io/v1/key/info",
        data: {"token": access_token},
        headers: requestHeader,
        success: function (data) {
            uname = data[0].username;
        },
        error: function (data) {
            console.log(data);
        }
    });
    console.log('userName: ', uname);
    return uname;
}

/**
 * 得到微信access_token
 * @param requestHeader
 * @returns {string}
 */
function getWechatAccessToken(requestHeader) {
    var accessToken;
    $.ajax({
        type: "GET",
        async: false,
        url: "http://api.easylink.io/v2/wechat/access_token",
        data: {"app_id": appId},
        headers: requestHeader,
        success: function (data) {
            accessToken = data.access_token;
        },
        error: function (data) {
            console.log(data);
        }
    });
    console.log('accessToken:', accessToken);
    if (!!accessToken) {
        return accessToken;
    }

}
/**
 * 得到设备的用户
 * @param deviceId
 * @param requestHeader
 * @param userName
 * @returns {string}
 */
function getDeviceUser(deviceId, requestHeader, userName, type) {

    var user;
    $.ajax({
        type: "GET",
        async: false,
        url: "http://api.easylink.io/v2/devices/users",
        data: {"device_id": deviceId},
        headers: requestHeader,
        success: function (data) {
            console.log(data);
            if (type == 'role') {
                user = (_.find(data, function (_data) {
                    return _data.username == userName
                })).role;
            } else {
                user = data;
            }

        },
        error: function (data) {
            if (type == 'role') {
                user = 'share'
            }
            console.log(data);
        }
    });
    console.log('user: ', user);
    return user;
}


function getDeviceProperties(deviceId, requestHeader, property) {
    $.ajax({
        type: "GET",
        async: false,
        url: "http://api.easylink.io/v2/devices/properties",
        data: {"device_id": deviceId},
        headers: requestHeader,
        success: function (data) {
            console.log(data);
            properties = _.find(data, function (_data) {
                return _data.name == property
            });
            console.log('properties:', properties);
        },
        error: function (data) {
            console.log(data);
        }
    });

}


function unbindDevice(requestHeader, deviceId, ticket, callback) {
    alert('unbindDevice=====');
    $.ajax({
        type: "POST",
        async: true,
        url: "http://api.easylink.io/v2/wechat/device/unbind",
        data: {"ticket": ticket, "app_id": appId, "device_id": deviceId},
        headers: requestHeader,
        success: function (data) {
            alert('unbind:' + JSON.stringify(data));
            callback(null, data);
        },
        error: function (data) {
            alert('unbind:' + JSON.stringify(data));
            callback("err", null);
            console.log(data);
        }
    });

}

/**
 * 得到设备二维码
 * @param requestHeader
 * @param deviceId
 * @returns {*}
 */
function getDeviceQrcode(requestHeader, deviceId) {
    var product_id = deviceId.split('/')[0];
    var mac = deviceId.split('/')[1];
    var ticket;
    $.ajax({
        type: "POST",
        async: false,
        url: "http://api.easylink.io/v1/wechat/device/create",
        data: {"product_id": product_id, 'app_id': appId, 'mac': mac},
        headers: requestHeader,
        success: function (data) {
            alert(data[mac].ticket);
            ticket = data[mac].ticket;
        },
        error: function (data) {
            alert(JSON.stringify(data));
        }
    })
    if (!!ticket) {
        return ticket;
    }
}

function getWechatSignInfo() {
    var signInfo = "";
    $.ajax({
        type: "GET",
        async: false,
        url: "http://" + appId + ".app.easylink.io/sign.php",
        //data: {"device_id": deviceId},
        headers: {},
        cache: false,
        dataType: 'json',
        success: function (data) {
            console.log(data);
            signInfo = data;
        },
        error: function (data) {
            console.log(data);
        }
    });
    console.log('signInfo: ', signInfo);
    if (!!signInfo) {
        return signInfo;
    }
}

function getWechatUserInfo(accessToken, openId) {
    var user;
    $.ajax({
        type: "POST",
        async: false,
        url: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + accessToken + "&openid=" + openId + "&lang=zh_CN",
        dataType: 'json',
        success: function (data) {
            alert('success:',JSON.stringify(data));
            user = data;
        },
        error: function (data) {
            alert('error:',JSON.stringify(data));
            console.log(data);
        }
    });
    console.log('wxuser: ', user);
    if (!!user) {
        return user;
    }
}

/**
 * 得到微信签名
 * @param data
 * @returns {*}
 */
function getWechatSign(signInfo) {
    var nonceStr = signInfo.nonceStr;
    var timestamp = signInfo.timestamp;
    var ticket = signInfo.jsapiTicket;
    var url = document.location.href.split('#')[0];
    var rawString = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
    var sign = hex_sha1(rawString);
    console.log('sign: ' + sign);
    return sign;
}

function getWxDeviceTicket(deviceId, callback) {
    WeixinJSBridge.invoke('getWXDeviceTicket', {
        'deviceId': deviceId,
        'type': '2'
    }, function (res) {
        if (res.err_msg == 'getWXDeviceTicket:ok') {
            var ticket = res.ticket;
            alert('ticket: ' + ticket);
            callback(null, ticket);
        } else {
            callback('err', null);
            console.log(JSON.stringify(res));
        }
    });
}

function openWXDeviceLib() {
    WeixinJSBridge.invoke('openWXDeviceLib', {}, function (res) {
        //alert("wx.openWXDeviceLib " + JSON.stringify(res));
    });
}

function shareAppMessage(ticket) {
    wx.onMenuShareAppMessage({
        title: '设备分享',
        desc: '设备分享设备分享设备分享',
        link: 'http://www.u-gen.net/demo.html?ticket=' + ticket,
        imgUrl: 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg',
        trigger: function (res) {
            // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
            alert('用户点击发送给朋友:' + JSON.stringify(res));
        },
        success: function (res) {
            alert('已分享:' + JSON.stringify(res));
        },
        cancel: function (res) {
            alert('已取消:' + JSON.stringify(res));
        },
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
    alert("去右上角分享设备");
}
function wechatConfig(signInfo, wechatSign) {
    wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: signInfo.appId, // 必填，公众号的唯一标识
        timestamp: signInfo.timestamp, // 必填，生成签名的时间戳
        nonceStr: signInfo.nonceStr, // 必填，生成签名的随机串
        signature: wechatSign, // 必填，签名，见附录1
        jsApiList: [
            // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            'openWXDeviceLib',
            'getWXDeviceTicket',
            'onMenuShareAppMessage'
        ]
    });
}

/**
 * 从url中获取某个参数的值
 * @param name
 * @returns {Array|{index: number, input: string}|string}
 */
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * 返回字符的字节长度（汉字算2个字节）
 * @param val
 * @returns {number}
 */
var getByteLen = function (val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^x00-xff]/ig) != null) //全角
            len += 2;
        else
            len += 1;
    }
    ;
    return len;
}