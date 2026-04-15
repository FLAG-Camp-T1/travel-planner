package com.travelplanner.backend.trip.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("poi")
public class PoiEntity {

    @Id
    @Column("id")
    private Long id;

    @Column("places_id")
    private String placesId;
}
