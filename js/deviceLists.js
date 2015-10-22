/**
 * Created by CJLIU on 2015/9/19.
 */
$(document).ready(function () {
    //当前设备ID
    var thisDeviceId;
    // 得到请求的sign
    var requestSign = getRequestSign();
    var access_token = getParameterByName('access_token');
    // 请求头部参数
    var requestHeader = {
        'Authorization': 'token ' + access_token,
        'X-Application-Id': appId,
        'X-Request-Sign': requestSign
    };

    //微信jssdk配置 正式需打开
    var signInfo = getWechatSignInfo();
    var wechatSign = getWechatSign(signInfo);
    wechatConfig(signInfo, wechatSign);
    wx.ready(function () {
        openWXDeviceLib();
        deleteDevice();
        shareDevice();
    })

    // 初始化设备列表
    var deviceLists = getParameterByName('device_list');

    if (deviceLists !== null) {
        try {
            deviceLists = JSON.parse(deviceLists);
            for (var i in deviceLists) {
                var device = deviceLists[i];
                if (device[0] === null) continue;
                var device_id = device[0];
                var bssid = device_id.split('/')[1];
                var alias = device[3] ? device[3] : device_id;
                var url = 'device.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                var state = device[2];
                //渲染设备列表
                addDeviceLists(device_id, state, alias, bssid, url);
            }
        } catch (e) {
            alert(e);
        }
    } else {
        alert('请扫描设备二维码');
    }
    onModifyName();
    manageDevice();
    //deleteDevice();
    //shareDevice();
    modifyDeviceName();
    autoReloadPage();
    /* 自动刷新列表 */
    function autoReloadPage() {
        // 初始刷新列表次数
        var reloadTimers = 0;
        var reloadTimer = setInterval(function () {
            reloadTimers++;
            reloadPage();
            if (reloadTimers == maxReloadTimers) {
                clearInterval(reloadTimer);
            }
        }, reloadInterval);
    }

    /* 刷新列表 */
    function reloadPage() {
        alert('reload');
        $.ajax({
            type: "POST",
            url: "http://api.easylink.io/v1/device/devices",
            headers: requestHeader,
            success: function (data) {
                console.log(data);
                //移除设备列表
                $("#list").children().remove();
                $.each(data, function (i, _data) {
                    var device_id = _data.id;
                    var product_id = device_id.split('/')[0];
                    var bssid = _data.bssid;
                    var alias = _data.alias;
                    var url = 'device.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                    var state = _data.online;
                    var wxDevice_id = _data.wx_device_id;

                    //渲染设备列表
                    addDeviceLists(device_id, state, alias, bssid, url, wxDevice_id);
                    //移除设备管理click事件
                    offClickEvent();
                    //添加设备管理click事件
                    manageDevice();
                    deleteDevice();
                    shareDevice();
                    //添加修改名称click事件
                    onModifyName();
                });
            },
            error: function (data) {
                console.log(data);
            }
        });
    }

    /* 修改名称 */
    function modifyDeviceName() {
        $("#confirm").on("click", function () {
            var modifyContent = $("#modifyContent").val();
            console.log('modifyContent:', modifyContent);
            if (!modifyContent) {
                alert('写点什么吧');
            } else if (getByteLen(modifyContent) > 16) {
                alert('超过字数咯');
            } else {
//      	alert(thisDeviceId);
                $.ajax({
                    type: "POST",
                    url: "http://api.easylink.io/v1/device/modify",
                    data: {
                        "device_id": thisDeviceId,
                        "alias": modifyContent
                    },
                    headers: {
                        "AUTHORIZATION": "token " + access_token
                    },
                    success: function () {
                        thisDeviceId = thisDeviceId.replace(/\//g, "\\\/");
                        $("#" + thisDeviceId + " #alias").html(modifyContent);
                    },
                    error: function (data) {
                        alert("修改名称失败");
                        console.log(data);
                    }
                });
                //模态框隐藏
                $("#inputModal").modal("hide");
                //清除输入框内容
                $("#modifyContent").val('');
            }
        });
    }

    /* 添加修改名称的click事件 */
    function onModifyName() {
        $(".modifyName").on("click", function (e) {
            //模态框显示
            $("#inputModal").modal("show");
            //样式改了之后，这里可能有问题
            thisDeviceId = $(this).parents()[2].id;

        });
    }

    /* 移除click事件 刷新页面需要 */
    function offClickEvent() {
        $(".modifyName").off("click");
        $(".deleteDevice").off("click");
        $(".manageDevice").off("click");
    }

    /* 设备管理 */
    function manageDevice() {
        $(".manageDevice").on("click", function () {
            console.log('mange');
            var userName = getUserName(access_token, requestHeader);
            //样式改了之后，这里可能有问题
            thisDeviceId = $(this).parents()[2].id;
            var role = getDeviceUser(thisDeviceId, requestHeader, userName);
            var customRole = getDeviceProperties(thisDeviceId, requestHeader, 'customRole');
            // 设备主人
            if (role == "owner") {
                //按钮 4个 （移除 修改 用户管理 设备分享）

            } else if (role == "share") {
                // 用户有权限
                if (!customRole || _.indexOf(customRole, userName) == -1) {
                    //按钮2个 移除 修改

                } else {
                    //按钮1个 移除

                }
            }

            // 得到微信access_token 用户管理中需要用到
            var accessToken = getWechatAccessToken(requestHeader);
        })
    }

    /* 移除设备 */
    function deleteDevice() {
        $(".eleteDevice").on("click", function () {
            //样式改了之后，这里可能有问题
            thisDeviceId = $(this).parents()[2].id;
            var deviceId = thisDeviceId.replace(/\//g, "\\\/");
            var wxDeviceId = $("#" + deviceId).data('wxdeviceid');
            getWxDeviceTicket(wxDeviceId, function (err, ticket) {
                if (!!err) return;
                unbindDevice(requestHeader, thisDeviceId, ticket, function (err, res) {
                    if (!err && res.result == "success") {
                        $("#" + deviceId).alert();
                        alert("删除成功");
                    } else {
                        alert("删除失败");
                    }
                });
            });
        })
    }

    /* 设备分享 */
    function shareDevice() {
        alert("share");
        $(".deleteDevice").on("click", function () {
            //样式改了之后，这里可能有问题
            thisDeviceId = $(this).parents()[2].id;
            alert(thisDeviceId);
            var requestHeader = {
                'Authorization': 'token ' + devAccessToken
            };
            var ticket =  getDeviceQrcode(requestHeader,thisDeviceId);
            alert('ticket: '+ticket);
            shareAppMessage(ticket);
        })
    }

    /**
     * 渲染设备列表
     * @param device_id
     * @param state
     * @param alias
     * @param bssid
     * @param url
     */
    function addDeviceLists(device_id, state, alias, bssid, url, wxDeviceId) {
        //填充列表
        var template = $("#listTemp").html();
        var list = $("<div id='" + device_id + "' data-wxDeviceId='" + wxDeviceId + "' class='alert fade in'>");
        list.html(template);
        if (state == 0) {
            state = "离线";
            $(list).removeClass("row-online-state");
            addDeviceListsData(list, state, alias, bssid, url, wxDeviceId);
        } else {
            state = "在线";
            $(list).addClass("row-online-state");
            addDeviceListsData(list, state, alias, bssid, url, wxDeviceId);
        }
    }

    function addDeviceListsData(divName, state, alias, bssid, url) {
        var equipmentName;
        $(divName).on('click', function (e) {
            if ($(e.target).attr('id') != "selectDevice" && $(e.target).attr('id') != "deleteDevice" && $(e.target).attr('id') != "manageDevice") {
                $(e.target).parents('.fade').addClass('row-online-state-shadow');
                equipmentName = $(e.target).parents('.fade').find('ul #alias').text();
                console.log(equipmentName);
                setTimeout(function () {
                    $(e.target).parents('.fade').removeClass('row-online-state-shadow');
                }, 200);
                setTimeout(function () {
                    var equipmentUrl = url.split("alias=")[0];
                    window.location.href = equipmentUrl + "alias=" + equipmentName;
                }, 300);
            }
        });
        $(divName).find("#state").text(state);
        $(divName).find("#alias").text(alias);
        $(divName).find("#bssid").text(bssid);
        $("#list").append(divName);
    }

});

