package com.travelplanner.backend.trip.model;

import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("trip")
public class TripEntity {

    @Id private Long id;

    private UUID userId;
    private String title;
    private Integer duration;
    private LocalDate startDate;
}
