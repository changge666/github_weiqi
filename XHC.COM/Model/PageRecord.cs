using System;
using System.Collections.Generic;
using System.Text;

namespace XHC.COM.Model
{
    public class PageRecord
    {

        public PageRecord(int page = 1, int limit = 10)
        {
            this.page = page;
            this.limit = limit;
        }

        /// <summary>
        /// 页数
        /// </summary>
        public int page { get; set; }

        /// <summary>
        /// 条数
        /// </summary>
        public int limit { get; set; }

        /// <summary>
        /// 总页数
        /// </summary>
        public int pagecount => getPageCount();

        /// <summary>
        /// 总条数
        /// </summary>
        public int count { get; set; } = 0;

        /// <summary>
        /// 查询到的数据
        /// </summary>
        public List<Record> records { get; set; } = new List<Record>();

        /// <summary>
        /// 页数换算
        /// </summary>
        /// <returns></returns>
        private int getPageCount()
        {
            if (count <= 0) return 0;
            if (page < 0) return 1;
            return (int)Math.Ceiling(count * 1.0 / limit);
        }

    }
}
