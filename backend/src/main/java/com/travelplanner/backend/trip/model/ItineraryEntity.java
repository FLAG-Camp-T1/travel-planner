package com.travelplanner.backend.trip.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("itinerary")
public class ItineraryEntity {

    @Id private Long id;

    @Column("trip_day_id")
    private Long tripDayId;

    @Column("poi_id")
    private Long poiId;

    @Column("visit_order")
    private Integer visitOrder;

    @Column("travel_method")
    private String travelMethod;
}
