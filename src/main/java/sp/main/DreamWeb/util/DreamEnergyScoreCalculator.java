package sp.main.DreamWeb.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class DreamEnergyScoreCalculator {

    /**
     * Calculate Dream Energy Score (0-100) based on multiple factors.
     *
     * @param milestonesCompleted count of completed milestones
     * @param daysTracked number of days since dream creation
     * @param gratitudeCount user's total gratitude entries
     * @param visualizationSessions count of focus sessions on this dream
     * @return energy score 0-100
     */
    public static int calculateEnergyScore(
            int milestonesCompleted,
            long daysTracked,
            long gratitudeCount,
            long visualizationSessions) {

        // Max thresholds for normalization
        final int MAX_MILESTONES = 8;
        final int MAX_DAYS = 365;
        final int MAX_GRATITUDE = 100;
        final int MAX_SESSIONS = 30;

        // Each category contributes 25 points max (total 100)
        int milestonesScore = Math.min(25, (milestonesCompleted * 25) / MAX_MILESTONES);
        int daysScore = Math.min(25, (int)((daysTracked * 25) / MAX_DAYS));
        int gratitudeScore = Math.min(25, (int)((gratitudeCount * 25) / MAX_GRATITUDE));
        int visualizationScore = Math.min(25, (int)((visualizationSessions * 25) / MAX_SESSIONS));

        return milestonesScore + daysScore + gratitudeScore + visualizationScore;
    }

    /**
     * Calculate days since a date.
     */
    public static long daysSince(LocalDate startDate) {
        if (startDate == null) return 0;
        return ChronoUnit.DAYS.between(startDate, LocalDate.now());
    }
}
