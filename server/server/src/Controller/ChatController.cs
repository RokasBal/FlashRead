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
using server.Utility;


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
        public async Task<IActionResult> GetGlobalChats([FromQuery] int index) {
            int lastIndexInDb = await _context.GlobalChats.OrderByDescending(c => c.ChatIndex).Select(c => c.ChatIndex).FirstOrDefaultAsync();
            if (index >= lastIndexInDb && index != 0) {
                return NoContent();
            }
            byte[] defaultProfilePic = await Utility.Utility.getDefaultProfilePic();
            var chats = await (from chat in _context.GlobalChats
                               join user in _context.Users on chat.Author equals user.Email into userGroup
                               from user in userGroup.DefaultIfEmpty()
                               orderby chat.ChatIndex descending
                                               select new {
                                                    chat.ChatIndex,
                                                    chat.ChatText,
                                                    chat.Author,
                                                    chat.WrittenAt,
                                                    Usename = user != null ? user.Name : "Unknown",
                                                    ProfilePic = user != null ? user.ProfilePic : null
                                               }).Take(100).ToListAsync();
                
            var updatedChats = chats.Select(chat => new Chat(
                chat.ChatIndex, 
                chat.Usename, 
                chat.ChatText, 
                chat.Author, 
                chat.WrittenAt, 
                chat.ProfilePic ?? defaultProfilePic
            )).ToList();
            return Ok(new ChatList { Chats = updatedChats });
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
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            var username = user != null ? user.Name : "Unknown";

            var newChat = new DbGlobalChat {
                ChatIndex = newChatIndex,
                ChatText = chat.ChatText,
                Author = email,
                WrittenAt = DateTime.UtcNow,
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
        int ChatIndex,
        string Username,
        string ChatText,
        string Author,
        DateTime WrittenAt,
        byte[] ProfilePic
    );
    public record ChatList
    {
        public List<Chat> Chats { get; init; } = new List<Chat>();
    }
}