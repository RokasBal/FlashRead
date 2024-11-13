using System;
using Xunit;
using server.UserNamespace;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
namespace server.Tests {
    public class TokenProviderTests {
        public TokenProviderTests() {
        }
        [Fact]
        public void CreateToken_ShouldReturnValidToken() {
            Environment.SetEnvironmentVariable("JWT_SECRET", "your_secret_key_your_secret_key_your_secret_key");
            
            // Arrange
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "JwtSettings:ExpirationHours", "1" },
                    { "JwtSettings:Issuer", "testIssuer" },
                    { "JwtSettings:Audience", "testAudience" }
                })
                .Build();

            var tokenProvider = new TokenProvider(configuration);
            var user = new User { Email = "test@example.com" };

            // Act
            var token = tokenProvider.Create(user);

            // Assert
            Assert.NotNull(token);
            var handler = new JsonWebTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = "testIssuer",
                ValidAudience = "testAudience",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")!))
            };

            var result = handler.ValidateToken(token, validationParameters);
            Assert.True(result.IsValid);
        }
    }
}