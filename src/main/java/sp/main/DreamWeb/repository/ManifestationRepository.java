package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sp.main.DreamWeb.model.Manifestation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ManifestationRepository extends JpaRepository<Manifestation, Long> {
    List<Manifestation> findAllByUserId(Long userId);

    Optional<Manifestation> findByUserIdAndDate(Long userId, LocalDate date);
}
