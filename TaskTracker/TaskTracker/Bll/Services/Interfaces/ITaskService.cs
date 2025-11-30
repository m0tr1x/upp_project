using System.Threading;
using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITaskService
{
    Task<int> AddTask(Task task, CancellationToken token);

    Task<Task> GetTask(int taskId, CancellationToken token);

    Task<Task[]> GetTeammateTasks(int teammateId, CancellationToken token);

    Task<bool> UpdateTask(Task task, CancellationToken token);

    Task<bool> CloseTask(int taskId, CancellationToken token);

    Task<bool> AssignOnTeammate(int taskId, int userId, CancellationToken token);
}
