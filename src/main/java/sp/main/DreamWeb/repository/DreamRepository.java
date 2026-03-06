package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sp.main.DreamWeb.model.Dream;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface DreamRepository extends JpaRepository<Dream, Long> {
    
    @Query("SELECT d FROM Dream d WHERE d.user.id = :userId ORDER BY d.createdAt DESC")
    List<Dream> findAllByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT id, name, description, image_url, priority, category FROM dreams WHERE user_id = :userId AND image_url IS NOT NULL AND image_url != '' ORDER BY CASE WHEN priority = 'High' THEN 1 WHEN priority = 'Medium' THEN 2 ELSE 3 END ASC, created_at DESC", nativeQuery = true)
    List<Map<String, Object>> findDreamsWithImages(@Param("userId") Long userId);

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
    
    @Query("SELECT COUNT(d) FROM Dream d WHERE d.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM Dream d WHERE d.user.id = :userId AND d.isAchieved = true")
    long countCompletedByUserId(@Param("userId") Long userId);
}
