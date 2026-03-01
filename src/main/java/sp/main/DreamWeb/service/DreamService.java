package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.model.Dream;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DreamService {

    private final DreamRepository repository;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }

    public DreamResponse saveDream(DreamRequest request) {
        User user = getCurrentUser();
        Dream dream = Dream.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .dueDate(request.getDueDate())
                .category(request.getCategory())
                .isAchieved(request.isAchieved())
                .user(user)
                .build();
        return mapToResponse(repository.save(dream));
    }

    public List<DreamResponse> getAllDreams() {
        User user = getCurrentUser();
        return repository.findAllByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DreamResponse updateDream(Long id, DreamRequest request) {
        User user = getCurrentUser();
        Dream dream = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        if (request.getName() != null)
            dream.setName(request.getName());
        if (request.getDescription() != null)
            dream.setDescription(request.getDescription());
        if (request.getImageUrl() != null)
            dream.setImageUrl(request.getImageUrl());
        if (request.getDueDate() != null)
            dream.setDueDate(request.getDueDate());
        if (request.getCategory() != null)
            dream.setCategory(request.getCategory());
        dream.setAchieved(request.isAchieved());

        return mapToResponse(repository.save(dream));
    }

    public void deleteDream(Long id) {
        User user = getCurrentUser();
        Dream dream = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        repository.delete(dream);
    }

    public DreamResponse getDailySelection() {
        User user = getCurrentUser();
        List<Dream> dreams = repository.findAllByUserId(user.getId());
        if (dreams.isEmpty())
            return null;

        Random random = new Random();
        Dream randomDream = dreams.get(random.nextInt(dreams.size()));
        return mapToResponse(randomDream);
    }

    public DreamResponse getDailyFocusDream() {
        User user = getCurrentUser();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        Optional<Dream> dreamOpt = repository.findDailyFocusDream(user.getId(), sevenDaysAgo);

        if (dreamOpt.isPresent()) {
            Dream dream = dreamOpt.get();
            dream.setLastFocusedAt(LocalDateTime.now());
            repository.save(dream);
            return mapToResponse(dream);
        }

        return null;
    }

    private DreamResponse mapToResponse(Dream dream) {
        int progress = 0;
        if (dream.getDueDate() != null && dream.getCreatedAt() != null) {
            long total = java.time.temporal.ChronoUnit.DAYS.between(
                    dream.getCreatedAt().toLocalDate(), dream.getDueDate());
            long passed = java.time.temporal.ChronoUnit.DAYS.between(
                    dream.getCreatedAt().toLocalDate(), java.time.LocalDate.now());
            if (total > 0) {
                progress = (int) Math.min(100, Math.max(0, (passed * 100) / total));
            }
        }
        return DreamResponse.builder()
                .id(dream.getId())
                .name(dream.getName())
                .description(dream.getDescription())
                .imageUrl(dream.getImageUrl())
                .dueDate(dream.getDueDate())
                .category(dream.getCategory())
                .isAchieved(dream.isAchieved())
                .progress(progress)
                .createdAt(dream.getCreatedAt())
                .lastFocusedAt(dream.getLastFocusedAt())
                .build();
    }
}
