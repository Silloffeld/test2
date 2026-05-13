using Microsoft.EntityFrameworkCore;
using Route = backend.Models.Route;
using backend.Models;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Route>()
            .HasMany(r => r.Waypoints)
            .WithOne(w => w.Route)
            .HasForeignKey(w => w.RouteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
