using Microsoft.EntityFrameworkCore;
using UniFind.API.Models.Entities;

namespace UniFind.API.Data
{
    public class UniFindDbContext : DbContext
    {
        public UniFindDbContext(DbContextOptions<UniFindDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Item> Items => Set<Item>();
        public DbSet<ItemImage> ItemImages => Set<ItemImage>();
        public DbSet<Claim> Claims => Set<Claim>();
        public DbSet<HandoverRecord> HandoverRecords => Set<HandoverRecord>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<Report> Reports => Set<Report>();
        public DbSet<ItemStatusHistory> ItemStatusHistories => Set<ItemStatusHistory>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Email Unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Item relationships
            modelBuilder.Entity<Item>()
                .HasOne(i => i.User)
                .WithMany(u => u.Items)
                .HasForeignKey(i => i.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Item>()
                .HasOne(i => i.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(i => i.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Item>()
                .HasOne(i => i.Location)
                .WithMany(l => l.Items)
                .HasForeignKey(i => i.LocationID)
                .OnDelete(DeleteBehavior.Restrict);

            // Claim relationships
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Item)
                .WithMany(i => i.Claims)
                .HasForeignKey(c => c.ItemID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Claim>()
                .HasOne(c => c.User)
                .WithMany(u => u.Claims)
                .HasForeignKey(c => c.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Reviewer)
                .WithMany()
                .HasForeignKey(c => c.ReviewedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // HandoverRecord relationship
            modelBuilder.Entity<HandoverRecord>()
                .HasOne(h => h.Claim)
                .WithOne(c => c.HandoverRecord)
                .HasForeignKey<HandoverRecord>(h => h.ClaimID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HandoverRecord>()
                .HasOne(h => h.Staff)
                .WithMany()
                .HasForeignKey(h => h.StaffID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HandoverRecord>()
                .HasOne(h => h.Receiver)
                .WithMany()
                .HasForeignKey(h => h.ReceiverID)
                .OnDelete(DeleteBehavior.Restrict);

            // Reports relationships
            modelBuilder.Entity<Report>()
                .HasOne(r => r.Reporter)
                .WithMany()
                .HasForeignKey(r => r.ReporterID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Report>()
                .HasOne(r => r.Handler)
                .WithMany()
                .HasForeignKey(r => r.HandledBy)
                .OnDelete(DeleteBehavior.Restrict);

            // ItemStatusHistory relationships
            modelBuilder.Entity<ItemStatusHistory>()
                .HasOne(s => s.Item)
                .WithMany(i => i.StatusHistories)
                .HasForeignKey(s => s.ItemID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ItemStatusHistory>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.ChangedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

