using System;
using XHC.COM.Extend;

namespace XHC.COM.Model
{
    /// <summary>
    /// 公共返回参数
    /// </summary>
    public class ReResult
    {
        //构造函数
        public ReResult(int Code = 200, string Message = "")
        {
            var time = DateTime.Now;
            this.CrTimeDate = time;
            this.CrTime = time.ToString("yyyy-MM-dd HH:mm:ss.fff");
            this.Code = Code;
            if (Code != 200)
            {
                this.Message = Message;
            }
        }
        //构造函数
        public ReResult(string Message)
        {
            var time = DateTime.Now;
            this.CrTimeDate = time;
            this.CrTime = time.ToString("yyyy-MM-dd HH:mm:ss.fff");
            this.Message = Message;
        }
        //设置状态并返回对象
        public ReResult setCode(int Code = 200, string Message = "")
        {
            this.Code = Code;
            if (Code != 200)
            {
                this.Message = Message;
            }
            return this;
        }
        //设置信息并返回对象
        public ReResult setMessage(string Message)
        {
            this.Message = Message;
            return this;
        }
        //设置返回结果并返回对象
        public ReResult setData(object Result)
        {
            if (this.Code != 200) return this;
            this.Result = Result;
            return this;
        }
        //状态
        public int Code { get; set; } = 200;
        //信息
        public string Message { get; set; } = "";
        //备注
        public string Remark { get; set; } = "";
        //返回结果
        public object Result { get; set; } = new { };
        //方法路径;
        public string Rel => Configs.Current.Request.Path;
        //成功或失败
        public bool Success => this.Code == 200;
        //对象生成时间
        public string CrTime { get; }
        //对象生成时间Datetime
        private DateTime CrTimeDate { get; }
        //对象返回时间
        public string ReTime { get; private set; }
        //对象停留时间
        public double ResidenceTime { get; private set; }
        //序列化
        public override string ToString()
        {
            var time = DateTime.Now;
            this.ReTime = time.ToString("yyyy-MM-dd HH:mm:ss.fff");
            this.ResidenceTime = Math.Round((time - CrTimeDate).TotalMilliseconds / 1000, 3);
            return this.ToJson();
        }

    }
}
