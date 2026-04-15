package com.travelplanner.backend.trip.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("trip_day")
public class TripDayEntity {

    @Id
    @Column("id")
    private Long id;

    @Column("trip_id")
    private Long tripId;

    @Column("day_number")
    private Integer dayNumber;
}
