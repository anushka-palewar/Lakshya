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
public class MilestoneResponse {
    private Long id;
    private String title;
    private String description;
    private boolean isCompleted;
    private LocalDate dueDate;
    private DifficultyLevel difficultyLevel;
    
    // computed fields
    private String riskStatus;           // On Track / At Risk / Overdue / Stalled
    private int urgencyScore;            // 0-100
    private double completionVelocity;   // days per milestone or similar
    private LocalDate predictedCompletionDate;
    private boolean stalled;
    
    // optional ordering recommendation score
    private int recommendedOrder;
}