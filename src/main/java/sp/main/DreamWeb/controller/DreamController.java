package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.service.DreamService;

import java.util.List;
import sp.main.DreamWeb.dto.MilestoneSuggestionRequest;
import sp.main.DreamWeb.service.MilestoneService;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService service;
    private final MilestoneService milestoneService;

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

       @PostMapping("/suggest-milestones")
       public ResponseEntity<List<String>> suggestMilestones(@RequestBody MilestoneSuggestionRequest request) {
           List<String> suggestions = milestoneService.generateMilestoneSuggestions(
               request.getDreamTitle(),
               request.getDreamDescription()
           );
           return ResponseEntity.ok(suggestions);
       }
}
