using server.src;
using server.UserNamespace;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Threading.Tasks;
namespace server.Services {
    public class SessionManager
    {
        private readonly ConcurrentDictionary<string, UserSession> _sessions = new ConcurrentDictionary<string, UserSession>();
        private readonly DbContextFactory _dbContextFactory;
        public SessionManager(DbContextFactory dbContextFactory) {
            _dbContextFactory = dbContextFactory;
        }
        public virtual async Task CreateSessionsTable(string email) {
            using (var _context = _dbContextFactory.GetDbContext()) {
                var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (dbUser == null)
                {
                    return;
                }
                var sessionContainer = new DbUserSessions
                {
                    Id = Guid.NewGuid().ToString(),
                    SessionIds = new string[0]
                };
                _context.UserSessions.Add(sessionContainer);
                await _context.SaveChangesAsync(); // Save the session container first to generate the ID
                dbUser.SessionsId = sessionContainer.Id;
                _context.Users.Update(dbUser);
                await _context.SaveChangesAsync();
            }
        }
        public virtual async Task SaveUserSession(string email, UserSession session) {
            using (var _context = _dbContextFactory.GetDbContext()) {
                var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (dbUser == null)
                {
                    return;
                }
                var sessionContainer = await _context.UserSessions.FirstOrDefaultAsync(s => s.Id == dbUser.SessionsId);
                if (sessionContainer == null)
                {
                    return;
                }
                var dbUserSingleSession = new DbUserSingleSession
                {
                    Id = Guid.NewGuid().ToString(),
                    TimeStarted = session.SessionStart,
                    TimeEnded = session.LatestTimeAlive
                };
                _context.UserSingleSessions.Add(dbUserSingleSession);
                sessionContainer.SessionIds = sessionContainer.SessionIds.Append(dbUserSingleSession.Id).ToArray();
                _context.UserSessions.Update(sessionContainer);
                await _context.SaveChangesAsync();
            }
        }
        public virtual async Task AddSessionToDictionary(string email) {
            using (var _context = _dbContextFactory.GetDbContext()) {
                var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (dbUser == null)
                {
                    return;
                }
                var session = new UserSession
                {
                    SessionStart = DateTime.UtcNow,
                    LatestTimeAlive = DateTime.UtcNow
                };
                _sessions.TryAdd(email, session);
            }
        }
        public virtual async Task HealthCheck() {
            foreach (var session in _sessions)
            {
                if (DateTime.UtcNow - session.Value.LatestTimeAlive > TimeSpan.FromMinutes(2))
                {
                    await SaveUserSession(session.Key, session.Value);
                    _sessions.TryRemove(session.Key, out _);
                }
            }
        }
        public virtual async Task UpdateSession(string email) {
            if (_sessions.TryGetValue(email, out var session))
            {
                session.LatestTimeAlive = DateTime.UtcNow;
                _sessions[email] = session;
            }
            else
            {
                await AddSessionToDictionary(email);
            }
        }
        public virtual List<string> GetConnectedUsers() {
            var connectedUsers = new List<string>();
            foreach (var session in _sessions)
            {
                connectedUsers.Add(session.Key);
            }
            return connectedUsers;
        }

        public virtual async Task<List<string>> GetConnectedUsernames() {
            var connectedUsernames = new List<string>();
            using (var _context = _dbContextFactory.GetDbContext()) {
                foreach (var session in _sessions) {
                    var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == session.Key);
                    if (dbUser != null) {
                        connectedUsernames.Add(dbUser.Name);
                    }
                }
            }
            return connectedUsernames;
        }
        public class UserSession {
            public DateTime SessionStart { get; set; }
            public DateTime LatestTimeAlive { get; set; }
        }
    }
}