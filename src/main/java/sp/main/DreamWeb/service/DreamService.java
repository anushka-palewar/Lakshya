package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.model.Dream;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.model.Milestone;
import sp.main.DreamWeb.repository.DreamRepository;
import sp.main.DreamWeb.repository.MilestoneRepository;
import sp.main.DreamWeb.repository.ManifestationRepository;
import sp.main.DreamWeb.repository.GratitudeRepository;
import sp.main.DreamWeb.util.DreamEnergyScoreCalculator;
import sp.main.DreamWeb.dto.MilestoneResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DreamService {

    private final DreamRepository repository;
    private final MilestoneRepository milestoneRepository;
    private final ManifestationRepository manifestationRepository;
    private final GratitudeRepository gratitudeRepository;
    private final MilestoneIntelligenceService intelligenceService;

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

    public DreamResponse getDreamById(Long id) {
        User user = getCurrentUser();
        Dream dream = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        return mapToResponse(dream);
    }

    public void deleteDream(Long id) {
        User user = getCurrentUser();
        Dream dream = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        // delete all milestones for this dream
        milestoneRepository.deleteAll(milestoneRepository.findAllByDreamIdOrderByCreatedAtAsc(id));
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
        // if dream has any milestones, compute based on them (with difficulty weight), else fallback to due-date progress
        List<Milestone> allMilestones = milestoneRepository.findAllByDreamIdOrderByCreatedAtAsc(dream.getId());
        if (!allMilestones.isEmpty()) {
            double totalWeight = 0;
            double completedWeight = 0;
            for (Milestone m : allMilestones) {
                double w = 1.0;
                if (m.getDifficultyLevel() != null) {
                    switch (m.getDifficultyLevel()) {
                        case EASY: w = 1.0; break;
                        case MEDIUM: w = 1.5; break;
                        case HARD: w = 2.0; break;
                    }
                }
                totalWeight += w;
                if (m.isCompleted()) completedWeight += w;
            }
            if (totalWeight > 0) {
                progress = (int) Math.round((completedWeight / totalWeight) * 100);
            }
        } else if (dream.getDueDate() != null && dream.getCreatedAt() != null) {
            long total = java.time.temporal.ChronoUnit.DAYS.between(
                    dream.getCreatedAt().toLocalDate(), dream.getDueDate());
            long passed = java.time.temporal.ChronoUnit.DAYS.between(
                    dream.getCreatedAt().toLocalDate(), java.time.LocalDate.now());
            if (total > 0) {
                progress = (int) Math.min(100, Math.max(0, (passed * 100) / total));
            }
        }

        // Calculate Dream Energy Score dynamically
        int milestonesCompleted = (int) milestoneRepository.findAllByDreamIdOrderByCreatedAtAsc(dream.getId())
                .stream()
                .filter(m -> m.isCompleted())
                .count();
        long daysTracked = DreamEnergyScoreCalculator.daysSince(dream.getCreatedAt().toLocalDate());
        long gratitudeCount = gratitudeRepository.countByUserId(dream.getUser().getId());
        long visualizationSessions = manifestationRepository.countByFocusedDreamId(dream.getId());

        int energyScore = DreamEnergyScoreCalculator.calculateEnergyScore(
                milestonesCompleted,
                daysTracked,
                gratitudeCount,
                visualizationSessions
        );

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
                .milestones(
                    milestoneRepository.findAllByDreamIdOrderByCreatedAtAsc(dream.getId())
                        .stream()
                        .map(m -> intelligenceService.enrich(m))
                        .toList()
                )
                .energyScore(energyScore)
                .build();
    }

    /**
     * Save a milestone for a dream. Auto-triggers dream progress recalculation.
     */
    public MilestoneResponse saveMilestone(Long dreamId, sp.main.DreamWeb.dto.MilestoneRequest request) {
        User user = getCurrentUser();
        Dream dream = repository.findById(dreamId)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        Milestone milestone = Milestone.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .difficultyLevel(request.getDifficultyLevel())
                .isCompleted(false)
                .dream(dream)
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        return intelligenceService.enrich(saved);
    }

    /**
     * Update a milestone. Auto-triggers dream progress recalculation if completion status changed.
     */
    public MilestoneResponse updateMilestone(Long dreamId, Long milestoneId, sp.main.DreamWeb.dto.MilestoneRequest request) {
        User user = getCurrentUser();
        Dream dream = repository.findById(dreamId)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        if (!milestone.getDream().getId().equals(dreamId)) {
            throw new RuntimeException("Milestone does not belong to this dream");
        }

        boolean wasCompleted = milestone.isCompleted();
        if (request.getTitle() != null) milestone.setTitle(request.getTitle());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        if (request.getDueDate() != null) milestone.setDueDate(request.getDueDate());
        if (request.getDifficultyLevel() != null) milestone.setDifficultyLevel(request.getDifficultyLevel());
        milestone.setCompleted(request.isCompleted());

        Milestone updated = milestoneRepository.save(milestone);

        // auto-touch dream's progress if completion status changed
        if (wasCompleted != request.isCompleted()) {
            dream.setAchieved(dream.isAchieved()); // trigger mapToResponse logic
            repository.save(dream);
        }

        return intelligenceService.enrich(updated);
    }

    /**
     * Delete a milestone. Auto-triggers dream progress recalculation.
     */
    public void deleteMilestone(Long dreamId, Long milestoneId) {
        User user = getCurrentUser();
        Dream dream = repository.findById(dreamId)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        if (!milestone.getDream().getId().equals(dreamId)) {
            throw new RuntimeException("Milestone does not belong to this dream");
        }

        milestoneRepository.delete(milestone);

        // auto-touch dream's progress
        repository.save(dream);
    }

    /**
     * Get all milestones for a dream with recommended ordering.
     */
    public List<MilestoneResponse> getMilestones(Long dreamId) {
        User user = getCurrentUser();
        Dream dream = repository.findById(dreamId)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        List<Milestone> all = milestoneRepository.findAllByDreamIdOrderByCreatedAtAsc(dreamId);
        return intelligenceService.suggestOrder(all);
    }

    /**
     * Get a single milestone enriched with intelligence.
     */
    public MilestoneResponse getMilestone(Long dreamId, Long milestoneId) {
        User user = getCurrentUser();
        Dream dream = repository.findById(dreamId)
                .orElseThrow(() -> new RuntimeException("Dream not found"));

        if (!dream.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Action not authorized");
        }

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        if (!milestone.getDream().getId().equals(dreamId)) {
            throw new RuntimeException("Milestone does not belong to this dream");
        }

        return intelligenceService.enrich(milestone);
    }
}
