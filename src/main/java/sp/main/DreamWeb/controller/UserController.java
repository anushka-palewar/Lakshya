package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sp.main.DreamWeb.dto.StreakResponse;
import sp.main.DreamWeb.model.User;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final sp.main.DreamWeb.service.StreakService streakService;
    private final sp.main.DreamWeb.repository.UserRepository userRepository;

    @GetMapping("/streak")
    public ResponseEntity<StreakResponse> getStreak(@AuthenticationPrincipal User user) {
        // Fetch fresh user to avoid stale data
        User freshUser = userRepository.findByUsername(user.getUsername()).orElse(user);
        streakService.updateStreak(freshUser);

        boolean hasLoggedInToday = freshUser.getLastLoginDate() != null &&
                freshUser.getLastLoginDate().toLocalDate().equals(LocalDate.now());

        return ResponseEntity.ok(StreakResponse.builder()
                .currentStreak(freshUser.getCurrentStreak())
                .longestStreak(freshUser.getLongestStreak())
                .hasLoggedInToday(hasLoggedInToday)
                .build());
    }

    @PostMapping("/streak/update")
    public ResponseEntity<StreakResponse> updateStreak(@AuthenticationPrincipal User user) {
        User freshUser = userRepository.findByUsername(user.getUsername()).orElse(user);
        streakService.updateStreak(freshUser);
        boolean hasLoggedInToday = freshUser.getLastLoginDate() != null &&
                freshUser.getLastLoginDate().toLocalDate().equals(LocalDate.now());
        return ResponseEntity.ok(StreakResponse.builder()
                .currentStreak(freshUser.getCurrentStreak())
                .longestStreak(freshUser.getLongestStreak())
                .hasLoggedInToday(hasLoggedInToday)
                .build());
    }

        @GetMapping("/me")
        public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
                if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
                return ResponseEntity.ok(Map.of("username", user.getUsername(), "email", user.getEmail()));
        }
}
