package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifeAnalyticsResponse {
    // Summary metrics
    private long totalDreams;
    private long completedDreams;
    private long totalMilestonesCompleted;
    private double averageCompletionDays;
    
    // Streak data
    private int currentStreak;
    private int longestStreak;
    
    // Progress
    private int completionPercentage;
    
    // Streak history (date, streak_count pairs)
    private List<StreakHistoryPoint> streakHistory;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreakHistoryPoint {
        private String date;
        private int streakValue;
    }
}
