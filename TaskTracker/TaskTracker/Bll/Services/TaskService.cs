using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Bll.Services;

public class TaskService : ITaskService
{
    public Task<bool> AddTask(Models.Task task, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> AssingOnTeamMember(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseTask(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<Models.Task> GetTask(int taskId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<Models.Task[]> GetTeamMemberTasks(int teamMemberId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTask(Models.Task task, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
