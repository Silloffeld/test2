namespace backend.Models;

public class Waypoint
{
    public int Id { get; set; }
    public int RouteId { get; set; }
    public Route? Route { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
    /// <summary>X position as a percentage (0–100) of the map image width.</summary>
    public double X { get; set; }
    /// <summary>Y position as a percentage (0–100) of the map image height.</summary>
    public double Y { get; set; }
    public int Order { get; set; }
}
