using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
using server.Services;

namespace server.Controller {
    [Route("api")]
    [ApiController]
    public class HealthCheckController : ControllerBase {
        private readonly SessionManager _sessionManager;

        public HealthCheckController(SessionManager sessionManager) {
            _sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
        }

        [Authorize]
        [HttpGet("Session/Update")]
        public async Task<IActionResult> StartHealthCheck() {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) {
                return Unauthorized("Invalid token.");
            }

            try {
                await _sessionManager.UpdateSession(email);
                return Ok("Health check passed");
            } catch (Exception ex) {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("Session/GetConnectedUsers")]
        public IActionResult Get() {
            var connectedUsers = _sessionManager.GetConnectedUsers();
            return Ok(connectedUsers);
        }
    }
}