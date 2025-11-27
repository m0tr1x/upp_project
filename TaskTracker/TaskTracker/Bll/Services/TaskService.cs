using TaskTracker.Bll.Services.Interfaces;
using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services;

public class TaskService : ITaskService
{
    public Task<int> AddTask(Task task, CancellationToken token)
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

    public Task<Task> GetTask(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<Task[]> GetTeammateTasks(int teammateId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTask(Task task, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
