package sp.main.DreamWeb.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_gratitude", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "entry_date"})
})
public class DailyGratitude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String gratitude1;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String gratitude2;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String gratitude3;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
