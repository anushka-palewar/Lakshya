package sp.main.DreamWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisionBoardResponse {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DreamImage {
        private Long dreamId;
        private String dreamTitle;
        private String dreamDescription;
        private String imageUrl;
        private String priority;
        private String category;
    }
    
    private List<DreamImage> dreams;
    private String layout; // "side-by-side", "triangle", "grid-2x2", "collage"
    private Long generatedAt;
    private String inspirationalMessage;
}
