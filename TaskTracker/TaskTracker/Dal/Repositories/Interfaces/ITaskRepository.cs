using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITaskRepository
{
    Task<bool> AddTask(DbTask task, CancellationToken token);

    Task<DbTask> GetTask(int taskId, CancellationToken token);

    Task<DbTask[]> GetTeammateTasks(int TeammateId, CancellationToken token);

    Task<bool> UpdateTask(DbTask task, CancellationToken token);

    Task<bool> CloseTask(int taskId, CancellationToken token);

    Task<bool> AssingOnTeammate(int taskId, CancellationToken token);
}
