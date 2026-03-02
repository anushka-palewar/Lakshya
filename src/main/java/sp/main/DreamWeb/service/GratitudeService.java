package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.GratitudeRequest;
import sp.main.DreamWeb.dto.GratitudeResponse;
import sp.main.DreamWeb.dto.GratitudeStatusResponse;
import sp.main.DreamWeb.model.DailyGratitude;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.GratitudeRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GratitudeService {

    private final GratitudeRepository repository;

    /**
     * Get currently authenticated user
     */
    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }

    /**
     * Get today's gratitude status and data
     */
    public GratitudeStatusResponse getTodayGratitude() {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now();
        
        var gratitude = repository.findByUserIdAndEntryDate(user.getId(), today);
        
        return GratitudeStatusResponse.builder()
                .completed(gratitude.isPresent())
                .data(gratitude.map(this::mapToResponse).orElse(null))
                .build();
    }

    /**
     * Submit today's gratitude entries
     * Validates that all 3 entries are provided and prevents duplicates
     */
    public GratitudeResponse submitGratitude(GratitudeRequest request) {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now();
        
        // Check for existing submission
        var existingGratitude = repository.findByUserIdAndEntryDate(user.getId(), today);
        if (existingGratitude.isPresent()) {
            throw new RuntimeException("Gratitude already submitted for today. You can submit again tomorrow.");
        }
        
        // Create and save new gratitude entry
        DailyGratitude gratitude = DailyGratitude.builder()
                .user(user)
                .entryDate(today)
                .gratitude1(request.getGratitude1().trim())
                .gratitude2(request.getGratitude2().trim())
                .gratitude3(request.getGratitude3().trim())
                .build();
        
        return mapToResponse(repository.save(gratitude));
    }

    /**
     * Get gratitude history for the user
     */
    public List<GratitudeResponse> getHistory() {
        User user = getCurrentUser();
        return repository.findByUserIdOrderByEntryDateDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Check if user completed gratitude today
     */
    public boolean hasCompletedToday() {
        User user = getCurrentUser();
        return repository.existsByUserIdAndToday(user.getId());
    }

    /**
     * Map entity to response DTO
     */
    private GratitudeResponse mapToResponse(DailyGratitude gratitude) {
        return GratitudeResponse.builder()
                .id(gratitude.getId())
                .entryDate(gratitude.getEntryDate())
                .gratitude1(gratitude.getGratitude1())
                .gratitude2(gratitude.getGratitude2())
                .gratitude3(gratitude.getGratitude3())
                .createdAt(gratitude.getCreatedAt())
                .updatedAt(gratitude.getUpdatedAt())
                .build();
    }
}
