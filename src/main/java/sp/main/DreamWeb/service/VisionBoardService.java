package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.VisionBoardResponse;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;
import sp.main.DreamWeb.repository.UserRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisionBoardService {

    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;

    // Simple in-memory cache for generated vision boards
    private final Map<Long, VisionBoardResponse> visionBoardCache = new HashMap<>();
    private final Map<Long, Long> cacheTimestamps = new HashMap<>();
    private static final long CACHE_DURATION_MINUTES = 60;

    /**
     * Generate a vision board for the logged-in user
     * Uses native SQL to avoid Hibernate serialization issues
     */
    public VisionBoardResponse generateVisionBoard(boolean forceRegenerate) {
        try {
            User user = getCurrentUser();
            log.info("Vision board requested by user: {}", user != null ? user.getId() : "null");

            if (user == null || user.getId() == null) {
                log.error("User or user ID is null");
                throw new RuntimeException("User not authenticated or user ID is invalid");
            }

            long userId = user.getId();
            log.info("Generating vision board for userId: {}", userId);

            // Check cache if not forcing regeneration
            if (!forceRegenerate && visionBoardCache.containsKey(userId)) {
                Long cacheTime = cacheTimestamps.get(userId);
                if (cacheTime != null && System.currentTimeMillis() - cacheTime < CACHE_DURATION_MINUTES * 60 * 1000) {
                    log.info("Returning cached vision board for userId: {}", userId);
                    return visionBoardCache.get(userId);
                }
            }

            // Fetch dreams with images using native SQL - avoids lazy loading issues
            log.info("Fetching dreams with images for userId: {}", userId);
            List<Map<String, Object>> dreamData = dreamRepository.findDreamsWithImages(userId);
            log.info("Found {} dreams with images for userId: {}", dreamData.size(), userId);

            if (dreamData == null || dreamData.isEmpty()) {
                log.warn("User has no dreams with images. userId: {}", userId);
                throw new RuntimeException("No dreams with images found. Please add images to your dreams.");
            }

            // Convert raw data to DreamImage DTOs - safe mapping without entity issues
            List<VisionBoardResponse.DreamImage> dreamImages = convertToDreamImages(dreamData);

            log.info("Converted {} dreams to DreamImage DTOs", dreamImages.size());

            if (dreamImages.isEmpty()) {
                log.error("Failed to convert dream data to DreamImage objects");
                throw new RuntimeException("Error processing dreams. Please try again.");
            }

            // Limit to maximum 6 images
            if (dreamImages.size() > 6) {
                dreamImages = dreamImages.subList(0, 6);
            }

            // Determine layout based on image count
            String layout = determineLayout(dreamImages.size());
            log.info("Selected layout: {} for {} dreams", layout, dreamImages.size());

            // Create response
            VisionBoardResponse response = VisionBoardResponse.builder()
                    .dreams(dreamImages)
                    .layout(layout)
                    .generatedAt(System.currentTimeMillis())
                    .inspirationalMessage(getMotivationalMessage())
                    .build();

            // Cache the result
            visionBoardCache.put(userId, response);
            cacheTimestamps.put(userId, System.currentTimeMillis());

            log.info("Vision board generated successfully for userId: {}", userId);
            return response;
        } catch (Exception e) {
            log.error("Error generating vision board", e);
            throw new RuntimeException("Error generating vision board: " + e.getMessage());
        }
    }

    /**
     * Convert raw SQLresult maps to DreamImage DTOs
     */
    private List<VisionBoardResponse.DreamImage> convertToDreamImages(List<Map<String, Object>> dreamData) {
        List<VisionBoardResponse.DreamImage> dreamImages = new ArrayList<>();

        for (Map<String, Object> data : dreamData) {
            try {
                Long dreamId = getLongValue(data, "id");
                String name = getStringValue(data, "name");
                String description = getStringValue(data, "description");
                String imageUrl = getStringValue(data, "image_url");
                String priority = getStringValue(data, "priority");
                String category = getStringValue(data, "category");

                if (imageUrl == null || imageUrl.trim().isEmpty()) {
                    log.debug("Skipping dream (id={}) with no image URL", dreamId);
                    continue;
                }

                VisionBoardResponse.DreamImage dreamImage = VisionBoardResponse.DreamImage.builder()
                        .dreamId(dreamId)
                        .dreamTitle(name != null ? name : "Untitled")
                        .dreamDescription(description != null ? description : "")
                        .imageUrl(imageUrl)
                        .priority(priority != null ? priority : "Medium")
                        .category(category != null ? category : "Personal")
                        .build();

                dreamImages.add(dreamImage);
                log.debug("Added DreamImage: id={}, title={}", dreamId, name);
            } catch (Exception e) {
                log.error("Error converting dream data to DreamImage", e);
            }
        }

        return dreamImages;
    }

    private Long getLongValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return null;
        if (value instanceof Long)
            return (Long) value;
        if (value instanceof Integer)
            return ((Integer) value).longValue();
        if (value instanceof Number)
            return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            log.warn("Could not parse Long value for key: {}, value: {}", key, value);
            return null;
        }
    }

    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return null;
        return value.toString();
    }

    /**
     * Clear the vision board cache for the user
     * Useful when dreams are updated
     */
    public void clearCache() {
        try {
            User user = getCurrentUser();
            if (user != null && user.getId() != null) {
                visionBoardCache.remove(user.getId());
                cacheTimestamps.remove(user.getId());
                log.info("Cache cleared for userId: {}", user.getId());
            }
        } catch (Exception e) {
            log.warn("Error clearing cache", e);
        }
    }

    /**
     * Determine the best layout based on image count
     */
    private String determineLayout(int imageCount) {
        return switch (imageCount) {
            case 1 -> "full";
            case 2 -> "side-by-side";
            case 3 -> "triangle";
            case 4 -> "grid-2x2";
            case 5, 6 -> "collage";
            default -> "collage";
        };
    }

    /**
     * Get a motivational message
     */
    private String getMotivationalMessage() {
        List<String> messages = List.of(
                "You are becoming the person who achieves these dreams.",
                "Every dream is a stepping stone to your future.",
                "Your vision is your reality. Believe it. See it. Achieve it.",
                "This is your future. Own it.",
                "Visualize your dreams. Cultivate your reality.",
                "Your potential is limitless. Your dreams are destiny.",
                "Step into the life you've been dreaming about.",
                "The future is yours. Visualize it. Create it.");

        Random random = new Random();
        return messages.get(random.nextInt(messages.size()));
    }

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("Auth principal: {}, Authenticated: {}",
                auth != null ? auth.getPrincipal() : "null",
                auth != null ? auth.isAuthenticated() : false);

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            log.error("User not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        // Get username from auth principal and fetch full User entity from database
        User authUser = (User) auth.getPrincipal();
        String username = authUser.getUsername();
        log.debug("Fetching user from database: {}", username);

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            log.error("User not found in database: {}", username);
            throw new RuntimeException("User not found in database");
        }

        User user = userOptional.get();
        log.debug("Current user: {}, ID: {}", user.getUsername(), user.getId());

        if (user.getId() == null) {
            log.error("User ID is null for username: {}", username);
            throw new RuntimeException("User ID is null");
        }

        return user;
    }
}
