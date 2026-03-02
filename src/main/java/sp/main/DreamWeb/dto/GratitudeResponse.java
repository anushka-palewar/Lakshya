package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GratitudeResponse {
    private Long id;
    private LocalDate entryDate;
    private String gratitude1;
    private String gratitude2;
    private String gratitude3;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
