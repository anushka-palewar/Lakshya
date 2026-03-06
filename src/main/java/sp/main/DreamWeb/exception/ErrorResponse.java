package sp.main.DreamWeb.exception;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String timestamp;

    public ErrorResponse(String error, String message, int status) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }
}
