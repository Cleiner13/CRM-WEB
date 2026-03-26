using System;

namespace CRM.Application.Common.Models
{
    public class AppException : Exception
    {
        public int StatusCode { get; }
        public object? Details { get; }

        public AppException(int statusCode, string message)
            : base(message)
        {
            StatusCode = statusCode;
        }

        public AppException(int statusCode, string message, object? details)
            : base(message)
        {
            StatusCode = statusCode;
            Details = details;
        }
    }
}
