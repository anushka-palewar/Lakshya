package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GratitudeRequest {
    
    @NotBlank(message = "First gratitude entry is required")
    @Size(min = 3, message = "Gratitude entry must be at least 3 characters")
    private String gratitude1;
    
    @NotBlank(message = "Second gratitude entry is required")
    @Size(min = 3, message = "Gratitude entry must be at least 3 characters")
    private String gratitude2;
    
    @NotBlank(message = "Third gratitude entry is required")
    @Size(min = 3, message = "Gratitude entry must be at least 3 characters")
    private String gratitude3;
}
