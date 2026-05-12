namespace backend.Models;

public class Route
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? MapImagePath { get; set; }
    public List<Waypoint> Waypoints { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
