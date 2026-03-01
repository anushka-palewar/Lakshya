package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.ManifestationRequest;
import sp.main.DreamWeb.dto.ManifestationResponse;
import sp.main.DreamWeb.service.ManifestationService;

import java.util.List;

@RestController
@RequestMapping("/api/manifestations")
@RequiredArgsConstructor
public class ManifestationController {

    private final ManifestationService service;

    @PostMapping
    public ResponseEntity<ManifestationResponse> saveManifestation(@RequestBody ManifestationRequest request) {
        return ResponseEntity.ok(service.saveManifestation(request));
    }

    @GetMapping("/today")
    public ResponseEntity<ManifestationResponse> getTodayManifestation() {
        ManifestationResponse today = service.getTodayManifestation();
        return today != null ? ResponseEntity.ok(today) : ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ManifestationResponse>> getAllManifestations() {
        return ResponseEntity.ok(service.getAllManifestations());
    }
}
