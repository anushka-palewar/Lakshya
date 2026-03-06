package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

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
            String url = String.format(
                "https://api.unsplash.com/search/photos?query=%s&per_page=6&orientation=landscape",
                query
            );

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
                        if (imageUrls.size() >= 6) break; // Limit to 6 images
                    }
                    return imageUrls;
                }
            }
        } catch (RestClientException e) {
            log.error("Error calling Unsplash API", e);
        } catch (Exception e) {
            log.error("Unexpected error in image search", e);
        }

        // Fallback to sample images if API fails
        return getSampleImages();
    }

    /**
     * Generate an AI image using OpenAI's DALL-E API
     */
    public String generateDreamImage(String title, String description) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            log.warn("OpenAI API key not configured, returning sample image");
            return getSampleImage();
        }

        try {
            String prompt = buildAIPrompt(title, description);

            String url = "https://api.openai.com/v1/images/generations";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openaiApiKey);

            Map<String, Object> requestBody = Map.of(
                "prompt", prompt,
                "n", 1,
                "size", "512x512"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null && !data.isEmpty()) {
                    return (String) data.get(0).get("url");
                }
            }
        } catch (RestClientException e) {
            log.error("Error calling OpenAI API", e);
        } catch (Exception e) {
            log.error("Unexpected error in AI image generation", e);
        }

        // Fallback to sample image if API fails
        return getSampleImage();
    }

    private static final Set<String> STOP_WORDS = Set.of(
        "a","the","to","my","dream","of","for","in","on","about",
        "and","or","is","it","this","that","with","i","want","will",
        "be","at","from","by","as","an","into","up","down","over"
    );

    private String buildSearchQuery(String title, String description, String category, String custom) {
        String base;
        if (custom != null && !custom.trim().isEmpty()) {
            base = custom.trim();
        } else {
            StringBuilder sb = new StringBuilder();
            if (title != null && !title.trim().isEmpty()) {
                sb.append(title.trim());
            }
            if (description != null && !description.trim().isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(description.trim());
            }
            if (category != null && !category.trim().isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(category.trim());
            }
            base = sb.toString();
        }

        // clean text: remove stopwords and filler phrases
        String cleaned = Arrays.stream(base.toLowerCase().split("\\s+"))
            .filter(w -> !STOP_WORDS.contains(w))
            .filter(w -> !w.matches(".*\\d.*")) // remove words with digits
            .collect(Collectors.joining(" "));

        // limit to first 5 words
        List<String> parts = Arrays.asList(cleaned.split("\\s+"));
        if (parts.size() > 5) {
            parts = parts.subList(0, 5);
        }
        String result = String.join(" ", parts);

        if (result.isEmpty()) {
            // fallback simple keywords
            result = "inspirational goal success";
        }

        // replace any non-word and compress spaces
        result = result.replaceAll("[^a-zA-Z0-9\\s]", "").replaceAll("\\s+", " ");

        // map spaces to + for URL
        return result.trim().replaceAll(" ", "+");
    }

    private String buildAIPrompt(String title, String description) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a motivational and aspirational image representing: ");

        if (title != null && !title.trim().isEmpty()) {
            prompt.append(title.trim());
        }

        if (description != null && !description.trim().isEmpty()) {
            if (prompt.length() > "Create a motivational and aspirational image representing: ".length()) {
                prompt.append(" - ");
            }
            prompt.append(description.trim());
        }

        prompt.append(". Cinematic lighting, inspiring atmosphere, high quality, professional photography style.");

        return prompt.toString();
    }

    private List<String> getSampleImages() {
        // Fallback sample images from Unsplash
        return List.of(
            "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
        );
    }

    private String getSampleImage() {
        List<String> samples = getSampleImages();
        return samples.get(new Random().nextInt(samples.size()));
    }
}