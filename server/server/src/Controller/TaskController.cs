using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
using server.src.Task1;
namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class TaskController : ControllerBase {
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        public TaskController(FlashDbContext context, UserHandler userHandler) {
            _context = context;
            _userHandler = userHandler;
        }
        [HttpPost("GetTask")]
        public ITaskResponse PostGetTask(TaskRequest req) {
            ITask task = ITask.GetTaskFromTaskId(req.TaskId, _context);
            return task.GetResponse(req);
        }
        [HttpPost("GetTaskAnswer")]
        public async Task<ITaskAnswerResponse> PostGetTaskAnswer(TaskAnswerRequest req) {
            int taskId = ITask.GetTaskIdFromSession(req.Session);
            int score =  0;


            ITask task = ITask.GetTaskFromTaskId(taskId, _context);
            var checkAns = task.CheckAnswer(req);
            score = checkAns switch {
                Task1.TaskAnswerResponse task1 => task1.Statistics.Score,
                _ => throw new Exception("Task not found")
            };
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail) == false)
            {
                await _userHandler.SaveTaskResult(userEmail, req.Session, taskId, score, req.SelectedVariants);
            }
            return checkAns;
        }
    }
}