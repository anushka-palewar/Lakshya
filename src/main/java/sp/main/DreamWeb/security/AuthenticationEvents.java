package sp.main.DreamWeb.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.service.StreakService;

@Component
@RequiredArgsConstructor
public class AuthenticationEvents {

    private final StreakService streakService;

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            streakService.updateStreak(user);
        }
    }
}
