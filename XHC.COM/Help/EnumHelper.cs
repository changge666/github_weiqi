using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using XHC.COM.Extend;

namespace XHC.COM.Help
{
    public class EnumHelper
    {
        #region 枚举操作

        /// <summary>
        /// 枚举字段描述列表
        /// </summary>
        /// <param name="t"></param>
        /// <param name="type">类型 0枚举字符串 1下标 2描述</param>
        /// <param name="value">值</param>
        /// <returns></returns>
        public static List<Tuple<Enum, string, int, string>> GetEnumStringList(Type t, int type = -1, string value = null)
        {
            var valueDescList = Enum.GetValues(t).Cast<Enum>().Where(
                x =>
                {
                    if (type > -1 && !value.IsBlank())
                    {
                        switch (type)
                        {
                            case 0:
                                if (GetEnumString(x).Equals(value)) return true;
                                return false;
                            case 1:
                                if ((GetEnumInt(x) + "").Equals(value)) return true;
                                return false;
                            case 2:
                                if (GetEnumDescription(x).Equals(value)) return true;
                                return false;
                            default: return false;
                        }
                    }
                    return true;
                }).Select(m => { return new Tuple<Enum, string, int, string>(m, GetEnumString(m), GetEnumInt(m), GetEnumDescription(m)); }).ToList();
            return valueDescList;
        }

        /// <summary>
        /// 获取枚举的描述信息（Description特性）
        /// </summary>
        /// <param name="enumValue">枚举值</param>
        /// <returns></returns>
        public static string GetEnumDescription(Enum enumValue)
        {
            Type type = enumValue.GetType();
            FieldInfo fi = type.GetField(enumValue.ToString());
            var attrs = fi.GetCustomAttributes(typeof(DescriptionAttribute), true)?.ToList() ?? new List<object>();
            if (attrs.Count > 0) return ((DescriptionAttribute)attrs[0]).Description;
            return "";
        }

        /// <summary>
        /// 获取枚举字符串
        /// </summary>
        /// <returns></returns>
        public static string GetEnumString(Enum enums)
        {
            return Enum.GetName(enums.GetType(), enums);
        }

        /// <summary>
        /// 获取枚举下标
        /// </summary>
        /// <returns></returns>
        public static int GetEnumInt(Enum enums)
        {
            return Convert.ToInt32(enums);
        }

        #endregion
    }
}
