using Supabase;
using TaskTracker.Bll.Enum;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TaskRepository(Client client) : ITaskRepository
{
    private readonly Client _client = client;

    public async Task<int> AddTaskAsync(DbTask task, CancellationToken token)
    {
        var response = await _client
            .From<DbTask>()
            .Insert(task, cancellationToken: token);

        return response.Models.First().Id;
    }

    public async Task<bool> AssignOnTeammateAsync(int taskId, int assigneeId, CancellationToken token)
    {
        var updatePayload = new DbTask
        {
            Id = taskId,
            AssigneeId = assigneeId,
            UpdatedAt = DateTime.UtcNow
        };

        var response = await _client
            .From<DbTask>()
            .Where(t => t.Id == taskId)
            .Update(updatePayload, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<bool> CloseTaskAsync(int taskId, CancellationToken token)
    {
        var closePayload = new DbTask
        {
            Id = taskId,
            Status = (int)CommonStatus.Done,
            UpdatedAt = DateTime.UtcNow
        };

        var response = await _client
            .From<DbTask>()
            .Where(t => t.Id == taskId)
            .Update(closePayload, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<DbTask?> GetTaskAsync(int taskId, CancellationToken token)
    {
        var response = await _client
            .From<DbTask>()
            .Where(t => t.Id == taskId)
            .Single(cancellationToken: token);

        return response ?? null;
    }

    public async Task<IEnumerable<DbTask>> GetTeammateTasksAsync(int teammateId, CancellationToken token)
    {
        var response = await _client
            .From<DbTask>()
            .Where(t => t.AssigneeId == teammateId)
            .Get(cancellationToken: token);

        return response.Models;
    }

    public async Task<int> UpdateTaskAsync(DbTask task, CancellationToken token)
    {
        var response = await _client
            .From<DbTask>()
            .Where(t => t.Id == task.Id)
            .Update(task, cancellationToken: token);

        return response.Models.First().Id;
    }
}
