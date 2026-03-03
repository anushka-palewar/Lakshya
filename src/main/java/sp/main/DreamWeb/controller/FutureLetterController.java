package sp.main.DreamWeb.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sp.main.DreamWeb.dto.FutureLetterRequest;
import sp.main.DreamWeb.dto.FutureLetterResponse;
import sp.main.DreamWeb.service.FutureLetterService;

@RestController
@RequestMapping("/api/future-letter")
@RequiredArgsConstructor
public class FutureLetterController {

    private final FutureLetterService service;

    @GetMapping
    public ResponseEntity<FutureLetterResponse> getLetter() {
        FutureLetterResponse resp = service.getLetterForUser();
        return resp != null ? ResponseEntity.ok(resp) : ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<FutureLetterResponse> saveLetter(@RequestBody FutureLetterRequest request) {
        FutureLetterResponse resp = service.saveOrUpdate(request);
        return ResponseEntity.ok(resp);
    }

    @PutMapping
    public ResponseEntity<FutureLetterResponse> updateLetter(@RequestBody FutureLetterRequest request) {
        FutureLetterResponse resp = service.saveOrUpdate(request);
        return ResponseEntity.ok(resp);
    }
}
