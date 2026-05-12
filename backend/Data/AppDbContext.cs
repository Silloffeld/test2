using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<backend.Models.Route> Routes => Set<backend.Models.Route>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<backend.Models.Route>()
            .HasMany(r => r.Waypoints)
            .WithOne(w => w.Route)
            .HasForeignKey(w => w.RouteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
