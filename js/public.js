/**
 * Created by UGEN75 on 2015/10/16.
 */

/**
 * ���������ǩ��
 */
function getRequestSign() {
    var now = Math.round(new Date().getTime() / 1000);
    var sign = $.md5(appKey + now);
    return sign + ", " + now;
}

/**
 * �õ�΢��openID
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
 * �õ�΢��access_token
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
 * �õ��豸���û�
 * @param deviceId
 * @param requestHeader
 * @param userName
 * @returns {string}
 */
function getDeviceUser(deviceId, requestHeader, userName) {
    var role = "share";
    $.ajax({
        type: "GET",
        async: false,
        url: "http://api.easylink.io/v2/devices/users",
        data: {"device_id": deviceId},
        headers: requestHeader,
        success: function (data) {
            console.log(data);
            role = (_.find(data, function (_data) {
                return _data.username == userName
            })).role;
        },
        error: function (data) {
            console.log(data);
        }
    });
    console.log('role: ', role);
    return role;
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
            alert('unbind:'+  JSON.stringify(data));
            callback(null, data);
        },
        error: function (data) {
            alert('unbind:'+  JSON.stringify(data));
            callback("err", null);
            console.log(data);
        }
    });

}
function getWechatSignInfo() {
    //var signInfo = {
    //    "appId": "wxb4ee08c8823d1555",
    //    "nonceStr": "i76FhrCbUXj66Bgj",
    //    "timestamp": 1445408599,
    //    "url": "http:\/\/97256c69-6723-43fb-87dc-167eaf9dc501.app.easylink.io\/sign.php?callback=jQuery1910879160191398114_1445408640647&_=1445408640648",
    //    "signature": "6d17acbd04e13315b369802fcded94503cc826fa",
    //    "rawString": "jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VIx0OV_QLWcz5fhkwjsIUkPVzKepACTAeNoWrb6_uHo2JNYRmuaw71YKrUDAGSDbfw&noncestr=i76FhrCbUXj66Bgj&timestamp=1445408599&url=http:\/\/97256c69-6723-43fb-87dc-167eaf9dc501.app.easylink.io\/sign.php?callback=jQuery1910879160191398114_1445408640647&_=1445408640648",
    //    "jsapiTicket": "sM4AOVdWfPE4DxkXGEs8VIx0OV_QLWcz5fhkwjsIUkPVzKepACTAeNoWrb6_uHo2JNYRmuaw71YKrUDAGSDbfw"
    //};
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

/**
 * �õ�΢��ǩ��
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
        alert("wx.openWXDeviceLib " + JSON.stringify(res));
    });

}
function wechatConfig(signInfo, wechatSign) {
    wx.config({
        debug: true, // ��������ģʽ,���õ�����api�ķ���ֵ���ڿͻ���alert��������Ҫ�鿴����Ĳ�����������pc�˴򿪣�������Ϣ��ͨ��log���������pc��ʱ�Ż��ӡ��
        appId: signInfo.appId, // ������ںŵ�Ψһ��ʶ
        timestamp: signInfo.timestamp, // �������ǩ����ʱ���
        nonceStr: signInfo.nonceStr, // �������ǩ���������
        signature: wechatSign, // ���ǩ��������¼1
        jsApiList: [
            // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
            'openWXDeviceLib',
            'getWXDeviceTicket'
        ]
    });
}

/**
 * ��url�л�ȡĳ��������ֵ
 * @param name
 * @returns {Array|{index: number, input: string}|string}
 */
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * �����ַ����ֽڳ��ȣ�������2���ֽڣ�
 * @param val
 * @returns {number}
 */
var getByteLen = function (val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^x00-xff]/ig) != null) //ȫ��
            len += 2;
        else
            len += 1;
    }
    ;
    return len;
}