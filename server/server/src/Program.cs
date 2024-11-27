using server.src;
using Microsoft.EntityFrameworkCore;
using server.src.Task1;
using server.src.Task2;
using Npgsql;
using server.UserNamespace;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net.NetworkInformation;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.src.Settings;
using server.Services;
using server.Exceptions;

namespace server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
            builder.Services.AddCors(options => {
                options.AddPolicy(
                    name: MyAllowSpecificOrigins, 
                    policy  => {
                        policy.WithOrigins("http://157.245.20.69")
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials();
                    }
                    );
                }
            );

            try 
            {
                Console.WriteLine("Attempting database connection...");
                Console.WriteLine("EEEEE...");
                var connectionString = ConnectionStringBuilder.BuildConnectionString();
                Console.WriteLine($"Connection String: {connectionString}");

                builder.Services.AddDbContextFactory<FlashDbContext>(options =>
                    options.UseNpgsql(connectionString));

                // Register DbContext factory
                builder.Services.AddDbContext<FlashDbContext>(options =>
                    options.UseNpgsql(connectionString));

                Console.WriteLine("Database connection successful!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL: Database Connection Failed");
                Console.WriteLine($"Error Details: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }

            // Authentication & Authorization
            builder.Services.AddAuthorization();
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET") 
                            ?? throw new InvalidOperationException("JWT_SECRET environment variable is not set!"))),
                        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                        ValidAudience = builder.Configuration["JwtSettings:Audience"],
                        ClockSkew = TimeSpan.Zero
                    };
                });

            // Singleton Services
            builder.Services.AddSingleton<TokenProvider>();
            builder.Services.AddSingleton<SessionManager>();
            builder.Services.AddHostedService<SessionBackgroundService>();

            // Scoped Services
            builder.Services.AddScoped<DbContextFactory>();
            builder.Services.AddScoped<HistoryManager>();
            builder.Services.AddScoped<UserHandler>();
            builder.Services.AddScoped<Settings>();

            // Framework Services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGenWithAuth();

            // Logging
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            var app = builder.Build();

            // Middleware Pipeline
            // app.UseStaticFiles();
            app.UseSwagger();
            app.UseSwaggerUI();
            // app.UseHsts();
            app.UseMiddleware<ExceptionMiddleware>();

            // app.UseHttpsRedirection();
            app.UseCors(MyAllowSpecificOrigins);
            
            // Authentication & Authorization Middleware
            app.UseAuthentication();
            app.UseAuthorization();
            
            app.MapControllers();

            try 
            {
                Console.WriteLine("Starting application...");
                app.Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Application startup failed: {ex}");
                throw;
            }
        }
    }
}