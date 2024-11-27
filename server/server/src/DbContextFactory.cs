using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using server.src;
namespace server.Services {
    public class DbContextFactory
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public DbContextFactory(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public FlashDbContext GetDbContext()
        {
            var scope = _scopeFactory.CreateScope();
            return scope.ServiceProvider.GetRequiredService<FlashDbContext>();
        }
    }
}