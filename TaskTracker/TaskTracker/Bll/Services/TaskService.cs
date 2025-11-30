using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Repositories.Interfaces;
using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services;

public class TaskService(ITaskRepository taskRepository) : ITaskService
{
    public Task<int> AddTask(Task task, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> AssignOnTeammate(int taskId, int userId, CancellationToken token)
    {
        return await taskRepository.AssignOnTeammateAsync(taskId, userId, token);
    }

    public async Task<bool> CloseTask(int taskId, CancellationToken token)
    {
        return await taskRepository.CloseTaskAsync(taskId, token);
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
