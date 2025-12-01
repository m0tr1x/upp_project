using TaskTracker.Models.Task;
using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITaskService
{
    Task<int> AddTask(Task task, CancellationToken token);

    Task<Task> GetTask(int taskId, CancellationToken token);

    Task<Task[]> GetTeammateTasks(CancellationToken token);

    Task<bool> UpdateTask(V1UpdateTaskRequest task, CancellationToken token);

    Task<bool> CloseTask(int taskId, CancellationToken token);

    Task<bool> AssignOnTeammate(int taskId, int userId, CancellationToken token);
}
