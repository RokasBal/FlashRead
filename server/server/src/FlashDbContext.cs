using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using server.src.Task1;
using server.src.Task2;
using server.UserNamespace;
using server.src.Settings;
using server.Exceptions;
namespace server.src {
    public class FlashDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public DbSet<DbTask1Text> Task1Texts { get; set; }
        public DbSet<DbTask1Question> Task1Questions { get; set; }
        public DbSet<DbUser> Users { get; set; }
        public DbSet<DbTask2Text> Task2Texts { get; set; }
        public DbSet<DbTaskHistory> UserTaskHistories { get; set; }
        public DbSet<DbTask1Contribution> UserTask1Contributions { get; set; }
        public DbSet<DbUserSettings> UserSettings { get; set; } 
        public DbSet<DbSettingsTheme> SettingsThemes { get; set; }
        public DbSet<DbSettingsFont> SettingsFonts { get; set; }
        public DbSet<DbUserSessions> UserSessions { get; set; }
        public DbSet<DbUserSingleSession> UserSingleSessions { get; set; }
        public DbSet<DbLogs> Logs { get; set; }
        public DbSet<DbGlobalChat> GlobalChats { get; set; }
        public FlashDbContext(DbContextOptions<FlashDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.HasPostgresEnum<Task1.Task1.Theme>(schema: "task1", name: "theme");
            modelBuilder.Entity<DbTask1Text>(entity => {
                entity.ToTable("texts", "task1");
                entity.HasKey(e => e.Id).HasName("texts_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Theme).HasColumnName("theme");
                entity.Property(e => e.Text).HasColumnName("text");
            });
            modelBuilder.Entity<DbTask1Question>(entity => {
                entity.ToTable("questions", "task1");
                entity.HasKey(e => e.Id).HasName("questions_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TextId).HasColumnName("text_id");
                entity.Property(e => e.Question).HasColumnName("question");
                entity.Property(e => e.Variants).HasColumnName("variants");
                entity.Property(e => e.AnswerId).HasColumnName("answer_id");
            });
            modelBuilder.Entity<DbUser>(entity => {
                entity.ToTable("users", "users");
                entity.HasKey(e => e.Email).HasName("users_pkey");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.ProfilePic).HasColumnName("profile_pic");
                entity.Property(e => e.HistoryIds).HasColumnName("history_ids");
                entity.Property(e => e.ContributionsIds).HasColumnName("contributions_ids");
                entity.Property(e => e.SettingsId).HasColumnName("settings_id");
                entity.Property(e => e.JoinedAt).HasColumnName("joined_at");
                entity.Property(e => e.SessionsId).HasColumnName("sessions_id");
            });
            modelBuilder.Entity<DbUserSessions>(entity => {
                entity.ToTable("user_sessions", "users");
                entity.HasKey(e => e.Id).HasName("user_sessions_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.SessionIds).HasColumnName("session_ids");
            });
            modelBuilder.Entity<DbUserSingleSession>(entity => {
                entity.ToTable("single_session", "users");
                entity.HasKey(e => e.Id).HasName("single_session_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TimeStarted).HasColumnName("time_started");
                entity.Property(e => e.TimeEnded).HasColumnName("time_ended");
            });
            modelBuilder.Entity<DbTaskHistory>(entity => {
                entity.ToTable("user_history", "users");
                entity.HasKey(e => e.Id).HasName("history_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.SessionId).HasColumnName("session_id");
                entity.Property(e => e.TaskId).HasColumnName("task_id");
                entity.Property(e => e.Answers).HasColumnName("answers");
                entity.Property(e => e.Score).HasColumnName("score");
                entity.Property(e => e.TimePlayed).HasColumnName("time_played");
            });
            modelBuilder.Entity<DbTask1Contribution>(entity => {
                entity.ToTable("contributions", "users");
                entity.HasKey(e => e.Id).HasName("contributions_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.QuestionsId).HasColumnName("questions_id");
            });
            modelBuilder.HasPostgresEnum<Task2.Task2Data.Theme>(schema: "task2", name: "theme");
            modelBuilder.Entity<DbTask2Text>(entity => {
                entity.ToTable("texts", "task2");
                entity.HasKey(e => e.Id).HasName("texts_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Theme).HasColumnName("theme").HasColumnType("task2.theme");
                entity.Property(e => e.Text).HasColumnName("text");
            });
            modelBuilder.Entity<DbUserSettings>(entity => {
                entity.ToTable("settings", "users");
                entity.HasKey(e => e.Id).HasName("settings_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Theme).HasColumnName("theme");
                entity.Property(e => e.Font).HasColumnName("font");
            });
            modelBuilder.Entity<DbSettingsTheme>(entity => {
                entity.ToTable("theme", "settings");
                entity.HasKey(e => e.Theme).HasName("theme_pkey");
                entity.Property(e => e.Theme).HasColumnName("theme");
                entity.Property(e => e.MainBackground).HasColumnName("main_background");
                entity.Property(e => e.SecondaryBackground).HasColumnName("secondary_background");
                entity.Property(e => e.PrimaryColor).HasColumnName("primary_color");
                entity.Property(e => e.AccentColor).HasColumnName("accent_color");
                entity.Property(e => e.TextColor).HasColumnName("text_color");
                entity.Property(e => e.BorderColor).HasColumnName("border_color");
            });
            modelBuilder.Entity<DbSettingsFont>(entity => {
                entity.ToTable("font", "settings");
                entity.HasKey(e => e.Font).HasName("font_pkey");
                entity.Property(e => e.Font).HasColumnName("font");
                entity.Property(e => e.FontFamily).HasColumnName("font_family");
            });
            modelBuilder.Entity<DbLogs>(entity => {
                entity.ToTable("logs", "logs");
                entity.HasKey(e => e.Id).HasName("logs_pkey");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.LogMessage).HasColumnName("log_message");
                entity.Property(e => e.LogTime).HasColumnName("log_time");
            });
            modelBuilder.Entity<DbGlobalChat>(entity => {
                entity.ToTable("global_chat", "chats");
                entity.HasKey(e => e.ChatIndex).HasName("global_chat_pkey");
                entity.Property(e => e.ChatIndex).HasColumnName("chat_index");
                entity.Property(e => e.ChatText).HasColumnName("chat_text");
                entity.Property(e => e.Author).HasColumnName("author");
                entity.Property(e => e.WrittenAt).HasColumnName("written_at");
            });
        }
    }
}