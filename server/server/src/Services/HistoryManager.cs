using server.src;
using server.UserNamespace;
using Microsoft.EntityFrameworkCore;
namespace server.Services {
    public class HistoryManager(FlashDbContext _context)
    {
        public async Task SaveTaskResult(string email, uint sessionId, int taskId, int score, int[]? selectedVariants = null) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                return;
            }
            DbTaskHistory userTaskHistory = new DbTaskHistory
            {
                Id = Guid.NewGuid().ToString(),
                SessionId = sessionId,
                TaskId = taskId,
                Answers = selectedVariants ?? Array.Empty<int>(),
                Score = score,
                TimePlayed = DateTime.UtcNow
            };
            _context.UserTaskHistories.Add(userTaskHistory);
            dbUser.HistoryIds = dbUser.HistoryIds.Append(userTaskHistory.Id).ToArray();
            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
        }
    }
}