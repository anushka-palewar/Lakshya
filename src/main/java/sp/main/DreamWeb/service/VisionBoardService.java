package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.VisionBoardResponse;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.DreamRepository;
import sp.main.DreamWeb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisionBoardService {

    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;

    @Value("${cloudinary.cloud.name:}")
    private String cloudName;

    // Simple in-memory cache for generated vision boards
    private final Map<Long, VisionBoardResponse> visionBoardCache = new HashMap<>();
    private final Map<Long, Long> cacheTimestamps = new HashMap<>();
    private static final long CACHE_DURATION_MINUTES = 60;

    /**
     * Generate a vision board for the logged-in user
     * 
     * @param mode            "collage" or "ai"
     * @param forceRegenerate whether to bypass cache
     */
    public VisionBoardResponse generateVisionBoard(String mode, boolean forceRegenerate) {
        try {
            User user = getCurrentUser();
            log.info("Vision board requested by user: {} in mode: {}", user != null ? user.getId() : "null", mode);

            if (user == null || user.getId() == null) {
                log.error("User or user ID is null");
                throw new RuntimeException("User not authenticated or user ID is invalid");
            }

            long userId = user.getId();
            String cacheKey = userId + "_" + mode;

            // Check cache if not forcing regeneration
            if (!forceRegenerate && visionBoardCache.containsKey(userId)) {
                VisionBoardResponse cached = visionBoardCache.get(userId);
                if (cached.getMode().equalsIgnoreCase(mode)) {
                    Long cacheTime = cacheTimestamps.get(userId);
                    if (cacheTime != null
                            && System.currentTimeMillis() - cacheTime < CACHE_DURATION_MINUTES * 60 * 1000) {
                        log.info("Returning cached vision board for userId: {} mode: {}", userId, mode);
                        return cached;
                    }
                }
            }

            // Fetch dreams with images
            List<Map<String, Object>> dreamData = dreamRepository.findDreamsWithImages(userId);
            if (dreamData == null || dreamData.isEmpty()) {
                log.warn("User has no dreams with images. userId: {}", userId);
                throw new RuntimeException("No dream images found. Add dream images to generate your vision board.");
            }

            // Convert to DTOs
            List<VisionBoardResponse.DreamImage> dreamImages = convertToDreamImages(dreamData);
            if (dreamImages.isEmpty()) {
                throw new RuntimeException("Error processing dreams. Please try again.");
            }

            // Limit to maximum 6 images for both modes to keep it clean
            List<VisionBoardResponse.DreamImage> limitedDreams = dreamImages.size() > 6
                    ? dreamImages.subList(0, 6)
                    : dreamImages;

            String boardImageUrl = "";
            String layout = determineLayout(limitedDreams.size());

            if ("ai".equalsIgnoreCase(mode)) {
                log.info("Generating AI Vision Board for userId: {}", userId);
                boardImageUrl = imageService.generateMultiDreamAIVisionBoard(limitedDreams);
            } else {
                log.info("Generating Collage Vision Board for userId: {}", userId);
                boardImageUrl = generateCloudinaryCollageUrl(limitedDreams);
            }

            // Create response
            VisionBoardResponse response = VisionBoardResponse.builder()
                    .dreams(limitedDreams)
                    .layout(layout)
                    .boardImageUrl(boardImageUrl)
                    .mode(mode)
                    .generatedAt(System.currentTimeMillis())
                    .inspirationalMessage(getMotivationalMessage())
                    .build();

            // Cache the result
            visionBoardCache.put(userId, response);
            cacheTimestamps.put(userId, System.currentTimeMillis());

            log.info("Vision board generated successfully for userId: {} mode: {}", userId, mode);
            return response;
        } catch (

        Exception e) {
            log.error("Error generating vision board", e);
            throw new RuntimeException("Error generating vision board: " + e.getMessage());
        }
    }

    /**
     * Generate a Cloudinary collage URL using overlays
     */
    private String generateCloudinaryCollageUrl(List<VisionBoardResponse.DreamImage> dreams) {
        if (cloudName == null || cloudName.isEmpty() || dreams.isEmpty()) {
            // Fallback: return the first image if Cloudinary not configured
            return dreams.get(0).getImageUrl();
        }

        try {
            StringBuilder transformations = new StringBuilder("w_1000,h_1000,c_fill,q_auto,f_auto");
            int count = dreams.size();

            // Use a base "transparent" or "background" image or just a color
            // Cloudinary allows using a color as base:
            // https://res.cloudinary.com/demo/image/upload/w_1000,h_1000,b_rgb:1a1a2e/...

            // For now, let's use the first image as base but hide it with overlays if we
            // want a clean grid,
            // or just follow the layout rules.

            String firstImageUrl = dreams.get(0).getImageUrl();
            String encodedFirst = Base64.getUrlEncoder().encodeToString(firstImageUrl.getBytes());

            transformations.append("/l_fetch:").append(encodedFirst);

            if (count == 1) {
                // Just the first image, full size
                transformations.append("c_fill,w_1000,h_1000");
            } else if (count == 2) {
                // Side by side: 50% each
                transformations.append("c_fill,w_500,h_1000,g_west,bo_10px_solid_white");
                String encoded2 = Base64.getUrlEncoder().encodeToString(dreams.get(1).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded2)
                        .append(",c_fill,w_502,h_1000,g_east,bo_10px_solid_white");
            } else if (count == 3) {
                // Triangular: 1 top (100%), 2 bottom (50% each)
                transformations.append("c_fill,w_1000,h_500,g_north,bo_5px_solid_white");
                String encoded2 = Base64.getUrlEncoder().encodeToString(dreams.get(1).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded2)
                        .append(",c_fill,w_500,h_502,g_south_west,bo_5px_solid_white");
                String encoded3 = Base64.getUrlEncoder().encodeToString(dreams.get(2).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded3)
                        .append(",c_fill,w_502,h_502,g_south_east,bo_5px_solid_white");
            } else if (count == 4) {
                // 2x2 Grid
                transformations.append("c_fill,w_500,h_500,g_north_west,bo_5px_solid_white");
                String encoded2 = Base64.getUrlEncoder().encodeToString(dreams.get(1).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded2)
                        .append(",c_fill,w_502,h_500,g_north_east,bo_5px_solid_white");
                String encoded3 = Base64.getUrlEncoder().encodeToString(dreams.get(2).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded3)
                        .append(",c_fill,w_500,h_502,g_south_west,bo_5px_solid_white");
                String encoded4 = Base64.getUrlEncoder().encodeToString(dreams.get(3).getImageUrl().getBytes());
                transformations.append("/l_fetch:").append(encoded4)
                        .append(",c_fill,w_502,h_502,g_south_east,bo_5px_solid_white");
            } else {
                // 5-6 images: 2 rows, Row 1: 3 images, Row 2: remaining
                int row1Count = 3;
                int row2Count = Math.min(3, count - 3);
                int width1 = 1000 / row1Count;
                int width2 = 1000 / row2Count;

                // First image (Row 1, Pos 1)
                transformations.append("c_fill,w_").append(width1).append(",h_500,g_north_west,bo_5px_solid_white");

                // Row 1
                for (int i = 1; i < row1Count; i++) {
                    String encoded = Base64.getUrlEncoder().encodeToString(dreams.get(i).getImageUrl().getBytes());
                    transformations.append("/l_fetch:").append(encoded)
                            .append(",c_fill,w_").append(width1 + 2).append(",h_500,g_north,x_")
                            .append((i == 1 ? 0 : width1)).append(",bo_5px_solid_white");
                }

                // Row 2
                for (int i = 0; i < row2Count; i++) {
                    String encoded = Base64.getUrlEncoder().encodeToString(dreams.get(i + 3).getImageUrl().getBytes());
                    transformations.append("/l_fetch:").append(encoded)
                            .append(",c_fill,w_").append(width2 + (i == row2Count - 1 ? 2 : 0))
                            .append(",h_502,g_south_west,x_")
                            .append(i * width2).append(",bo_5px_solid_white");
                }
            }

            // Cloudinary fetch URL format:
            // https://res.cloudinary.com/<cloud_name>/image/fetch/<transformations>/<url>
            return String.format("https://res.cloudinary.com/%s/image/fetch/%s/v1/%s",
                    cloudName, transformations.toString(), firstImageUrl);
        } catch (Exception e) {
            log.error("Error generating Cloudinary URL", e);
            return dreams.get(0).getImageUrl();
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
