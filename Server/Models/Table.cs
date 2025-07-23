namespace Server.Models
{
    // Enum để code dễ đọc hơn thay vì dùng số 0, 1, 2
    public enum TableStatus
    {
        Available = 0,    
        Occupied = 1, 
        Maintenance = 2    
    }

    public class Table
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TableStatus Status { get; set; }
    }
}