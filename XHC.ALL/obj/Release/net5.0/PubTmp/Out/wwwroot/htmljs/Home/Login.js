xhcLoad(['layui'], function () {
    var layer = layui.layer;
    let token = methos.getItem("xhc_token");
    let logname = $("input[name='logname']");
    let logpass = $("input[name='logpass']");
    let logimg = $("input[name='logimg']");
    let pic1 = "";
    if (token) {
        methos.edit("/Login/Is_Login", {}, function (res) {
            if (res.code == 200) {
                layer.alert("登陆成功");
                methos.setItem("user", res.message);
                window.location.href = "/html/Play/play.html";
            }
        });
    }


    $("#img").click(function (res) {
        imgclick();
        return false;
    });
    function imgclick(msg) {
        methos.edit("/Login/get_LoginPic", {}, function (res) {
            if (res.code == 200) {
                pic1 = res.remark;
                $("#img").attr("src", `data:image/gif;base64,${res.message}`);
                console.log(`验证码看不清请看这里！${pic1}`);
            } else {
                pic1 = "";
                $("#img").attr("src", "");
                console.log(`获取验证码图片失败`);
            }
            if (msg) layer.alert(msg);
        });
    }
    imgclick();
    $("#submit").click(function () {
        let user_name = logname.val().trim();
        let user_pass = logpass.val().trim();
        let pic = logimg.val().toUpperCase();
        if (user_name == "") {
            layer.alert("用户名未输入");
            return false;
        }
        if (user_pass == "") {
            layer.alert("密码未输入");
            return false;
        }
        if (pic == "") {
            layer.alert("验证码未输入");
            return false;
        }

        let postForm = { data: JSON.stringify({ "user_name": user_name.toUpperCase(), "user_pass": user_pass.toLowerCase(), "pic": pic.toUpperCase(), "pic1": pic1.toUpperCase() }) };
        methos.edit("/Login/to_Login", postForm, function (res) {
            if (res.code == 200) {
                layer.alert("登陆成功");
                methos.setItem("user", user_name.toUpperCase());
                methos.setItem("xhc_token", res.message);
                window.location.href = "/html/Play/play.html";
            } else {
                imgclick(res.message);
            }
        });
        return false;
    });
}, false, true);