using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/routes/{routeId:int}/waypoints")]
public class WaypointsController(AppDbContext db) : ControllerBase
{
    // GET api/routes/{routeId}/waypoints
    [HttpGet]
    public async Task<IActionResult> GetAll(int routeId)
    {
        var exists = await db.Routes.AnyAsync(r => r.Id == routeId);
        if (!exists) return NotFound();

        var waypoints = await db.Waypoints
            .Where(w => w.RouteId == routeId)
            .OrderBy(w => w.Order)
            .ToListAsync();
        return Ok(waypoints);
    }

    // POST api/routes/{routeId}/waypoints
    [HttpPost]
    public async Task<IActionResult> Create(int routeId, [FromBody] WaypointDto dto)
    {
        var exists = await db.Routes.AnyAsync(r => r.Id == routeId);
        if (!exists) return NotFound();

        var maxOrder = await db.Waypoints
            .Where(w => w.RouteId == routeId)
            .Select(w => (int?)w.Order)
            .MaxAsync() ?? -1;

        var waypoint = new Waypoint
        {
            RouteId = routeId,
            Label = dto.Label,
            Description = dto.Description,
            X = dto.X,
            Y = dto.Y,
            Order = dto.Order ?? (maxOrder + 1)
        };
        db.Waypoints.Add(waypoint);
        await db.SaveChangesAsync();
        return Ok(waypoint);
    }

    // PUT api/routes/{routeId}/waypoints/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int routeId, int id, [FromBody] WaypointDto dto)
    {
        var waypoint = await db.Waypoints.FirstOrDefaultAsync(w => w.Id == id && w.RouteId == routeId);
        if (waypoint is null) return NotFound();

        waypoint.Label = dto.Label;
        waypoint.Description = dto.Description;
        waypoint.X = dto.X;
        waypoint.Y = dto.Y;
        if (dto.Order.HasValue) waypoint.Order = dto.Order.Value;
        await db.SaveChangesAsync();
        return Ok(waypoint);
    }

    // DELETE api/routes/{routeId}/waypoints/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int routeId, int id)
    {
        var waypoint = await db.Waypoints.FirstOrDefaultAsync(w => w.Id == id && w.RouteId == routeId);
        if (waypoint is null) return NotFound();
        db.Waypoints.Remove(waypoint);
        await db.SaveChangesAsync();

        // Re-number remaining waypoints
        var remaining = await db.Waypoints
            .Where(w => w.RouteId == routeId)
            .OrderBy(w => w.Order)
            .ToListAsync();
        for (int i = 0; i < remaining.Count; i++) remaining[i].Order = i;
        await db.SaveChangesAsync();

        return NoContent();
    }

    // PUT api/routes/{routeId}/waypoints/reorder  – accepts ordered list of ids
    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder(int routeId, [FromBody] List<int> orderedIds)
    {
        var waypoints = await db.Waypoints
            .Where(w => w.RouteId == routeId)
            .ToListAsync();

        for (int i = 0; i < orderedIds.Count; i++)
        {
            var wp = waypoints.FirstOrDefault(w => w.Id == orderedIds[i]);
            if (wp is not null) wp.Order = i;
        }
        await db.SaveChangesAsync();
        return Ok(waypoints.OrderBy(w => w.Order));
    }
}

public record WaypointDto(string Label, string? Description, double X, double Y, int? Order);
