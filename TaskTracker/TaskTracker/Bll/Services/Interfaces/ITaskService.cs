using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITaskService
{
    Task<bool> AddTask(Task task, CancellationToken token);

    Task<Task> GetTask(int taskId, CancellationToken token);

    Task<Task[]> GetTeammateTasks(int TeammateId, CancellationToken token);

    Task<bool> UpdateTask(Task task, CancellationToken token);

    Task<bool> CloseTask(int taskId, CancellationToken token);

    Task<bool> AssingOnTeammate(int taskId, CancellationToken token);
}
