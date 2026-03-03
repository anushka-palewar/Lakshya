package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.FutureLetterRequest;
import sp.main.DreamWeb.dto.FutureLetterResponse;
import sp.main.DreamWeb.model.FutureLetter;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.FutureLetterRepository;

import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class FutureLetterService {

    private final FutureLetterRepository repository;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }

    public FutureLetterResponse getLetterForUser() {
        User user = getCurrentUser();
        return repository.findByUserId(user.getId())
                .map(this::mapToResponse)
                .orElse(null);
    }

    public FutureLetterResponse saveOrUpdate(FutureLetterRequest request) {
        User user = getCurrentUser();
        FutureLetter letter = repository.findByUserId(user.getId())
                .orElse(FutureLetter.builder().user(user).build());
        letter.setContent(request.getContent());
        letter = repository.save(letter);
        return mapToResponse(letter);
    }

    private FutureLetterResponse mapToResponse(FutureLetter l) {
        return FutureLetterResponse.builder()
                .id(l.getId())
                .content(l.getContent())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .build();
    }
}
