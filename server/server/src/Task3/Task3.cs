namespace server.src.Task3 {
    public interface ITask3EndpointData {
        public object GetResponse(int taskVersion) {
            throw new NotImplementedException();
        }
    }

    public class Task3EndpointHandler<T> where T : ITask3EndpointData {
        public int TaskVersion { get; set; }
        public T? Data { get; set; }

        public Task3EndpointHandler<U> GetResponse<U>() where U : ITask3EndpointData {
            Task3EndpointHandler<U> resp = new Task3EndpointHandler<U>();
            resp.TaskVersion = TaskVersion;
            if (Data != null) {
                var newResp = Data.GetResponse(TaskVersion);
                if (newResp != null) {
                    resp.Data = (U)Data.GetResponse(TaskVersion);
                }
            }
            return resp;
        }
    }

    public class Task3DoorCodeRequest : ITask3EndpointData {
        public string Code { get; set; }

        public Task3DoorCodeRequest() {
            Code = "";
        }

        public object GetResponse(int taskVersion) {
            return new Task3DoorCodeResponse {
                IsCorrect = CheckCode(taskVersion)
            };
        }

        private bool CheckCode(int taskVersion) {
            Task3HintGenerator hintGenerator = new Task3HintGenerator();
            return Code == hintGenerator.GetDoorCode(taskVersion);
        }
    }
    public class Task3DoorCodeResponse : ITask3EndpointData {
        public bool IsCorrect { get; set; }
    }
    public class Task3BookHintRequest : ITask3EndpointData {
        public int Count { get; set; }

        public object GetResponse(int taskVersion) {
            return new Task3BookHintResponse {
                Hints = GetHints(taskVersion)
            };
        }

        private string[] GetHints(int taskVersion) {
            Task3HintGenerator hintGenerator = new Task3HintGenerator();
            return hintGenerator.GetHints(taskVersion, Count);
        }
    }
    public class Task3BookHintResponse : ITask3EndpointData {
        public string[] Hints { get; set; }

        public Task3BookHintResponse() {
            Hints = new string[0];
        }
    }
}