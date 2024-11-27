using System;
using System.IO;
using Newtonsoft.Json.Linq;

namespace server
{
    public static class ConnectionStringBuilder
    {
        public static string BuildConnectionString()
        {
            Console.WriteLine("Validating Connection Parameters:");
            var host = Environment.GetEnvironmentVariable("DB_HOST");
            var port = Environment.GetEnvironmentVariable("DB_PORT");
            var database = Environment.GetEnvironmentVariable("DB_NAME");
            var username = Environment.GetEnvironmentVariable("DB_USER");
            var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

            Console.WriteLine($"DB_HOST: {host ?? "NOT SET"}");
            Console.WriteLine($"DB_PORT: {port ?? "NOT SET"}");
            Console.WriteLine($"DB_NAME: {database ?? "NOT SET"}");
            Console.WriteLine($"DB_USER: {username ?? "NOT SET"}");
            Console.WriteLine($"DB_PASSWORD: {(password != null ? "SET" : "NOT SET")}");

            if (string.IsNullOrEmpty(host) || 
                string.IsNullOrEmpty(port) || 
                string.IsNullOrEmpty(database) || 
                string.IsNullOrEmpty(username) || 
                string.IsNullOrEmpty(password))
            {
                throw new InvalidOperationException("One or more database connection parameters are missing!");
            }

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }
    }
}