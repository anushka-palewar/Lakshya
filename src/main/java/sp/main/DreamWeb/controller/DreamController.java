package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.DreamRequest;
import sp.main.DreamWeb.dto.DreamResponse;
import sp.main.DreamWeb.service.DreamService;

import java.util.List;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService service;

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

    @GetMapping("/daily")
    public ResponseEntity<DreamResponse> getDailySelection() {
        DreamResponse daily = service.getDailySelection();
        return daily != null ? ResponseEntity.ok(daily) : ResponseEntity.noContent().build();
    }
}
