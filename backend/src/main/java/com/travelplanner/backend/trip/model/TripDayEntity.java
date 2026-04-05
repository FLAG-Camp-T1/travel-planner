package com.travelplanner.backend.trip.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("trip_day")
public class TripDayEntity {

    @Id private Long id;

    private Long tripId;
    private Integer dayNumber;
}
