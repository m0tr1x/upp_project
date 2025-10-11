using Microsoft.AspNetCore.Mvc;
using TaskTracker.DTOs;
using TaskTracker.Services;

namespace TaskTracker.Controllers
{
    [ApiController]
    [Route("TaskTracker/[controller]/[action]")]
    public class TaskController : ControllerBase
    {
        private readonly TestService _testService;
        public TaskController(TestService testService) 
        {
            _testService = testService;
        }
        [HttpPost]
        public async Task<IActionResult> UserAsync([FromBody] CreateUserDTO userDto)
        {
            var result = await _testService.CreateUserAsync(userDto);

            return Ok(result); 
        }
    }
}
