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

    }
}