using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using XHC.COM.Model;
using XHC.COM.Extend;

namespace XHC.COM.Help
{
    public class JWTHelper
    {
        /// <summary>
        /// 颁发JWT字符串
        /// </summary>
        /// <param name="tokenModel"></param>
        /// <returns></returns>
        public static string IssueJwt(string suerinfo)
        {
            //获取Appsetting配置
            string iss = Configs.getManger("JwtSetting:Issuer", "settings");
            string aud = Configs.getManger("JwtSetting:Audience", "settings");
            string secret = Configs.getManger("JwtSetting:SecretKey", "settings");
            string time = Configs.getManger("JwtSetting:Time", "settings");
            long.TryParse(time, out long stime);

            var claims = new List<Claim>
                {
                 /*
                 * 特别重要：
                   1、这里将用户的部分信息，比如 uid 存到了Claim 中，如果你想知道如何在其他地方将这个 uid从 Token 中取出来，请看下边的SerializeJwt() 方法，或者在整个解决方案，搜索这个方法，看哪里使用了！
                   2、你也可以研究下 HttpContext.User.Claims ，具体的你可以看看 Policys/PermissionHandler.cs 类中是如何使用的。
                 */

                //new Claim(JwtRegisteredClaimNames.Jti, tokenModel.Uid.ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, $"{new DateTimeOffset(DateTime.Now).ToUnixTimeSeconds()}"),
                new Claim(JwtRegisteredClaimNames.Nbf,$"{new DateTimeOffset(DateTime.Now).ToUnixTimeSeconds()}") ,
                //这个就是过期时间，目前是过期1000秒，可自定义，注意JWT有自己的缓冲过期时间
                new Claim(JwtRegisteredClaimNames.Exp,stime <= 0 ? "0": $"{new DateTimeOffset(DateTime.Now.AddSeconds(stime)).ToUnixTimeSeconds()}"),
                new Claim(ClaimTypes.Expiration,stime <= 0 ? "": DateTime.Now.AddSeconds(stime).ToString()),
                new Claim(JwtRegisteredClaimNames.Iss,iss),
                new Claim(JwtRegisteredClaimNames.Aud,aud),
                new Claim(ClaimTypes.Role, suerinfo)
            };

            // 可以将一个用户的多个角色全部赋予；
            //claims.AddRange(tokenModel.Role.Split(',').Select(s => new Claim(ClaimTypes.Role, s)));

            //秘钥 (SymmetricSecurityKey 对安全性的要求，密钥的长度太短会报出异常)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: iss,
                claims: claims,
                signingCredentials: creds);

            var jwtHandler = new JwtSecurityTokenHandler();
            var encodedJwt = jwtHandler.WriteToken(jwt);
            return encodedJwt;
        }

        /// <summary>
        /// 解析
        /// </summary>
        /// <param name="jwtStr"></param>
        /// <returns></returns>
        public static Record SerializeJwt(string jwtStr)
        {
            var jwtHandler = new JwtSecurityTokenHandler();
            JwtSecurityToken jwtToken = jwtHandler.ReadJwtToken(jwtStr);
            try
            {
                var time1 = new DateTimeOffset(DateTime.Now).ToUnixTimeSeconds();
                var b = jwtToken.Payload.TryGetValue(JwtRegisteredClaimNames.Exp, out object time);
                if (!b) return new Record();
                var time2 = long.Parse(time.ToString() ?? "0");
                if (time2 == 0)
                {
                    string time3 = Configs.getManger("JwtSetting:Time", "settings");
                    long.TryParse(time3, out long stime);
                    if (stime > 0) return new Record();
                }
                else if (time2 < time1) return new Record();
                var b1 = jwtToken.Payload.TryGetValue(ClaimTypes.Role, out object role);
                if (!b1) return new Record();
                return role.ObjectTo<Record>();
            }
            catch
            {
                return new Record();
            }
        }
    }
}