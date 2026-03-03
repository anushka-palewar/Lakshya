package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sp.main.DreamWeb.model.Milestone;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findAllByDreamIdOrderByCreatedAtAsc(Long dreamId);
    
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.dream.user.id = :userId AND m.isCompleted = true")
    long countCompletedByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.dream.user.id = :userId")
    long countTotalByUserId(@Param("userId") Long userId);
}
