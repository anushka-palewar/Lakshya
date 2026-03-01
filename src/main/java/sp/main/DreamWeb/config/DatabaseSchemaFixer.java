package sp.main.DreamWeb.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    @Override
    public void run(String... args) throws Exception {
        log.info("Fixing database schema for streaks...");
        try {
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP;");
            // Fix for stray 'daily_streak' column if it exists and is NOT NULL
            jdbcTemplate.execute("ALTER TABLE _users ALTER COLUMN daily_streak SET DEFAULT 0;");
            jdbcTemplate.execute("ALTER TABLE _users ALTER COLUMN daily_streak DROP NOT NULL;");
            log.info("Database schema fixed successfully.");
        } catch (Exception e) {
            log.error("Database schema fix failed: {}", e.getMessage(), e);
        }
    }
}
