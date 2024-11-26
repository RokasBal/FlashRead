using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using server.src.Task2;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "users");

            migrationBuilder.EnsureSchema(
                name: "settings");

            migrationBuilder.EnsureSchema(
                name: "logs");

            migrationBuilder.EnsureSchema(
                name: "task1");

            migrationBuilder.EnsureSchema(
                name: "task2");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:task1.theme", "any,history,technology,anime,politics")
                .Annotation("Npgsql:Enum:task2.theme", "any,history,technology,anime,fillers");

            migrationBuilder.CreateTable(
                name: "contributions",
                schema: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    questions_id = table.Column<int>(type: "integer", nullable: false),
                    TimeContributed = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("contributions_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "font",
                schema: "settings",
                columns: table => new
                {
                    font = table.Column<string>(type: "text", nullable: false),
                    font_family = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("font_pkey", x => x.font);
                });

            migrationBuilder.CreateTable(
                name: "logs",
                schema: "logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    log_message = table.Column<string>(type: "text", nullable: false),
                    log_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("logs_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                schema: "task1",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    text_id = table.Column<int>(type: "integer", nullable: false),
                    question = table.Column<string>(type: "text", nullable: false),
                    variants = table.Column<string[]>(type: "text[]", nullable: false),
                    answer_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("questions_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    theme = table.Column<string>(type: "text", nullable: false),
                    font = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("settings_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "single_session",
                schema: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    time_started = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    time_ended = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("single_session_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "texts",
                schema: "task1",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    theme = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("texts_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "texts",
                schema: "task2",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    theme = table.Column<Task2Data.Theme>(type: "task2.theme", nullable: false),
                    text = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("texts_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "theme",
                schema: "settings",
                columns: table => new
                {
                    theme = table.Column<string>(type: "text", nullable: false),
                    main_background = table.Column<string>(type: "text", nullable: false),
                    secondary_background = table.Column<string>(type: "text", nullable: false),
                    primary_color = table.Column<string>(type: "text", nullable: false),
                    accent_color = table.Column<string>(type: "text", nullable: false),
                    text_color = table.Column<string>(type: "text", nullable: false),
                    border_color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("theme_pkey", x => x.theme);
                });

            migrationBuilder.CreateTable(
                name: "user_history",
                schema: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    session_id = table.Column<long>(type: "bigint", nullable: false),
                    task_id = table.Column<int>(type: "integer", nullable: false),
                    answers = table.Column<int[]>(type: "integer[]", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    time_played = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("history_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_sessions",
                schema: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    session_ids = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_sessions_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "users",
                columns: table => new
                {
                    email = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    profile_pic = table.Column<byte[]>(type: "bytea", nullable: true),
                    history_ids = table.Column<string[]>(type: "text[]", nullable: false),
                    contributions_ids = table.Column<string[]>(type: "text[]", nullable: false),
                    settings_id = table.Column<string>(type: "text", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sessions_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.email);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "contributions",
                schema: "users");

            migrationBuilder.DropTable(
                name: "font",
                schema: "settings");

            migrationBuilder.DropTable(
                name: "logs",
                schema: "logs");

            migrationBuilder.DropTable(
                name: "questions",
                schema: "task1");

            migrationBuilder.DropTable(
                name: "settings",
                schema: "users");

            migrationBuilder.DropTable(
                name: "single_session",
                schema: "users");

            migrationBuilder.DropTable(
                name: "texts",
                schema: "task1");

            migrationBuilder.DropTable(
                name: "texts",
                schema: "task2");

            migrationBuilder.DropTable(
                name: "theme",
                schema: "settings");

            migrationBuilder.DropTable(
                name: "user_history",
                schema: "users");

            migrationBuilder.DropTable(
                name: "user_sessions",
                schema: "users");

            migrationBuilder.DropTable(
                name: "users",
                schema: "users");
        }
    }
}
