package sp.main.DreamWeb.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "manifestations")
public class Manifestation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @ElementCollection
    @CollectionTable(name = "manifestation_gratitude", joinColumns = @JoinColumn(name = "manifestation_id"))
    @Column(name = "item")
    private List<String> gratitudes;

    @ElementCollection
    @CollectionTable(name = "manifestation_affirmations", joinColumns = @JoinColumn(name = "manifestation_id"))
    @Column(name = "item")
    private List<String> affirmations;

    private String intention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id")
    private Dream focusedDream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
