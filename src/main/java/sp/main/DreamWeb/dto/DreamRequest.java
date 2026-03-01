package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DreamRequest {
    private String name;
    private String description;
    private String imageUrl;
    private LocalDate dueDate;
    private String category;
    private String priority;
    private String visionKeywords;
    private boolean isAchieved;
}
