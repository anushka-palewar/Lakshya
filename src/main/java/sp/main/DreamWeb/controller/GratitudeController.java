package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.GratitudeRequest;
import sp.main.DreamWeb.dto.GratitudeResponse;
import sp.main.DreamWeb.dto.GratitudeStatusResponse;
import sp.main.DreamWeb.service.GratitudeService;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/gratitude")
@RequiredArgsConstructor
@Validated
public class GratitudeController {

    private final GratitudeService service;

    /**
     * Check if user completed gratitude for today and return status
     * GET /api/gratitude/today
     */
    @GetMapping("/today")
    public ResponseEntity<GratitudeStatusResponse> getTodayGratitude() {
        return ResponseEntity.ok(service.getTodayGratitude());
    }

    /**
     * Submit gratitude entries for today
     * POST /api/gratitude
     */
    @PostMapping
    public ResponseEntity<GratitudeResponse> submitGratitude(@Valid @RequestBody GratitudeRequest request) {
        return ResponseEntity.ok(service.submitGratitude(request));
    }

    /**
     * Get gratitude history for the user
     * GET /api/gratitude/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<GratitudeResponse>> getHistory() {
        return ResponseEntity.ok(service.getHistory());
    }

    /**
     * Check if user completed gratitude today
     * GET /api/gratitude/completed-today
     */
    @GetMapping("/completed-today")
    public ResponseEntity<Boolean> hasCompletedToday() {
        return ResponseEntity.ok(service.hasCompletedToday());
    }
}
