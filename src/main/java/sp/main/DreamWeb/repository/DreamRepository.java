package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sp.main.DreamWeb.model.Dream;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DreamRepository extends JpaRepository<Dream, Long> {
    List<Dream> findAllByUserId(Long userId);

    @Query(value = "SELECT * FROM dreams d " +
            "WHERE d.user_id = :userId " +
            "ORDER BY " +
            "  (d.due_date IS NOT NULL AND d.due_date >= CURRENT_DATE) DESC, " +
            "  d.due_date ASC, " +
            "  (d.last_focused_at IS NULL OR d.last_focused_at < :sevenDaysAgo) DESC, " +
            "  RANDOM() " +
            "LIMIT 1", nativeQuery = true)
    Optional<Dream> findDailyFocusDream(@Param("userId") Long userId,
            @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);
}
