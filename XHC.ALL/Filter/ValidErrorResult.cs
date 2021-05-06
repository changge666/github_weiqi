using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace XHC.ALL.Filter
{
    public class ValidErrorResult : ObjectResult
    {
        public ValidErrorResult(object value) : base(value)
        {
            StatusCode = (int)HttpStatusCode.OK;
        }
    }
}
