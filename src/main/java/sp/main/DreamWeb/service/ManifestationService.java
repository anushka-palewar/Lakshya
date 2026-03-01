package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.ManifestationRequest;
import sp.main.DreamWeb.dto.ManifestationResponse;
import sp.main.DreamWeb.model.Dream;
import sp.main.DreamWeb.model.Manifestation;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;
import sp.main.DreamWeb.repository.ManifestationRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManifestationService {

    private final ManifestationRepository repository;
    private final DreamRepository dreamRepository;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }

    public ManifestationResponse saveManifestation(ManifestationRequest request) {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now();

        Optional<Manifestation> existing = repository.findByUserIdAndDate(user.getId(), today);
        Manifestation manifestation = existing.orElse(Manifestation.builder().user(user).date(today).build());

        manifestation.setGratitudes(request.getGratitudes());
        manifestation.setAffirmations(request.getAffirmations());
        manifestation.setIntention(request.getIntention());

        if (request.getFocusedDreamId() != null) {
            Dream dream = dreamRepository.findById(request.getFocusedDreamId())
                    .orElseThrow(() -> new RuntimeException("Dream not found"));
            manifestation.setFocusedDream(dream);
        }

        return mapToResponse(repository.save(manifestation));
    }

    public ManifestationResponse getTodayManifestation() {
        User user = getCurrentUser();
        return repository.findByUserIdAndDate(user.getId(), LocalDate.now())
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<ManifestationResponse> getAllManifestations() {
        User user = getCurrentUser();
        return repository.findAllByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ManifestationResponse mapToResponse(Manifestation manifestation) {
        return ManifestationResponse.builder()
                .id(manifestation.getId())
                .date(manifestation.getDate())
                .gratitudes(manifestation.getGratitudes())
                .affirmations(manifestation.getAffirmations())
                .intention(manifestation.getIntention())
                .focusedDreamId(
                        manifestation.getFocusedDream() != null ? manifestation.getFocusedDream().getId() : null)
                .focusedDreamName(
                        manifestation.getFocusedDream() != null ? manifestation.getFocusedDream().getName() : null)
                .build();
    }
}
