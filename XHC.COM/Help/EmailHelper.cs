using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;

namespace XHC.COM.Help
{
    public class EmailHelper
    {
        #region 发送邮件 

        /// <summary>
        /// 发送邮件  
        /// </summary>
        /// <param name="email_from">发件人邮箱</param>
        /// <param name="email_to">收件人邮箱</param>
        /// <param name="email_cc">电子邮件地址  可以有多个,用;分割,可为空</param>
        /// <param name="password">smtp授权码</param>
        /// <param name="subject">标题</param>
        /// <param name="strbody">内容</param>
        /// <param name="type">邮箱类型</param>
        /// <param name="filePath">文件路径  发送附件时用到</param>
        /// <param name="ms">文件流  发送附件时用到</param>
        public Tuple<int, string> SendEmailText(string email_from, string email_to, string email_cc, string password, string subject, string strbody, string type, List<string> filePath = null, List<Stream> ms = null)
        {
            try
            {
                // 建立一个邮件实体  
                MailAddress from = new MailAddress(email_from);

                MailAddress to = new MailAddress(email_to);
                MailMessage message = new MailMessage(from, to);

                if (!string.IsNullOrEmpty(email_cc))
                {
                    foreach (string ccs in email_cc.Split(';'))
                    {
                        MailAddress cc = new MailAddress(ccs);
                        message.CC.Add(cc);
                    }
                }
                message.IsBodyHtml = true;//是否是HTML邮件 
                message.BodyEncoding = System.Text.Encoding.UTF8;//邮件内容格式
                message.Priority = MailPriority.High;//邮件优先级
                message.Subject = subject;
                message.Body = strbody; //邮件BODY内容 
                if (filePath != null && filePath.Count > 0)
                {
                    filePath.ForEach(x =>
                    {
                        Attachment data = new Attachment(x, MediaTypeNames.Application.Octet);
                        // Add time stamp information for the file.
                        ContentDisposition disposition = data.ContentDisposition;
                        disposition.CreationDate = System.IO.File.GetCreationTime(x);//文件创建时间
                        disposition.ModificationDate = System.IO.File.GetLastWriteTime(x);//文件最后读取时间
                        disposition.ReadDate = System.IO.File.GetLastAccessTime(x);//文件最后使用时间
                        message.Attachments.Add(data);
                    });
                }
                if (ms != null && ms.Count > 0)
                {
                    ms.ForEach(x =>
                    {
                        Attachment data = new Attachment(x, MediaTypeNames.Application.Octet);
                        message.Attachments.Add(data);
                    });
                }
                System.Net.Mime.ContentType ctype = new System.Net.Mime.ContentType();
                SmtpClient client = new SmtpClient();
                //在这里我使用的是qq邮箱，所以是smtp.qq.com，如果你使用的是126邮箱，那么就是smtp.126.com。
                type = type?.ToLower();
                switch (type)
                {
                    case "qq":
                        client.Host = "smtp.qq.com";
                        break;
                    case "126":
                        client.Host = "smtp.126.com";
                        break;
                    case "qiye.163":
                        client.Host = "smtp.qiye.163.com";
                        break;
                    case "163":
                        client.Host = "smtp.163.com";
                        break;
                }
                //设置邮箱端口，pop3端口:110, smtp端口是:25
                client.Port = 25;
                //设置超时时间
                client.Timeout = 9999;
                //使用安全加密连接。
                client.EnableSsl = true;
                //不和请求一块发送。
                client.UseDefaultCredentials = false;
                //验证发件人身份(发件人的邮箱，邮箱里的生成授权码);
                client.Credentials = new NetworkCredential(email_from, password);
                //网上发送
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                //发送
                client.Send(message);
                return new Tuple<int, string>(200, "");
            }
            catch (Exception ex)
            {
                return new Tuple<int, string>(400, ex.Message);
            }
        }

        #endregion
    }
}
