using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
using server.src.Task1;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;

namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class ChatController : ControllerBase {
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        public ChatController(FlashDbContext context, UserHandler userHandler) {
            _context = context;
            _userHandler = userHandler;
        }
        [HttpPost("GetGlobalChats")]
        public async Task<IActionResult> GetGlobalChats() {
            var chats = await _context.GlobalChats.ToListAsync();
            var last100Chats = chats.OrderByDescending(chat => chat.ChatIndex).Take(100)
                .Select(chat => new Chat(chat.ChatText, chat.Author, chat.WrittenAt, new byte[0])).ToList();

            var updatedChats = new List<Chat>();
            foreach (var chat in last100Chats)
            {
                var ProfilePic = await _userHandler.GetUserProfilePicByEmailAsync(chat.Author);
                if (ProfilePic == null) {
                    ProfilePic = new byte[0];
                }
                updatedChats.Add(new Chat(chat.ChatText, chat.Author, chat.WrittenAt, ProfilePic));
            }
            return Ok(updatedChats);
        }
        [Authorize]
        [HttpPost("SendGlobalChat")]
        public async Task<IActionResult> SendGlobalChat([FromBody] incomingChat chat) {
            string? email = null;
            try {
                email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email)) {
                    return Unauthorized("Invalid token.");
                }
            } catch (Exception ex) {
                System.Console.WriteLine(ex.Message);
                return Unauthorized("Invalid token.");
            }
            var lastChat = await _context.GlobalChats.OrderByDescending(c => c.ChatIndex).FirstOrDefaultAsync();
            var newChatIndex = lastChat != null ? lastChat.ChatIndex + 1 : 1;

            var newChat = new DbGlobalChat {
                ChatIndex = newChatIndex,
                ChatText = chat.ChatText,
                Author = email,
                WrittenAt = DateTime.UtcNow
            };
            await _context.GlobalChats.AddAsync(newChat);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
    public record incomingChat(
        string ChatText
    );
    public record Chat(
        string ChatText,
        string Author,
        DateTime WrittenAt,
        byte[] ProfilePic
    );
}