using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using XHC.COM.Extend;
using XHC.COM.Model;

namespace XHC.COM.Heleper
{
    public class IOHelper
    {

        #region 文件流操作

        /// <summary> 
        /// 将 Stream 转成 byte[] 
        /// </summary> 
        public static byte[] StreamToBytes(Stream stream)
        {
            byte[] bytes = new byte[stream.Length];
            stream.Read(bytes, 0, bytes.Length);

            // 设置当前流的位置为流的开始 
            stream.Seek(0, SeekOrigin.Begin);
            return bytes;
        }

        /// <summary> 
        /// 通过 Stream 获取excel文件后缀，文件流使用后会关闭
        /// </summary> 
        public static (int, string) getStreamSuffix(Stream stream)
        {
            var filename = "";
            BinaryReader reader = new BinaryReader(stream);
            for (int i = 0; i < 2; i++)
            {
                filename += reader.ReadByte().ToString();
            }
            reader.Close();
            switch (filename)
            {
                case "208207":
                    return (200, ".xls");
                case "8075":
                    return (200, ".xlsx");
                case "189225":
                    return (200, ".csv");
                default:
                    return (400, "");
            }
        }

        /// <summary> 
        /// 将 byte[] 转成 Stream 
        /// </summary> 
        public static Stream BytesToStream(byte[] bytes)
        {
            Stream stream = new MemoryStream(bytes);
            return stream;
        }

        /// <summary> 
        /// 将 Stream 写入文件 
        /// </summary> 
        public static void StreamToFile(Stream stream, string fileName)
        {
            // 把 Stream 转换成 byte[] 
            byte[] bytes = new byte[stream.Length];
            stream.Read(bytes, 0, bytes.Length);
            // 设置当前流的位置为流的开始 
            stream.Seek(0, SeekOrigin.Begin);

            // 把 byte[] 写入文件 
            FileStream fs = new FileStream(fileName, FileMode.Create);
            BinaryWriter bw = new BinaryWriter(fs);
            bw.Write(bytes);
            bw.Close();
            fs.Close();
        }

        /// <summary> 
        /// 从文件读取 Stream 
        /// </summary> 
        public static Stream FileToStream(string fileName)
        {
            // 打开文件 
            FileStream fileStream = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.Read);
            // 读取文件的 byte[] 
            byte[] bytes = new byte[fileStream.Length];
            fileStream.Read(bytes, 0, bytes.Length);
            fileStream.Close();
            // 把 byte[] 转换成 Stream 
            Stream stream = new MemoryStream(bytes);
            return stream;
        }

        /// <summary>
        /// 删除文件
        /// </summary>
        /// <param name="path1"></param>
        /// <returns></returns>
        public static bool DeleteFile(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
                return true;
            }
            catch 
            {
                return false;
            }
        }

        /// <summary>
        /// 通过文件网络地址获取文件流
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public static Stream HttpDownloadFile(string url)
        {
            MemoryStream ms = new MemoryStream();
            try
            {
                var byts = new byte[0];
                HttpWebRequest httpWebRequest = (HttpWebRequest)HttpWebRequest.Create(url);
                httpWebRequest.Method = "GET";
                using (WebResponse response = httpWebRequest.GetResponse())
                {
                    Stream stream = response.GetResponseStream();
                    ms = new MemoryStream(stream.ToBytes());
                    stream.Close();
                }
            }
            catch { }
            return ms;
        }

        /// <summary>
        /// 保存文件
        /// </summary>
        /// <param name="stream"></param>
        /// <param name="path"></param>
        /// <returns></returns>
        public static ReResult SaveFile(Stream stream, List<string> path, string filename,string genpath, string user = "AUTO")
        {
            try
            {
                var rex = new Record();
                var time = DateTime.Now.ToString("yyyy-MM-dd");
                var filenames = filename.Split(".")?.ToList() ?? new List<string>();
                var filename1 = filenames[0] + DateTime.Now.ToString("yyyyMMddHmmss") + "." + filenames[1];
                var fielpath = genpath + $@"\upload\{string.Join(@"\", path)}\{time}\{filename1}";
                var type = Path.GetExtension(filename);
                var url = Configs.webpath + $"/upload/{string.Join("/", path)}/{time}/{filename1}";
                var getPath = Path.GetDirectoryName(fielpath);
                if (!Directory.Exists(getPath)) Directory.CreateDirectory(getPath);
                var arry = stream.ToBytes();
                var size = 0;
                using (FileStream fs = new FileStream(fielpath, FileMode.Create))
                {
                    fs.Write(arry, 0, arry.Length);
                    size = (int)Math.Ceiling(fs.Length / 1024.0);
                    fs.Close();
                    stream.Close();
                }
                rex.Put("filename", filename).Put("filepath", fielpath).Put("webfilepath", url).Put("filesize", size).Put("filetype", type)
                .Put("id", Guid.NewGuid().ToString().Replace("-", "")).Put("create_time", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")).Put("status", "0").Put("create_user", user);
                return new ReResult().setData(rex);
            }
            catch (IOException e)
            {
                return new ReResult(400, e.Message);
            }
        }

        /// <summary>  
        /// 计算文件大小函数(保留两位小数),Size为字节大小  
        /// </summary>  
        /// <param name="Size">初始文件大小</param>  
        /// <returns></returns>  
        public string CountSize(long Size)
        {
            string m_strSize = "";
            long FactSize = 0;
            FactSize = Size;
            if (FactSize < 1024.00)
                m_strSize = FactSize.ToString("F2") + " Byte";
            else if (FactSize >= 1024.00 && FactSize < 1048576)
                m_strSize = (FactSize / 1024.00).ToString("F2") + " K";
            else if (FactSize >= 1048576 && FactSize < 1073741824)
                m_strSize = (FactSize / 1024.00 / 1024.00).ToString("F2") + " M";
            else if (FactSize >= 1073741824)
                m_strSize = (FactSize / 1024.00 / 1024.00 / 1024.00).ToString("F2") + " G";
            return m_strSize;
        }

        #endregion
    }
}
