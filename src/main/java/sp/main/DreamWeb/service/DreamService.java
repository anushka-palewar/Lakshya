package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.model.Dream;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DreamService {

    private final DreamRepository repository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public DreamResponse saveDream(DreamRequest request) {
        User user = getCurrentUser();
        Dream dream = Dream.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .dueDate(request.getDueDate())
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

    private DreamResponse mapToResponse(Dream dream) {
        return DreamResponse.builder()
                .id(dream.getId())
                .name(dream.getName())
                .description(dream.getDescription())
                .imageUrl(dream.getImageUrl())
                .dueDate(dream.getDueDate())
                .isAchieved(dream.isAchieved())
                .createdAt(dream.getCreatedAt())
                .build();
    }
}
