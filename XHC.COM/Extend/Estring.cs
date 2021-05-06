using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using XHC.COM.Help;
using XHC.COM.Model;

namespace XHC.COM.Extend
{
    public static class EString
    {
        #region obj=》json  json=》obj

        /// <summary>
        /// 判断对象是否为空
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static bool IsBlank(this object obj)
        {
            if (obj == null) return true;
            switch (obj)
            {
                case string str:
                case char ch:
                case bool bo:
                case byte by:
                case short sh:
                case int i:
                case long lo:
                case double dou:
                case decimal de:
                case float fl:
                case DateTime da:
                    return obj.ToString().Equals("");
                case Record rec:
                    return rec.Count == 0;
                case KeyValuePair<string, object> rec:
                    return rec.Key.IsBlank();
            }
            return false;
        }

        /// <summary>
        /// 判断对象是否为空
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static bool IsBlank<T>(this List<T> obj)
        {
            if (obj == null) return true;
            return obj.Count == 0;
        }

        /// <summary>
        /// 判断对象是否为空
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static bool IsBlank<T>(this T[] obj)
        {
            if (obj == null) return true;
            return obj.ToList().Count == 0;
        }

        /// <summary>
        /// 反序列化
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T FromObject<T>(this string obj)
        {
            var result = default(T);
            if (!obj.IsBlank())
            {
                try
                {
                    switch (typeof(T).Name.ToLower())
                    {
                        case "string":
                        case "char":
                        case "bool":
                        case "byte":
                        case "short":
                        case "int":
                        case "long":
                        case "doule":
                        case "decimal":
                        case "float":
                        case "datetime":
                            return (T)Convert.ChangeType(obj, typeof(T));
                        default:
                            return JsonConvert.DeserializeObject<T>(obj);
                    }
                }
                catch { }
            }
            return result;
        }

        /// <summary>
        /// 序列化
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string ToJson(this object obj, string format = null)
        {
            if (obj == null) return "";
            try
            {
                switch (obj)
                {
                    case string str:
                    case char cha:
                    case bool boo:
                    case byte byt:
                    case short shor:
                    case int ins:
                    case long lon:
                    case double doub:
                    case decimal decima:
                    case float floa:
                        return format.IsBlank() ? obj.ToString() : string.Format(obj.ToString(), format);
                    case DateTime da:
                        return format.IsBlank() ? da.ToString("yyyy-MM-dd HH:mm:ss") : da.ToString(format);
                    default:
                        return format.IsBlank() ? JsonConvert.SerializeObject(obj) : string.Format(JsonConvert.SerializeObject(obj), format);
                }
            }
            catch
            {
                return "";
            }
        }

        /// <summary>
        /// object转换
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T ObjectTo<T>(this object obj)
        {
            var result = default(T);
            if (!obj.IsBlank())
            {
                switch (obj)
                {
                    case string str:
                        result = str.FromObject<T>();
                        break;
                    default:
                        result = obj.ToJson().FromObject<T>();
                        break;
                }
            }
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static Record ToRecord(this string str)
        {
            return str.FromObject<Record>();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="strs"></param>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string Join(this string[] strs, string str)
        {
            return strs.IsBlank() ? string.Join(str ?? "", strs) : "";
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="strs"></param>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string Join(this List<string> strs, string str)
        {
            return strs.IsBlank() ? string.Join(str ?? "", strs) : "";
        }

        /// <summary>
        /// 克隆
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T Clone<T>(this object obj)
        {
            var result = default(T);
            if (obj.IsBlank()) return result;
            var str = obj.ToJson();
            return str.FromObject<T>();
        }

        /// <summary>
        /// json文件路径转对象
        /// </summary>
        /// <typeparam name="T">对象</typeparam>
        /// <param name="path">文件路径</param>
        /// <returns></returns>
        public static T FileFromObject<T>(this string path)
        {
            var result = default(T);
            try
            {
                if (File.Exists(path))
                {

                    string value = "";
                    using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        using (StreamReader sr = new StreamReader(fs, Encoding.GetEncoding("utf-8")))
                        {
                            value = sr.ReadToEnd().ToString();
                        }
                    }
                    value = value.DeleteComments();
                    result = value.FromObject<T>();
                }
            }
            catch { }
            return result;
        }

        /// <summary>
        /// 去除json中的注释
        /// </summary>
        /// <param name="content">json内容</param>
        /// <returns>去除注释的json数据</returns>
        public static string DeleteComments(this string content)
        {
            content = content.Trim();
            string pattern = "^\\s*(var)\\s*\\w*\\s*=\\s*(\\{|\\[)";
            if (Regex.IsMatch(content, pattern))
            {
                content = Regex.Replace(content, "^\\s*(var)\\s*\\w*\\s*=", "");
            }
            content = content.Trim();
            //            content = Regex.Replace(content, "^\\s*", "");//删除前置空格
            content = Regex.Replace(content, "\\s//.+\\n", "");//删除行注释
            content = content.Replace("\n", "");
            content = Regex.Replace(content, "/\\*[\\s\\S]*?\\*/", "", RegexOptions.Multiline);//删除块注释
            return content.Trim();
        }

        #endregion

        #region Record拼Linq

        /// <summary>
        /// 
        /// </summary>
        public static IEnumerable<T> ForEach<T>(this IEnumerable<T> en, Action<T> action)
        {
            return null;
        }

        #endregion

        #region 数组筛选

        /// <summary>
        /// 数组是否含有某个值
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="strs"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static bool HasValue<T>(this List<T> strs, T value)
        {
            var ty = strs.Sum(x => x.ToJson().Equals(value.ToJson()) ? 1 : 0);
            return ty > 0;
        }

        /// <summary>
        /// 获取数组是否含有某个相似的值的下标
        /// </summary>
        /// <param name="strs"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static List<int> GetHasValueIndex<T>(this List<T> strs, T value)
        {
            var sint = new List<int>();
            var u = 0;
            var ty = strs.Sum(x =>
            {
                var b = x.Equals(value);
                if (b) sint.Add(u);
                u++;
                return b ? 1 : 0;
            });
            return sint;
        }

        /// <summary>
        /// 数组是否含有某个相似的值
        /// </summary>
        /// <param name="strs"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static bool HasValueLike(this List<string> strs, string value)
        {
            var re = new Regex($"(?={value})");
            var ty = strs.Sum(x => re.IsMatch(x) ? 1 : 0);
            return ty > 0;
        }

        /// <summary>
        /// 获取数组是否含有某个相似的值的下标
        /// </summary>
        /// <param name="strs"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static List<int> GetHasValueLikeIndex(this List<string> strs, string value)
        {
            var sint = new List<int>();
            var re = new Regex($"(?={value})");
            var u = 0;
            var ty = strs.Sum(x =>
            {
                var b = re.IsMatch(x);
                if (b) sint.Add(u);
                u++;
                return b ? 1 : 0;
            });
            return sint;
        }

        #endregion

        #region Record 新增插入操作

        public static Record setConcat(this Record rec, Record rey)
        {
            try
            {
                var rex = new Record();
                if (rec.IsBlank())
                    rec = rex;
                if (rey.IsBlank())
                    return rec;
                rey.ForEach(x =>
                {
                    rec.Put(x.Key, x.Value);
                });
            }
            catch { }
            return rec;
        }

        #endregion

        #region 流操作

        public static bool Save(this Stream stream, string path)
        {
            try
            {
                var pp = Path.GetDirectoryName(path);
                if (!Directory.Exists(pp)) Directory.CreateDirectory(path);
                var byt = stream.ToBytes();
                using (FileStream fs1 = new FileStream(path, FileMode.Create))
                {
                    fs1.Write(byt, 0, byt.Length);
                    fs1.Close();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// 流转为数组
        /// </summary>
        /// <param name="stream"></param>
        /// <returns></returns>
        public static byte[] ToBytes(this Stream stream)
        {
            // 把 Stream 转换成 byte[] 
            if (stream.IsBlank()) return new byte[0];
            byte[] bytes = new byte[stream.Length];
            stream.Read(bytes, 0, bytes.Length);
            // 设置当前流的位置为流的开始 
            stream.Seek(0, SeekOrigin.Begin);
            return bytes;
        }

        /// <summary>
        /// 文件对比是不是同一个文件
        /// </summary>
        /// <param name="filePath1"></param>
        /// <param name="filePath2"></param>
        /// <returns></returns>
        public static bool CompareFile(this Stream stream_1, Stream stream_2)
        {
            try
            {
                if (stream_1.IsBlank() || stream_1.Length == 0) return false;
                //计算第一个文件的哈希值
                HashAlgorithm hash = HashAlgorithm.Create();
                byte[] hashByte_1 = hash.ComputeHash(stream_1);
                //计算第二个文件的哈希值
                byte[] hashByte_2 = hash.ComputeHash(stream_2);
                stream_2.Close();
                return BitConverter.ToString(hashByte_1) == BitConverter.ToString(hashByte_2);
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// 文件对比是不是同一个文件
        /// </summary>
        /// <param name="filePath1"></param>
        /// <param name="filePath2"></param>
        /// <returns></returns>
        public static bool CompareFile(this Stream stream_1, string filePath2)
        {
            try
            {
                if (stream_1.IsBlank() || stream_1.Length == 0 || filePath2.IsBlank()) return false;
                // 使用.NET内置的MD5库
                using (var md5 = MD5.Create())
                {
                    byte[] one = md5.ComputeHash(stream_1.ToBytes()), two;
                    using (var fs2 = File.Open(filePath2, FileMode.Open))
                    {
                        // 以FileStream读取文件内容,计算HASH值
                        two = md5.ComputeHash(fs2);
                    }
                    // 将MD5结果(字节数组)转换成字符串进行比较
                    return BitConverter.ToString(one) == BitConverter.ToString(two);
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// 流转为base64
        /// </summary>
        /// <param name="fsForRead"></param>
        /// <returns></returns>
        public static string ToBase64(this Stream fsForRead)
        {
            string base64Str = "";
            try
            {
                //读写指针移到距开头10个字节处
                fsForRead.Seek(0, SeekOrigin.Begin);
                byte[] bs = new byte[fsForRead.Length];
                int log = Convert.ToInt32(fsForRead.Length);
                //从文件中读取10个字节放到数组bs中
                fsForRead.Read(bs, 0, log);
                base64Str = Convert.ToBase64String(bs);
            }
            catch (Exception ex)
            {
            }
            finally
            {
            }
            return base64Str;
        }

        #endregion

        #region bytes数组操作

        /// <summary>
        /// 将字符串转为byte[]
        /// </summary>
        /// <param name="end"></param>
        /// <returns></returns>
        public static byte[] StrToByte(this string str, Encoding end = null)
        {
            if (str.IsBlank()) return new byte[0];
            if (end.IsBlank()) end = Encoding.UTF8;
            return end.GetBytes(str);
        }

        /// <summary>
        /// 将字符串转为byte[]
        /// </summary>
        /// <param name="end"></param>
        /// <returns></returns>
        public static string ByteToStr(this byte[] bytes, Encoding end = null)
        {
            if (bytes.IsBlank()) return "";
            if (end.IsBlank()) end = Encoding.UTF8;
            return end.GetString(bytes);
        }

        #endregion

        #region session扩展

        public static Record GetRecord(this ISession ss, string name)
        {
            if (ss.TryGetValue(name, out var str) && !str.IsBlank())
                return str.ByteToStr()?.ToRecord() ?? new Record();
            return new Record();
        }

        public static string GetString(this ISession ss, string name)
        {
            if (ss.TryGetValue(name, out var str) && !str.IsBlank())
                return str.ByteToStr();
            return "";
        }

        public static void SetString(this ISession ss, string name, string value)
        {
            var gg = value.IsBlank() ? new byte[0] : value.StrToByte();
            ss.Set(name, gg);
        }

        public static void SetString(this ISession ss, string name, Record value)
        {
            var gg = value.IsBlank() ? new byte[0] : value.ToString().StrToByte();
            ss.Set(name, gg);
        }

        #endregion

        #region cookie扩展

        public static void SetString(this IResponseCookies cookie, string name, string value)
        {
            cookie.Append(name, Convert.ToBase64String(value.StrToByte()));
        }

        public static void SetRecord(this IResponseCookies cookie, string name, Record value)
        {
            cookie.SetString(name, value?.ToString() ?? "");
        }

        public static string GetString(this IRequestCookieCollection cookie, string name)
        {
            var t = cookie.TryGetValue(name, out string value);
            if (t && !value.IsBlank()) return Convert.FromBase64String(value).ByteToStr();
            return "";
        }

        public static Record GetRecord(this IRequestCookieCollection cookie, string name)
        {
            return cookie.GetString(name).ToRecord() ?? new Record();
        }

        #endregion

        #region 小方法

        /// <summary>
        /// 分隔字符串
        /// </summary>
        /// <param name="str"></param>
        /// <param name="strs"></param>
        /// <returns></returns>
        public static string GetString(this IHeaderDictionary str, string key)
        {
            if (str.IsBlank() || !str.ContainsKey(key)) return "";
            return str[key];
        }

        /// <summary>
        /// 分隔字符串
        /// </summary>
        /// <param name="str"></param>
        /// <param name="strs"></param>
        /// <returns></returns>
        public static List<string> Splits(this string str, params string[] strs)
        {
            if (!str.IsBlank()) return str.Split(strs, StringSplitOptions.RemoveEmptyEntries)?.ToList() ?? new List<string>();
            return new List<string>();
        }

        /// <summary>
        /// 分隔字符串
        /// </summary>
        /// <param name="str"></param>
        /// <param name="strs"></param>
        /// <returns></returns>
        public static List<string> Split_None(this string str, params string[] strs)
        {
            if (!str.IsBlank()) return str.Split(strs, StringSplitOptions.None)?.ToList() ?? new List<string>();
            return new List<string>();
        }

        #endregion
    }
}
