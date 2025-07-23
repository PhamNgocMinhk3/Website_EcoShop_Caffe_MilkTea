using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/")]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHelloWorld()
    {
        return Ok(new { message = "Hello World from .NET API!" });
    }
}