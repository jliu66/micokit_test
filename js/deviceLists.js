/**
 * Created by CJLIU on 2015/9/19.
 */
$(document).ready(function () {
    if(window.location.search == ""){
        alert("null");
        $.ajax({
            type: "GET",
            url: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb4ee08c8823d1555&redirect_uri=http://97256c69-6723-43fb-87dc-167eaf9dc501.app.easylink.io/oauth.php%3Fwxappid%3Dwxb4ee08c8823d1555&response_type=code&scope=snsapi_base&state=123&connect_redirect=1#wechat_redirect",
            //dataType: "json",
            // headers: {
            //     "AUTHORIZATION": "token " + access_token
            // },
            success: function (data) {
                alert(data);
                
            }
        })
    }

    var thisDeviceId;
    var access_token = getParameterByName('access_token');
    //初始化设备列表
    var deviceLists = getParameterByName('device_list');
    if (deviceLists !== null) {
        try {
            deviceLists = JSON.parse(deviceLists);
            for (var i in deviceLists) {
                var device = deviceLists[i];
                if (device[0] === null) continue;
                var device_id = device[0];
                var bssid = device_id.split('/')[1];
                var alias = device[3] ? device[3] : "TH-1507";
                var product_id = device_id.split('/')[0];
                //var time = new Date(parseInt(device[1])*1000).toLocaleString();
                //var url = product_id + '.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                var url = 'device.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                var state = device[2];
                //渲染设备列表
                addDeviceLists(device_id, state, alias, bssid, url);
            }
        } catch (e) {
            alert(e);
        }
    }

    /* 刷新列表 */
    $("#reloadPage").click(function () {
        $.ajax({
            type: "POST",
            url: "http://api.easylink.io/v1/device/devices",
            //dataType: "json",
            headers: {
                "AUTHORIZATION": "token " + access_token
            },
            success: function (data) {
                console.log(data);
                $.each(data, function (i, _data) {
                    var device_id = _data.id;
                    var product_id = device_id.split('/')[0];
                    var bssid = _data.bssid;
                    var alias = _data.alias;
                    //var url = product_id + '.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                    var url = 'device.html?device_id=' + device_id + '&access_token=' + access_token + '&alias=' + alias;
                    var state = _data.online;
                    //移除设备列表
                    $("#list").children().remove();
                    //渲染设备列表
                    addDeviceLists(device_id, state, alias, bssid, url);
                    //移除修改名称click事件
                    offModifyName();
                    //添加修改名称click事件
                    onModifyName();
                });
            },
            error: function (data) {
                //alert("修改名称失败");
                console.log(data);
            }
        });
    });

    /* 修改名称 */
    onModifyName();
    $("#confirm").on("click", function () {
        var modifyContent = $("#modifyContent").val();
        if (!modifyContent) {
            alert('写点什么吧');
        } else if (getByteLen(modifyContent) > 10) {
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
                    $("#alias").html(modifyContent);
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

    /* 添加修改名称的click事件 */
    function onModifyName() {
        $(".modifyName").on("click", function () {
            //模态框显示
            $("#inputModal").modal("show");
            thisDeviceId = $(this).parents()[2].id;
        });
    }

    /* 移除修改名称的click事件 */
    function offModifyName() {
        $(".modifyName").off("click");
    }

    /**
     * 渲染设备列表
     * @param device_id
     * @param state
     * @param alias
     * @param bssid
     * @param url
     */
    function addDeviceLists(device_id, state, alias, bssid, url) {
        //填充列表
        var template = $("#listTemp").html();
        var list = $("<div id='" + device_id + "'>");
        list.html(template);
        if (state == 0) {
            state = "离线";
            $(list).removeClass("row-online-state");
//          addDeviceListsData(list,state, alias, bssid, "javascript:void(0);");
       		addDeviceListsData(list,state, alias, bssid, url);
        } else {
            state = "在线";
            $(list).addClass("row-online-state");
            addDeviceListsData(list,state, alias, bssid, url);
        }    
    }
    function addDeviceListsData(divName,state, alias, bssid, url){
//  	$(divName).addClass("row-online-state");
    	$(divName).on('touchstart click',function(e){
			if($(e.target).attr('id')!="selectDevice"&&$(e.target).attr('id')!="removeDevice")
			{
				window.location.href=url;
			}
    	});
        $(divName).find("#state").text(state);
        $(divName).find("#alias").text(alias);
        $(divName).find("#bssid").text(bssid);
        $("#list").append(divName);
    }

	/**测试*/
//	$('#listTemp').on('touchstart click',function(e){
//		console.log("aa");
//		$('#listTemp').addClass('row-online-state');
//			if($(e.target).attr('id')!="selectDevice"&&$(e.target).attr('id')!="removeDevice")
//			{
//				window.location.href='http://192.168.2.83:8000/device.html?device_id=b7884af8/c89346918374&access_token=ee26e95e-8a5e-49c6-bea9-420de852813d&alias=MiCOKit-3288';
//			}else{
//				console.log("aa");
//				$('#listTemp').removeClass('row-online-state');
//			}
//  });

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

});

