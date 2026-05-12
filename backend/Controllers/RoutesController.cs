using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/routes")]
public class RoutesController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    // GET api/routes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var routes = await db.Routes
            .Include(r => r.Waypoints.OrderBy(w => w.Order))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return Ok(routes);
    }

    // GET api/routes/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var route = await db.Routes
            .Include(r => r.Waypoints.OrderBy(w => w.Order))
            .FirstOrDefaultAsync(r => r.Id == id);
        if (route is null) return NotFound();
        return Ok(route);
    }

    // POST api/routes
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RouteCreateDto dto)
    {
        var route = new Models.Route { Name = dto.Name, Description = dto.Description };
        db.Routes.Add(route);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = route.Id }, route);
    }

    // PUT api/routes/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RouteCreateDto dto)
    {
        var route = await db.Routes.FindAsync(id);
        if (route is null) return NotFound();
        route.Name = dto.Name;
        route.Description = dto.Description;
        await db.SaveChangesAsync();
        return Ok(route);
    }

    // DELETE api/routes/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var route = await db.Routes.FindAsync(id);
        if (route is null) return NotFound();
        db.Routes.Remove(route);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST api/routes/{id}/map
    [HttpPost("{id:int}/map")]
    public async Task<IActionResult> UploadMap(int id, IFormFile file)
    {
        var route = await db.Routes.FindAsync(id);
        if (route is null) return NotFound();

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
        if (!allowed.Contains(ext))
            return BadRequest("Unsupported file type.");

        // Delete old map if present
        if (!string.IsNullOrEmpty(route.MapImagePath))
        {
            var old = Path.Combine(env.WebRootPath, "maps", route.MapImagePath);
            if (System.IO.File.Exists(old)) System.IO.File.Delete(old);
        }

        var fileName = $"route_{id}_{Guid.NewGuid():N}{ext}";
        var savePath = Path.Combine(env.WebRootPath, "maps", fileName);
        await using var stream = System.IO.File.Create(savePath);
        await file.CopyToAsync(stream);

        route.MapImagePath = fileName;
        await db.SaveChangesAsync();
        return Ok(new { mapImagePath = fileName });
    }
}

public record RouteCreateDto(string Name, string? Description);
