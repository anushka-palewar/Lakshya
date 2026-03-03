package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.LifeAnalyticsResponse;
import sp.main.DreamWeb.model.Dream;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;
import sp.main.DreamWeb.repository.MilestoneRepository;
import sp.main.DreamWeb.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LifeAnalyticsService {
    
    private final DreamRepository dreamRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    
    public LifeAnalyticsResponse getAnalytics(User user) {
        Long userId = user.getId();
        
        // Get counts
        long totalDreams = dreamRepository.countByUserId(userId);
        long completedDreams = dreamRepository.countCompletedByUserId(userId);
        long completedMilestones = milestoneRepository.countCompletedByUserId(userId);
        
        // Calculate completion percentage
        int completionPercentage = totalDreams > 0 
            ? (int) ((completedDreams * 100) / totalDreams) 
            : 0;
        
        // Calculate average completion time in days
        double averageCompletionDays = calculateAverageCompletionTime(userId);
        
        // Get streak data from current user
        User freshUser = userRepository.findById(userId).orElse(user);
        int currentStreak = freshUser.getCurrentStreak();
        int longestStreak = freshUser.getLongestStreak();
        
        // Generate streak history (simplified: show last 7 days of current streak progression)
        List<LifeAnalyticsResponse.StreakHistoryPoint> streakHistory = generateStreakHistory(currentStreak);
        
        return LifeAnalyticsResponse.builder()
                .totalDreams(totalDreams)
                .completedDreams(completedDreams)
                .totalMilestonesCompleted(completedMilestones)
                .averageCompletionDays(averageCompletionDays)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .completionPercentage(completionPercentage)
                .streakHistory(streakHistory)
                .build();
    }
    
    /**
     * Calculate average time between dream creation and completion
     */
    private double calculateAverageCompletionTime(Long userId) {
        List<Dream> completedDreams = dreamRepository.findAllByUserId(userId)
                .stream()
                .filter(Dream::isAchieved)
                .toList();
        
        if (completedDreams.isEmpty()) {
            return 0.0;
        }
        
        double totalDays = completedDreams.stream()
                .mapToLong(dream -> {
                    LocalDateTime createdAt = dream.getCreatedAt();
                    LocalDateTime completedAt = dream.getLastFocusedAt() != null 
                        ? dream.getLastFocusedAt() 
                        : LocalDateTime.now();
                    return ChronoUnit.DAYS.between(createdAt, completedAt);
                })
                .sum();
        
        return totalDays / completedDreams.size();
    }
    
    /**
     * Generate simplified streak history for last 7 days
     * Shows progression of current streak
     */
    private List<LifeAnalyticsResponse.StreakHistoryPoint> generateStreakHistory(int currentStreak) {
        List<LifeAnalyticsResponse.StreakHistoryPoint> history = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        // Generate backwards from current day
        for (int i = Math.min(6, currentStreak - 1); i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int streakValue = currentStreak - (Math.min(6, currentStreak - 1) - i);
            
            history.add(LifeAnalyticsResponse.StreakHistoryPoint.builder()
                    .date(date.toString())
                    .streakValue(streakValue)
                    .build());
        }
        
        return history;
    }
}
