package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserRepository userRepository;

    @Transactional
    public void updateStreak(User user) {
        LocalDateTime now = LocalDateTime.now();

        if (user.getLastLoginDate() == null) {
            user.setCurrentStreak(1);
            user.setLongestStreak(Math.max(user.getLongestStreak(), 1));
        } else {
            LocalDate lastLoginLocalDate = user.getLastLoginDate().toLocalDate();
            LocalDate today = now.toLocalDate();
            long daysBetween = ChronoUnit.DAYS.between(lastLoginLocalDate, today);

            if (daysBetween == 1) {
                // Consecutive day
                int newStreak = user.getCurrentStreak() + 1;
                user.setCurrentStreak(newStreak);
                user.setLongestStreak(Math.max(user.getLongestStreak(), newStreak));
            } else if (daysBetween > 1) {
                // Streak broken
                user.setCurrentStreak(1);
            }
            // If daysBetween == 0, already logged in today, do nothing to current/longest
            // streak
        }

        user.setLastLoginDate(now);
        userRepository.save(user);
    }
}
