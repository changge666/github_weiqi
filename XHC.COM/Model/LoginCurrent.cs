using XHC.COM.Extend;
using XHC.COM.Help;

namespace XHC.COM.Model
{
    public class LoginCurrent
    {
        /// <summary>
        ///     请求地址IP
        /// </summary>
        public static string ip =>
            Configs.Current.Connection.RemoteIpAddress.ToString();

        /// <summary>
        ///     登录人账号
        /// </summary>
        public static string user =>
            userInfo().GetString("user_name");

        /// <summary>
        ///     登录人姓名
        /// </summary>
        public static string username =>
            userInfo().GetString("fullname");

        /// <summary>
        ///     登录人密码
        /// </summary>
        public static string password =>
            userInfo().GetString("password");

        /// <summary>
        ///     是否登录
        /// </summary>
        public static bool is_login =>
            userInfo().Count > 0;

        /// <summary>
        ///     登录人详细信息
        /// </summary>
        public static Record user_info =>
            userInfo();

        /// <summary>
        ///     登录人详细信息
        /// </summary>
        public static string user_info_str =>
            userInfo().ToJson();

        /// <summary>
        /// 获取登陆人信息
        /// </summary>
        /// <returns></returns>
        public static Record userInfo()
        {
            try
            {
                var token = Configs.Current.Request.Headers.GetString("xhc_token");
                if (!token.IsBlank())
                {
                    return JWTHelper.SerializeJwt(token);
                }
                return new Record();
            }
            catch
            {
                return new Record();
            }
            finally { }
        }

        /// <summary>
        /// 登录
        /// </summary>
        /// <param name="userInfo"></param>
        /// <returns></returns>
        public static (bool b, string token) Login(Record userInfo)
        {
            if (userInfo.IsBlank()) return (false, "未获取到登陆人信息");
            try
            {
                var token = JWTHelper.IssueJwt(userInfo.ToJson());
                if (token.IsBlank()) return (false, "生成登录token失败");
                return (true, token);
            }
            catch
            {
                return (false, "生成登录token失败");
            }
            finally { }
        }
    }
}
