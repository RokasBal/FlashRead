using System.Threading.Tasks;
using BCrypt.Net;
using System.Text.Json;
using server.src;
using server.UserNamespace;
using Microsoft.EntityFrameworkCore;
using server.Services;
using server.Controller;

namespace server.UserNamespace {
    public class UserHandler
    {
        private readonly FlashDbContext _context;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly SessionManager _sessionManager;

        public UserHandler(FlashDbContext context, TokenProvider tokenProvider, HistoryManager historyManager, SessionManager sessionManager)
        {
            _context = context;
            _tokenProvider = tokenProvider;
            _historyManager = historyManager;
            _sessionManager = sessionManager;
        }

        public async Task<bool> RegisterUserAsync(User user)
        {
            // Check if user already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
            {
                throw new UserAlreadyExistsException("A user with this email already exists.");
            }

            var existingUsername = await _context.Users.FirstOrDefaultAsync(u => u.Name == user.Name);
            if (existingUsername != null) {
                throw new UserAlreadyExistsException("A user with this username already exists.");
            }

            var dbUser = convertUserToDbUser(user);
            dbUser.Password = HashPassword(dbUser.Password);
            dbUser.ProfilePic = null;
            await createSettingsId(dbUser);
            await createSessionsId(dbUser);
            try
            {
                _context.Users.Add(dbUser);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return true;
        }

        public async Task<string> LoginUserAsync(User user)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (dbUser == null)
            {
                throw new Exception("User not found");
            }
            
            if (!VerifyPassword(user.Password, dbUser.Password))
            {
                throw new Exception("Invalid password");
            }

            string token = _tokenProvider.Create(user);
            await _sessionManager.AddSessionToDictionary(user.Email);
            return token;
        }

        public async Task<bool> DeleteUserAsync(User user)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (dbUser == null)
            {
                return false;
            }
            try
            {
                _context.Users.Remove(dbUser);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return true;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            UserCollection users = new UserCollection();
            var userList = await _context.Users.ToListAsync();
            foreach (var dbUser in userList)
            {
                users.Add((User)dbUser);
            }
            return users;
        }

        public async Task<User?> GetUserAsync(User user)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (dbUser == null)
            {
                return null;
            }
            return (User)dbUser;
        }

        public async Task<DbUser?> UpdateProfilePictureAsync(string email, byte[] profilePic)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                return null;
            }
            dbUser.ProfilePic = profilePic;
            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
            return dbUser;
        }

        public async Task<DbUser?> GetUserByEmailAsync(string email)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                return null;
            }
            return dbUser;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash) ? true : false;
        }

        private DbUser convertUserToDbUser(User user)
        {
            return (DbUser)user;
        }

        public async Task<string?> GetSettingsIdByEmailAsync(string email) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                return null;
            }
            return dbUser.SettingsId;
        }

        private async Task createSettingsId(DbUser dbUser)
        {
            DbUserSettings userSettings = new DbUserSettings();
            userSettings.Id = Guid.NewGuid().ToString();
            _context.UserSettings.Add(userSettings);
            var firstTheme = await _context.SettingsThemes.FirstOrDefaultAsync();
            var firstFont = await _context.SettingsFonts.FirstOrDefaultAsync();
            userSettings.Theme = firstTheme?.Theme ?? "default_theme";
            userSettings.Font = firstFont?.Font ?? "default_font";
            dbUser.SettingsId = userSettings.Id;
            await _context.SaveChangesAsync();
        }

        private async Task createSessionsId(DbUser dbUser)
        {
            DbUserSessions userSessions = new DbUserSessions();
            userSessions.Id = Guid.NewGuid().ToString();
            _context.UserSessions.Add(userSessions);
            dbUser.SessionsId = userSessions.Id;
            await _context.SaveChangesAsync();
        }

        public async Task<string?> GetSettingsThemeById(string id)
        {
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.Id == id);
            if (userSettings == null)
            {
                return null;
            }
            return userSettings.Theme;
        }

        public async Task SaveTaskResult(string email, uint sessionId, int taskId, int score, int[]? selectedVariants = null) {
            await _historyManager.SaveTaskResult(email, sessionId, taskId, score, selectedVariants);
        }

        public async Task<string?> GetEmailByNameAsync(string name) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Name == name);
            return dbUser?.Email;
        }

        public async Task<IEnumerable<DbTaskHistory>> GetTaskHistoryByEmail(string email)
        {
           var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (dbUser == null)
            {
                return new List<DbTaskHistory>();
            }

            var taskHistories = await _context.UserTaskHistories
                .Where(h => dbUser.HistoryIds.Contains(h.Id))
                .ToListAsync();

            return taskHistories;
        }

        public async Task<string?> GetSettingsFontById(string id)
        {
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.Id == id);
            if (userSettings == null)
            {
                return null;
            }
            return userSettings.Font;
        }

        public async Task ChangeUserPasswordAsync(string email, string newPassword) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                throw new Exception("User not found");
            }
            dbUser.Password = HashPassword(newPassword);
            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
        }

        public async Task ChangeUserNameAsync(string email, string newUsername) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                throw new Exception("User not found");
            }
            dbUser.Name = newUsername;
            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
        } 

        public async Task DeleteUserByEmailAsync(string email) {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                throw new Exception("User not found");
            }
            var userSessions = await _context.UserSessions.FirstOrDefaultAsync(s => s.Id == dbUser.SessionsId);
            if (userSessions != null)
            {
                foreach (var sessionId in userSessions.SessionIds)
                {
                    var singleSession = await _context.UserSingleSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
                    if (singleSession != null)
                    {
                        _context.UserSingleSessions.Remove(singleSession);
                    }
                }
                _context.UserSessions.Remove(userSessions);
            }
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.Id == dbUser.SettingsId);
            if (userSettings != null)
            {
                _context.UserSettings.Remove(userSettings);
            }
            foreach (var historyId in dbUser.HistoryIds)
            {
                var taskHistory = await _context.UserTaskHistories.FirstOrDefaultAsync(h => h.Id == historyId);
                if (taskHistory != null)
                {
                    _context.UserTaskHistories.Remove(taskHistory);
                }
            }
            _context.Users.Remove(dbUser);
            await _context.SaveChangesAsync();
        }

        public async Task<Byte[]?> GetUserProfilePicByEmailAsync(string email)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (dbUser == null)
            {
                return null;
            }
            return dbUser.ProfilePic ?? Array.Empty<byte>();
        }

        public async Task<IEnumerable<UserScore>> GetTotalScoresAsync(int skip, int take) {
           var usersWithHistories = await _context.Users
                .ToListAsync();

            var userHistories = usersWithHistories
                .SelectMany(user => user.HistoryIds.Select(historyId => new { user.Name, historyId }))
                .Join(_context.UserTaskHistories,
                    userHistory => userHistory.historyId,
                    history => history.Id,
                    (userHistory, history) => new { userHistory.Name, history.Score })
                .ToList();

            var groupedHistories = userHistories
                .GroupBy(uh => uh.Name)
                .Select(g => new {
                    g.Key,
                    Score = g.Sum(h => h.Score)
                })
                .OrderByDescending(g => g.Score)
                .Skip(skip)
                .Take(take)
                .ToList();

            return groupedHistories.Select(g => new UserScore {
                Name = g.Key,
                Score = g.Score
            });
        }

        public async Task<IEnumerable<UserScore>> GetHighScoresAsync(int skip, int take) {
            var usersWithHistories = await _context.Users
                .ToListAsync();

            var userHistories = usersWithHistories
                .SelectMany(user => user.HistoryIds.Select(historyId => new { user.Name, historyId }))
                .Join(_context.UserTaskHistories,
                    userHistory => userHistory.historyId,
                    history => history.Id,
                    (userHistory, history) => new { userHistory.Name, history.TaskId, history.Score })
                .ToList();

            var groupedHistories = userHistories
                .GroupBy(uh => new { uh.Name, uh.TaskId })
                .Select(g => new {
                    g.Key.Name,
                    g.Key.TaskId,
                    Score = g.Max(h => h.Score)
                })
                .OrderByDescending(g => g.Score)
                .Skip(skip)
                .Take(take)
                .ToList();

            return groupedHistories.Select(g => new UserScore {
                Name = g.Name,
                Score = g.Score,   
                Gamemode = g.TaskId
            });
        }
    }
}