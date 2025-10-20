using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TaskRepository : ITaskRepository
{
    public Task<bool> AddTask(DbTask task, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> AssingOnTeammate(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseTask(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<DbTask> GetTask(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<DbTask[]> GetTeammateTasks(int TeammateId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTask(DbTask task, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
