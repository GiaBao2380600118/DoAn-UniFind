using UniFind.API.DTOs.Items;
using UniFind.API.Models.Entities;

namespace UniFind.API.Services.Interfaces
{
    public interface IItemService
    {
        Task<PagedResult<ItemDto>> GetItemsAsync(ItemFilterDto filter);
        Task<ItemDetailDto?> GetItemByIdAsync(int id, int? currentUserId, string? currentUserRole);
        Task<ItemDto> CreateItemAsync(CreateItemDto dto, int userId);
        Task<bool> UpdateItemStatusAsync(int itemId, string newStatus, int changedByUserId, string? reason);
        Task<List<ItemDto>> GetMyItemsAsync(int userId);
        Task<List<Category>> GetCategoriesAsync();
        Task<List<Location>> GetLocationsAsync();
    }
}

