$(document).ready(function() {
    // console.log($.md5('f98d773200d3c8e15a52f972656dd4df'+'1444900962'));
    $.ajax({
        type: 'get',
        url: 'http://97256c69-6723-43fb-87dc-167eaf9dc501.app.easylink.io/sign.php',
        headers: {},
        cache: false,
        dataType: 'json',
        success: function(data) {
            alert("success" + data);
            //console.log("success" + data);
            // var d = new Date();
            // var timestamp = d.getTime();
            var signature = signWechat(data);
            // alert(signature);
            wx.config({
                //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appId, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: signature, // 必填，签名，见附录1
                jsApiList: [
                    // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    'openWXDeviceLib',
                    'closeWXDeviceLib',
                    'getWXDeviceTicket',
                    'onMenuShareAppMessage',
                    'configWXDeviceWiFi'
                ]
            });

            wx.ready(function() {
                wx.checkJsApi({
                    jsApiList: [
                        'getNetworkType',
                        'previewImage',
                        'openWXDeviceLib',
                        'getWXDeviceTicket',
                        'onMenuShareAppMessage',
                        'configWXDeviceWiFi'
                    ],
                    success: function(res) {
                        // alert('checkJsApi ' + JSON.stringify(res));
                    }
                });
                WeixinJSBridge.invoke('openWXDeviceLib', {}, function(res) {
                    // alert("wx.openWXDeviceLib " + JSON.stringify(res));
                });

				$('#airkiss').on("click", function() {
                    alert('airkiss');
                    WeixinJSBridge.invoke('configWXDeviceWiFi', {}, function(res) {
                        alert(JSON.stringify(res));
                    });
                })                

                $('#getTicket').on("click", function() {
                    alert('getTicket');
                    WeixinJSBridge.invoke('getWXDeviceTicket', {
                        'deviceId': '52FF4DFC6223888A4B37E8C68B269C4B8DB8CD8564EC6AD09DBB5BC2DBBDF590',
                        'type': '2'
                    }, function(res) {
                        alert(JSON.stringify(res));
                        if (res.err_msg == 'getWXDeviceTicket') {
                            var ticket = res.ticket;
                            alert(ticket);
                            console.log(ticket);
                        }
                    });
                })

                $('#share').on("click", function() {
                    wx.onMenuShareAppMessage({
                        title: '设备分享',
                        desc: '设备分享设备分享设备分享',
                        link: 'http://www.u-gen.net/demo.html',
                        imgUrl: 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg',
                        trigger: function(res) {
                            // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                            alert('用户点击发送给朋友');
                        },
                        success: function(res) {
                            alert('已分享');
                        },
                        cancel: function(res) {
                            alert('已取消');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    alert('已注册获取“发送给朋友”状态事件');
                })
            })

            wx.error(function(res) {
                alert(res.errMsg);
            });

        },
        error: function(data) {
            //console.log("失败了" + data.result);
            alert("失败了" + data.result);
        }
    })




    function signWechat(data) {
        //var appId = data.appId;
        var nonceStr = data.nonceStr;
        var timestamp = data.timestamp;
        //var timestamp = time;
        var ticket = data.jsapiTicket;
        var url = document.location.href.split('#')[0];
        var rawString = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
        //console.log('rawString: '+rawString);
        var sign = hex_sha1(rawString);
        //console.log('sign: '+sign);
        return sign;
    }

})
