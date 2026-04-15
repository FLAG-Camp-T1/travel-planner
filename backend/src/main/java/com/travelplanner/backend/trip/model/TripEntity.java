package com.travelplanner.backend.trip.model;

import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("trip")
public class TripEntity {

    @Id
    @Column("id")
    private Long id;

    @Column("user_id")
    private UUID userId;

    @Column("title")
    private String title;

    @Column("duration")
    private Integer duration;

    @Column("start_date")
    private LocalDate startDate;
}
