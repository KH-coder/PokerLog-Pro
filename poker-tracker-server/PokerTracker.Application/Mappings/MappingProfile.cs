using AutoMapper;
using PokerTracker.Application.DTOs;
using PokerTracker.Domain.Entities;

namespace PokerTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Entity 到 DTO
        CreateMap<HandRecord, HandRecordDto>();
        CreateMap<ActionRecord, ActionRecordDto>();
        
        // DTO 到 Entity
        CreateMap<CreateHandRecordDto, HandRecord>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.IsSyncedToNotion, opt => opt.MapFrom(_ => false))
            .ForMember(dest => dest.SyncStatus, opt => opt.MapFrom(_ => "Pending"));
            
        CreateMap<CreateActionRecordDto, ActionRecord>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid()));
            
        CreateMap<HandRecordDto, HandRecord>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore());
            
        CreateMap<ActionRecordDto, ActionRecord>();
    }
}