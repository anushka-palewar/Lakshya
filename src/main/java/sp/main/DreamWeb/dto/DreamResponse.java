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
public class DreamResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private LocalDate dueDate;
    private String category;
    private boolean isAchieved;
    private int progress; // computed percentage
    private LocalDateTime createdAt;
    private LocalDateTime lastFocusedAt;
}
