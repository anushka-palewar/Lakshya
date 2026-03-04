package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sp.main.DreamWeb.model.DifficultyLevel;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneRequest {
    private String title;
    private String description;
    private boolean isCompleted;
    private LocalDate dueDate;
    private DifficultyLevel difficultyLevel;
}