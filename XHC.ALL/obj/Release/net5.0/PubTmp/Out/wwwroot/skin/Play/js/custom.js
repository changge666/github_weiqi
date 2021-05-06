var vLis;
var vLen;
var curr;
var video;

$(document).ready(function () {
    //菜单
    $(".navbar-toggle-zdy").click(function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $(".M_box").fadeOut("slow");
        } else {
            $(this).addClass("active");
            $(".M_box").fadeIn("slow");
        }
    });
    //排行榜
    $(".row_paihangbang .border_item").each(function (i, model) {
        $(this).click(function () {
            $(".row_paihangbang .border_item").removeClass("cur");
            $(this).addClass("cur");
        }); 
    });
    //好友列表tab切换
    $(".friend_tab .tab div").each(function () {
        $(this).click(function () {
            var data = $(this).attr("data");
            $(".friend_tab .tab").removeClass("cur");
            $(this).parent(".tab").addClass("cur");

            $(".friend_list").hide();
            $("#friend_list_" + data + "").show();
        });
    });
    //好友分组折叠
    $(".friend_list .item .zdmenu").each(function () {
        $(this).click(function () {
            if ($(this).parent(".item").hasClass("down")) {
                $(".friend_list .item").removeClass("down");
                $(".friend_list").niceScroll({ cursorborder: "#7D7D7D", cursorcolor: "#7D7D7D" });
            } else {
                $(this).parent(".item").addClass("down");
                $(".friend_list").niceScroll({ cursorborder: "#7D7D7D", cursorcolor: "#7D7D7D" });
            }
        });
    });
    //关闭
    $('.f_close').click(function () {
        $(this).parent().parent().css('display', 'none');
    })
    //最小化
    $('.f_small').click(function () {
        $(this).parent().parent().css('display', 'none');
    })
    //右键事件
    $(".friend_list .item ul li").each(function () {
        $(this).contextMenu({
            width: 150, // width
            itemHeight: 35, // 菜单项height
            bgColor: "#FFFFFF", // 背景颜色
            color: "#333333", // 字体颜色
            fontSize: 14, // 字体大小
            hoverColor: "#333333", // hover字体颜色
            hoverBgColor: "#F5F5F5", // hover背景颜色
            target: function (ele) { // 当前元素--jq对象
                console.log(ele);
            },
            onContextMenu: function (e) {
                if ($(e.target).attr('data') == 'dontShow') return false;
                else return true;
            },
            onShowMenu: function(e, menu) {
                if ($(e.target).attr('data') == 'showOne') {
                    $('#item_2, #item_3', menu).remove();
                }
                return menu;
            },
            menu: [{ // 菜单项
                text: "发私信",
                callback: function () {
                    show("light");
                }
            },
                {
                    text: "查看资料",
                    callback: function () {
                        show("light");
                    }
                },
                {
                    text: "加入黑名单",
                    callback: function () {
                        alert("加入黑名单");
                    }
                },
                {
                    text: "删除好友",
                    callback: function () {
                        alert("删除好友");
                    }
                }
            ]
        });

        //好友悬浮框
        $(this).hover(function () {
            $(this).find(".myinfo").show();
        }, function () {
            $(this).find(".myinfo").hide();
        });
    });
    //定位消息位置
    scrollTopHeight();

    //消息发送
    $("#ksDirSendBtnAea").click(function () {
        var messContent = $("#ksEditInstance").html();
        var htmlStr = "<div class=\"msg_cus\"><div class=\"msgtitle\"><span style=\"color:#9a9a9a\">我 07-28 15:51:11</span></div><div class=\"msg\"><div class=\"after k_s_ol_pngFix\"></div><span style=\"color:#161515\" id=\"q1499586672376_884\">" + messContent + "</span></div><div style=\"clear:both\"></div><span class=\"spanicon\"></span></div>";
        if (messContent != "") {
            $(".divDialog").append(htmlStr);
            $("#ksEditInstance").html("");
        }
        scrollTopHeight();
    });
    // Enter键事件，发送
    $("body").keypress(function (e) {
        if (e.keyCode == 13) {
            $("#ksDirSendBtnAea").click();
        }
    });
   

    //相关视频滚动条
    $(".do-nicescrol").niceScroll({ cursorborder: "#3B3F44" });

    //视频播放
    vList = new Array("video/zpvideo.mp4", "video/zpvideo.mp4", "video/zpvideo.mp4"); // 初始化播放列表  
    vLen = vList.length;
    curr = 0;
    video = document.getElementById("myvideo");

    if (video != null) {
        video.addEventListener("ended", function () {
            //    alert("已播放完成，继续下一个视频");  
            //document.getElementById("address").innerHTML =vList[curr]+"已播放完成，继续下一个视频";  
            play();
        });
        play();
    }
});
function play() {
    LoadClass(curr);

    video.src = vList[curr];
    video.load();
    video.play();
    curr++;
    if (curr >= vLen) {
        curr = 0; //重新循环播放  
        LoadClass(0);
    }
}
function LoadClass(i) {
    $(".videolist .item").removeClass("cur");
    $(".videolist .item").eq(i).addClass("cur");
}

//对弈详情tab切换
function Tab01(obj){
    $(".item6 .border_item").removeClass("cur");
    $(obj).parent(".border_item").addClass("cur");
    $(".item6 .content").hide();
    $(".item6 .content-" + $(obj).attr("data") + "").show();
}

//关闭弹出框
function hide(tag) {
    $("#" + tag + "").hide();
    $("#fade").hide();
}
//显示弹出框
function show(tag) {
    $("#" + tag + "").show();
}

//滚动条高度
function scrollTopHeight() {
    if ($(".divDialog").html() != undefined) {
        var height = $(".divDialog")[0].scrollHeight;
        $(".divDialog").scrollTop(height);
        //对话窗口
        $(".divDialog").niceScroll({ cursorborder: "#7D7D7D", cursorcolor: "#7D7D7D" });
    }
}
