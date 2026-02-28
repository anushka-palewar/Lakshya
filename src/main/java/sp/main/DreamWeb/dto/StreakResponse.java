package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreakResponse {
    private int currentStreak;
    private int longestStreak;
    private boolean hasLoggedInToday;
}
