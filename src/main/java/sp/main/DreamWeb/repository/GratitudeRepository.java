package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sp.main.DreamWeb.model.DailyGratitude;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GratitudeRepository extends JpaRepository<DailyGratitude, Long> {
    
    Optional<DailyGratitude> findByUserIdAndEntryDate(Long userId, LocalDate entryDate);
    
    @Query("SELECT dg FROM DailyGratitude dg WHERE dg.user.id = :userId ORDER BY dg.entryDate DESC")
    List<DailyGratitude> findByUserIdOrderByEntryDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(dg) > 0 THEN true ELSE false END " +
           "FROM DailyGratitude dg " +
           "WHERE dg.user.id = :userId AND dg.entryDate = CURRENT_DATE")
    boolean existsByUserIdAndToday(@Param("userId") Long userId);
}
