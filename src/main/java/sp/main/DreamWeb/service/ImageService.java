package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import sp.main.DreamWeb.dto.VisionBoardResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final RestTemplate restTemplate;

    @Value("${unsplash.access.key:}")
    private String unsplashAccessKey;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    /**
     * Search for images using Unsplash API based on dream title and description
     */
    public List<String> searchDreamImages(String title, String description) {
        return searchDreamImages(title, description, null, null);
    }

    public List<String> searchDreamImages(String title, String description, String category, String customQuery) {
        if (unsplashAccessKey == null || unsplashAccessKey.trim().isEmpty()) {
            log.warn("Unsplash API key not configured, returning sample images");
            return getSampleImages();
        }

        try {
            String query = buildSearchQuery(title, description, category, customQuery);
            log.info("Searching Unsplash with query: {}", query);

            String url = String.format(
                    "https://api.unsplash.com/search/photos?query=%s&per_page=6&orientation=landscape&content_filter=high",
                    query);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Client-ID " + unsplashAccessKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<?> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
                if (results != null && !results.isEmpty()) {
                    List<String> imageUrls = new ArrayList<>();
                    for (Map<String, Object> result : results) {
                        Map<String, String> urls = (Map<String, String>) result.get("urls");
                        if (urls != null && urls.containsKey("regular")) {
                            imageUrls.add(urls.get("regular"));
                        }
                    }
                    log.info("Found {} images on Unsplash for query: {}", imageUrls.size(), query);
                    return imageUrls;
                } else {
                    log.warn("No results from Unsplash for query: {}", query);
                    // Try a secondary broader search if title was too specific
                    if (query.contains("+") && !query.equals("inspirational+success+lifestyle")) {
                        String broaderQuery = query.split("\\+")[0];
                        log.info("Attempting broader search with: {}", broaderQuery);
                        return searchDreamImages(broaderQuery, "", "", null);
                    }
                }
            } else {
                log.error("Unsplash search failed with status: {}", response.getStatusCode());
            }
        } catch (RestClientException e) {
            log.error("Error calling Unsplash API: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in image search", e);
        }

        // Fallback to sample images if API fails or returns no results
        return getSampleImages();
    }

    public Map<String, Object> generateComprehensiveDreamImages(String title, String description) {
        log.info("Generating comprehensive dream images for: {}", title);
        List<String> combinedResults = new ArrayList<>();

        // 1. Generate one AI image variation from Gemini
        List<String> aiImages = generateAIImages(title, description, 1);

        // 2. Fetch Unsplash images using the dream name and description directly
        List<String> unsplashImages = searchDreamImages(title, description, null, null);

        // Take up to 6 as requested
        List<String> limitedUnsplash = unsplashImages.stream()
                .limit(6)
                .collect(Collectors.toList());

        // Combine results: AI image is always FIRST
        combinedResults.addAll(aiImages);
        combinedResults.addAll(limitedUnsplash);

        log.info("Total images generated: {} (AI: {}, Unsplash: {})", combinedResults.size(), aiImages.size(),
                limitedUnsplash.size());

        return Map.of(
                "images", combinedResults,
                "aiGeneratedCount", aiImages.size(),
                "unsplashCount", limitedUnsplash.size());
    }

    private String generateSmartSearchQuery(String title, String description) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return title; // Fallback to title
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                    + geminiApiKey;

            String prompt = String.format(
                    "Convert the following dream into a short Unsplash image search query.\n\n" +
                            "Dream: %s\n" +
                            "Description: %s\n\n" +
                            "Return only one short search phrase.",
                    title, (description != null ? description : ""));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
                    if (contentMap != null) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) parts.get(0).get("text").toString().trim();
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error generating smart search query via Gemini", e);
        }
        return title;
    }

    private List<String> generateAIImages(String title, String description, int count) {
        List<String> results = new ArrayList<>();
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return results;
        }

        try {
            String prompt = String.format(
                    "Create a realistic image of %s reflecting the following context: %s. " +
                            "Atmosphere should be inspiring and realistic.",
                    title, (description != null ? description : ""));

            String url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key="
                    + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> instance = Map.of("prompt", prompt);
            Map<String, Object> parameters = Map.of("sampleCount", count);
            Map<String, Object> requestBody = Map.of(
                    "instances", List.of(instance),
                    "parameters", parameters);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.getBody()
                        .get("predictions");
                if (predictions != null) {
                    for (Map<String, Object> pred : predictions) {
                        String mimeType = (String) pred.get("mimeType");
                        String bytesBase64Encoded = (String) pred.get("bytesBase64Encoded");
                        results.add("data:" + (mimeType != null ? mimeType : "image/png") + ";base64,"
                                + bytesBase64Encoded);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error generating AI images via Gemini", e);
        }
        return results;
    }

    /**
     * Fallback to OpenAI if needed (kept for compatibility)
     */
    public String generateDreamImage(String title, String description) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            return getSampleImage();
        }
        try {
            String prompt = buildAIPrompt(title, description);
            String url = "https://api.openai.com/v1/images/generations";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openaiApiKey);
            Map<String, Object> requestBody = Map.of("prompt", prompt, "n", 1, "size", "512x512");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null && !data.isEmpty()) {
                    return (String) data.get(0).get("url");
                }
            }
        } catch (Exception e) {
            log.error("Error in OpenAI generation", e);
        }
        return getSampleImage();
    }

    /**
     * Generate a combined AI vision board using multiple dreams
     */
    public String generateMultiDreamAIVisionBoard(List<VisionBoardResponse.DreamImage> dreams) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            log.warn("OpenAI API key not configured, returning sample image");
            return getSampleImage();
        }

        try {
            StringBuilder dreamList = new StringBuilder();
            for (VisionBoardResponse.DreamImage dream : dreams) {
                dreamList.append("• ").append(dream.getDreamTitle());
                if (dream.getDreamDescription() != null && !dream.getDreamDescription().isEmpty()) {
                    dreamList.append(": ").append(dream.getDreamDescription());
                }
                dreamList.append("\n");
            }

            String prompt = "A high-resolution, professional aesthetic vision board representing a person's life goals. The image should be a harmonious and artistic synthesis of the following dreams:\n\n"
                    +
                    dreamList.toString() +
                    "\nStyle: Cinematic lighting, realistic but aspirational, vivid colors, lifestyle photography. Ensure each element from the list is visually represented in the scene. High quality, 4k, no text or labels.";

            String url = "https://api.openai.com/v1/images/generations";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openaiApiKey);

            Map<String, Object> requestBody = Map.of(
                    "prompt", prompt,
                    "n", 1,
                    "size", "1024x1024" // Larger size for vision board
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null && !data.isEmpty()) {
                    return (String) data.get(0).get("url");
                }
            }
        } catch (Exception e) {
            log.error("Error generating combined AI vision board", e);
        }

        return getSampleImage();
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "the", "to", "my", "dream", "of", "for", "in", "on", "about",
            "and", "or", "is", "it", "this", "that", "with", "i", "want", "will",
            "be", "at", "from", "by", "as", "an", "into", "up", "down", "over",
            "future", "inspiration", "vision", "manifest", "goal");

    private String buildSearchQuery(String title, String description, String category, String custom) {
        if (custom != null && !custom.trim().isEmpty()) {
            return custom.trim().replaceAll("\\s+", "+");
        }

        List<String> keywords = new ArrayList<>();
        String lowTitle = title != null ? title.toLowerCase() : "";

        // 1. Extract core keywords from title (Primary source)
        if (title != null && !title.trim().isEmpty()) {
            String[] titleWords = lowTitle.split("\\s+");
            for (String word : titleWords) {
                String cleanWord = word.replaceAll("[^a-zA-Z0-9]", "");
                if (cleanWord.length() > 2 && !STOP_WORDS.contains(cleanWord)) {
                    keywords.add(cleanWord);
                }
            }
        }

        // 2. Append useful context from description if present
        if (description != null && !description.trim().isEmpty()) {
            String lowDesc = description.toLowerCase();
            Set<String> contextWords = Set.of("cafe", "restaurant", "building", "hostel", "gym", "office", "house",
                    "exterior", "architecture");
            for (String word : contextWords) {
                if (lowDesc.contains(word) && !keywords.contains(word)) {
                    keywords.add(word);
                }
            }
        }

        if (keywords.isEmpty()) {
            return "lifestyle+success";
        }

        return String.join("+", keywords);
    }

    private String buildAIPrompt(String title, String description) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("A high-quality, cinematic, and aspirational lifestyle photograph representing the dream: ");

        if (title != null && !title.trim().isEmpty()) {
            prompt.append("\"").append(title.trim()).append("\"");
        }

        if (description != null && !description.trim().isEmpty()) {
            prompt.append(". Context: ").append(description.trim());
        }

        prompt.append(
                ". The image should be vivid, inspiring, and professional with soft bokeh and cinematic lighting, avoiding text or labels.");

        return prompt.toString();
    }

    private List<String> getSampleImages() {
        return List.of(
                "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80", // Sun
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", // Mountains
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80", // Nature
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", // Forest
                "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=800&q=80", // City
                "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80" // Coast
        );
    }

    private String getSampleImage() {
        List<String> samples = getSampleImages();
        return samples.get(new Random().nextInt(samples.size()));
    }
}