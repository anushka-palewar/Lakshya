package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sp.main.DreamWeb.model.FutureLetter;

import java.util.Optional;

public interface FutureLetterRepository extends JpaRepository<FutureLetter, Long> {
    Optional<FutureLetter> findByUserId(Long userId);
}
