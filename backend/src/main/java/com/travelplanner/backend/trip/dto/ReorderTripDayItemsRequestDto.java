package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
@Schema(
        name = "ReorderTripDayItemsRequest",
        description = "Request payload used to replace the stop order for one trip day")
public class ReorderTripDayItemsRequestDto {

    @NotEmpty
    @ArraySchema(
            schema =
                    @Schema(
                            description =
                                    "Ordered itinerary item identifiers for the selected trip day",
                            example = "5001",
                            requiredMode = RequiredMode.REQUIRED))
    private List<@NotNull Long> itemIds;
}
