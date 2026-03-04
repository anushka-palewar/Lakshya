package sp.main.DreamWeb.service;

import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.MilestoneResponse;
import sp.main.DreamWeb.model.Milestone;
import sp.main.DreamWeb.model.DifficultyLevel;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RuleBasedMilestoneIntelligenceService implements MilestoneIntelligenceService {

    private static final int STALLED_THRESHOLD_DAYS = 14;

    @Override
    public MilestoneResponse enrich(Milestone m) {
        // compute urgency (closer due date -> higher urgency)
        int urgency = 0;
        if (m.getDueDate() != null && !m.isCompleted()) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), m.getDueDate());
            if (days <= 0) urgency = 100;
            else urgency = (int) Math.max(0, Math.min(100, 100 - (days * 10)));
        }

        // risk status
        String risk;
        if (m.isCompleted()) {
            risk = "On Track";
        } else if (m.getDueDate() == null) {
            risk = "On Track";
        } else {
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), m.getDueDate());
            if (daysLeft < 0) risk = "Overdue";
            else if (daysLeft <= 3) risk = "At Risk";
            else risk = "On Track";
        }

        // completion velocity: simple days since creation when completed, otherwise estimate
        double velocity;
        if (m.isCompleted() && m.getCreatedAt() != null && m.getUpdatedAt() != null) {
            long d = ChronoUnit.DAYS.between(m.getCreatedAt().toLocalDate(), m.getUpdatedAt().toLocalDate());
            velocity = d > 0 ? d : 0.0;
        } else {
            velocity = estimateCompletionDays(m);
        }

        // predicted completion date using rule-based days estimate
        int estimateDays = estimateCompletionDays(m);
        LocalDate predictedDate;
        if (m.isCompleted()) {
            predictedDate = m.getUpdatedAt() != null ? m.getUpdatedAt().toLocalDate() : LocalDate.now();
        } else {
            LocalDate start = m.getCreatedAt() != null ? m.getCreatedAt().toLocalDate() : LocalDate.now();
            predictedDate = start.plusDays(estimateDays);
        }

        // stalled detection
        boolean stalled = isStalled(m);

        return MilestoneResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .isCompleted(m.isCompleted())
                .dueDate(m.getDueDate())
                .difficultyLevel(m.getDifficultyLevel())
                .urgencyScore(urgency)
                .riskStatus(risk)
                .completionVelocity(velocity)
                .predictedCompletionDate(predictedDate)
                .stalled(stalled)
                .build();
    }

    @Override
    public List<MilestoneResponse> suggestOrder(List<Milestone> milestones) {
        // simple rule: earliest due date first, then higher urgency, then difficulty hard->easy
        return milestones.stream()
                .sorted(Comparator.comparing((Milestone m) -> m.getDueDate(), Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(m -> -enrich(m).getUrgencyScore())
                        .thenComparing(m -> m.getDifficultyLevel() == null ? 0 : m.getDifficultyLevel().ordinal())
                )
                .map(m -> enrich(m))
                .collect(Collectors.toList());
    }

    @Override
    public int estimateCompletionDays(Milestone m) {
        DifficultyLevel lvl = m.getDifficultyLevel();
        if (lvl == null) return 7;
        switch (lvl) {
            case EASY:
                return 3;
            case MEDIUM:
                return 7;
            case HARD:
                return 14;
            default:
                return 7;
        }
    }

    @Override
    public boolean isStalled(Milestone m) {
        if (m.isCompleted()) return false;
        if (m.getUpdatedAt() == null) return false;
        long days = ChronoUnit.DAYS.between(m.getUpdatedAt().toLocalDate(), LocalDate.now());
        return days >= STALLED_THRESHOLD_DAYS;
    }
}
