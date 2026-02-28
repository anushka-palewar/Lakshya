package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sp.main.DreamWeb.dto.StreakResponse;
import sp.main.DreamWeb.model.User;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/streak")
    public ResponseEntity<StreakResponse> getStreak(@AuthenticationPrincipal User user) {
        boolean hasLoggedInToday = user.getLastLoginDate() != null &&
                user.getLastLoginDate().toLocalDate().equals(LocalDate.now());

        return ResponseEntity.ok(StreakResponse.builder()
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .hasLoggedInToday(hasLoggedInToday)
                .build());
    }
}
