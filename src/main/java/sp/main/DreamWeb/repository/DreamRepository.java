package sp.main.DreamWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sp.main.DreamWeb.model.Dream;
import java.util.List;

@Repository
public interface DreamRepository extends JpaRepository<Dream, Long> {
    List<Dream> findAllByUserId(Long userId);
}
