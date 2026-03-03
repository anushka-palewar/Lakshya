package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sp.main.DreamWeb.model.Milestone;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findAllByDreamIdOrderByCreatedAtAsc(Long dreamId);
}
