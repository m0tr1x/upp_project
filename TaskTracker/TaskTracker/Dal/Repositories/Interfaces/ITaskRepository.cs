using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITaskRepository
{
    Task<int> AddTaskAsync(DbTask task, CancellationToken token);

    Task<DbTask?> GetTaskAsync(int taskId, CancellationToken token);

    Task<IEnumerable<DbTask>> GetTeammateTasksAsync(int TeammateId, CancellationToken token);

    Task<int> UpdateTaskAsync(DbTask task, CancellationToken token);

    Task<bool> CloseTaskAsync(int taskId, CancellationToken token);

    Task<bool> AssignOnTeammateAsync(int taskId, int assigneeId, CancellationToken token);
}
