package sp.main.DreamWeb.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    @Override
    public void run(String... args) throws Exception {
        log.info("Fixing database schema...");
        try {
            // Fix for user streaks
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP;");
            jdbcTemplate.execute("ALTER TABLE _users ALTER COLUMN daily_streak SET DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ALTER COLUMN daily_streak DROP NOT NULL;");
            
            // Fix for dreams image_url column - change from VARCHAR to TEXT to support long image URLs
            try {
                jdbcTemplate.execute("ALTER TABLE dreams ALTER COLUMN image_url TYPE TEXT;");
                log.info("Fixed dreams.image_url column type to TEXT");
            } catch (Exception e) {
                log.debug("dreams.image_url column fix skipped: {}", e.getMessage());
            }
            
            log.info("Database schema fixed successfully.");
        } catch (Exception e) {
            log.error("Database schema fix failed: {}", e.getMessage(), e);
        }
    }
}
