using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
using server.src.Task3;

namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class Task3Controller : ControllerBase {
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        public Task3Controller(FlashDbContext context, UserHandler userHandler) {
            _context = context;
            _userHandler = userHandler;
        }
        [HttpPost("CheckSecretDoorCode")]
        public Task3EndpointHandler<Task3DoorCodeResponse> PostGetTask(Task3EndpointHandler<Task3DoorCodeRequest> req) {
            return req.GetResponse<Task3DoorCodeResponse>();
        }
        [HttpPost("GetBookHints")]
        public Task3EndpointHandler<Task3BookHintResponse> PostGetTask(Task3EndpointHandler<Task3BookHintRequest> req) {
            req.TaskVersion = new Task3HintGenerator().GenerateTaskVersion();
            return req.GetResponse<Task3BookHintResponse>();
        }
        [HttpPost("SaveTask3TimeTaken")]
        public async Task<IActionResult> PostSaveTask3TimeTaken(int seconds) {
            // calculate score based on time taken
            int max = 2000;
            int min = 100;
            int score = -seconds * 3 + max;
            score = Math.Max(min, score);
            score = Math.Min(max, score);
            score /= 10; // [100, 2000] -> [10, 200]

            // save score
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail) == false) {
                System.Console.WriteLine("Saving task result");
                await _userHandler.SaveTaskResult(userEmail, 0, 3, score, null);
            }
            else {
                return NotFound("failure");
            }
            return Ok("success");
        }
    }
}