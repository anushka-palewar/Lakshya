package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.dto.MilestoneRequest;
import sp.main.DreamWeb.dto.MilestoneResponse;
import sp.main.DreamWeb.dto.VisionBoardResponse;
import sp.main.DreamWeb.service.DreamService;
import sp.main.DreamWeb.service.ImageService;
import sp.main.DreamWeb.service.VisionBoardService;
import sp.main.DreamWeb.dto.MilestoneSuggestionRequest;
import sp.main.DreamWeb.service.MilestoneService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService service;
    private final MilestoneService milestoneService;
    private final ImageService imageService;
    private final VisionBoardService visionBoardService;

    @PostMapping
    public ResponseEntity<DreamResponse> saveDream(@RequestBody DreamRequest request) {
        return ResponseEntity.ok(service.saveDream(request));
    }

    @GetMapping
    public ResponseEntity<List<DreamResponse>> getAllDreams() {
        return ResponseEntity.ok(service.getAllDreams());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DreamResponse> updateDream(@PathVariable Long id, @RequestBody DreamRequest request) {
        return ResponseEntity.ok(service.updateDream(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDream(@PathVariable Long id) {
        service.deleteDream(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DreamResponse> getDreamById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDreamById(id));
    }

    @GetMapping("/daily")
    public ResponseEntity<DreamResponse> getDailySelection() {
        DreamResponse daily = service.getDailySelection();
        return daily != null ? ResponseEntity.ok(daily) : ResponseEntity.noContent().build();
    }

    @GetMapping("/daily-focus")
    public ResponseEntity<DreamResponse> getDailyFocusDream() {
        DreamResponse dailyFocus = service.getDailyFocusDream();
        return dailyFocus != null ? ResponseEntity.ok(dailyFocus) : ResponseEntity.noContent().build();
    }

    // ===== VISION BOARD ENDPOINTS =====

    @GetMapping("/vision-board/generate")
    public ResponseEntity<VisionBoardResponse> generateVisionBoard(
            @RequestParam(defaultValue = "false") boolean forceRegenerate) {
        try {
            VisionBoardResponse response = visionBoardService.generateVisionBoard(forceRegenerate);
            if (response == null) {
                return ResponseEntity.status(500).body(null);
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Return 400 with error message
            throw new IllegalArgumentException("Vision Board Error: " + e.getMessage());
        } catch (Exception e) {
            // Return 500 for unexpected errors
            throw new RuntimeException("Unexpected error generating vision board: " + e.getMessage());
        }
    }

    @PostMapping("/vision-board/clear-cache")
    public ResponseEntity<Void> clearVisionBoardCache() {
        visionBoardService.clearCache();
        return ResponseEntity.noContent().build();
    }

       @PostMapping("/suggest-milestones")
       public ResponseEntity<List<String>> suggestMilestones(@RequestBody MilestoneSuggestionRequest request) {
           List<String> suggestions = milestoneService.generateMilestoneSuggestions(
               request.getDreamTitle(),
               request.getDreamDescription()
           );
           return ResponseEntity.ok(suggestions);
       }

       @PostMapping("/search-images")
       public ResponseEntity<List<String>> searchImages(@RequestBody Map<String, String> request) {
           String title = request.get("title");
           String description = request.get("description");
           String category = request.get("category");
           String custom = request.get("customQuery");
           List<String> imageUrls = imageService.searchDreamImages(title, description, category, custom);
           return ResponseEntity.ok(imageUrls);
       }

       @PostMapping("/generate-image")
       public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> request) {
           String title = request.get("title");
           String description = request.get("description");
           String imageUrl = imageService.generateDreamImage(title, description);
           return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
       }

       // ===== MILESTONE ENDPOINTS =====

       @PostMapping("/{dreamId}/milestones")
       public ResponseEntity<MilestoneResponse> createMilestone(
               @PathVariable Long dreamId,
               @RequestBody MilestoneRequest request) {
           return ResponseEntity.ok(service.saveMilestone(dreamId, request));
       }

       @GetMapping("/{dreamId}/milestones")
       public ResponseEntity<List<MilestoneResponse>> getMilestones(@PathVariable Long dreamId) {
           return ResponseEntity.ok(service.getMilestones(dreamId));
       }

       @GetMapping("/{dreamId}/milestones/{milestoneId}")
       public ResponseEntity<MilestoneResponse> getMilestone(
               @PathVariable Long dreamId,
               @PathVariable Long milestoneId) {
           return ResponseEntity.ok(service.getMilestone(dreamId, milestoneId));
       }

       @PutMapping("/{dreamId}/milestones/{milestoneId}")
       public ResponseEntity<MilestoneResponse> updateMilestone(
               @PathVariable Long dreamId,
               @PathVariable Long milestoneId,
               @RequestBody MilestoneRequest request) {
           return ResponseEntity.ok(service.updateMilestone(dreamId, milestoneId, request));
       }

       @DeleteMapping("/{dreamId}/milestones/{milestoneId}")
       public ResponseEntity<Void> deleteMilestone(
               @PathVariable Long dreamId,
               @PathVariable Long milestoneId) {
           service.deleteMilestone(dreamId, milestoneId);
           return ResponseEntity.noContent().build();
       }
}
