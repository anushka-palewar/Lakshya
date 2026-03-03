package sp.main.DreamWeb.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    /**
     * Generates 5-8 actionable, measurable milestone suggestions based on dream title and description.
     * 
     * @param dreamTitle The title of the dream
     * @param dreamDescription The description of the dream
     * @return List of 5-8 unique, measurable milestone suggestions (under 100 chars each)
     */
    public List<String> generateMilestoneSuggestions(String dreamTitle, String dreamDescription) {
        Set<String> suggestions = new LinkedHashSet<>();
        String combined = (dreamTitle + " " + (dreamDescription != null ? dreamDescription : "")).toLowerCase();

        // 1. Research & Planning Phase
        suggestions.add(sanitize("Research top 5 resources for " + getFirstKeyword(dreamTitle)));
        suggestions.add(sanitize("Create a detailed action plan with timeline"));
        suggestions.add(sanitize("Define success metrics and KPIs"));

        // 2. Early Progress Milestones (based on keywords)
        if (containsKeywords(combined, "learn", "study", "skill", "master")) {
            suggestions.add(sanitize("Complete 10 hours of learning " + getFirstKeyword(dreamTitle)));
            suggestions.add(sanitize("Practice daily for 30 days"));
            suggestions.add(sanitize("Build or complete first project"));
        }

        if (containsKeywords(combined, "write", "book", "article", "blog")) {
            suggestions.add(sanitize("Write 5,000 words of outline/notes"));
            suggestions.add(sanitize("Complete first draft of introduction"));
            suggestions.add(sanitize("Finish 25% of full content"));
        }

        if (containsKeywords(combined, "build", "create", "start", "launch", "business", "product")) {
            suggestions.add(sanitize("Validate idea with 10 potential users"));
            suggestions.add(sanitize("Create minimum viable product (MVP)"));
            suggestions.add(sanitize("Launch beta version to test market"));
        }

        if (containsKeywords(combined, "fitness", "exercise", "run", "marathon", "health", "weight")) {
            suggestions.add(sanitize("Establish consistent workout routine 3x/week"));
            suggestions.add(sanitize("Reach 50% of fitness target"));
            suggestions.add(sanitize("Achieve specific performance metric"));
        }

        if (containsKeywords(combined, "travel", "visit", "explore", "country", "city")) {
            suggestions.add(sanitize("Save 25% of required funds"));
            suggestions.add(sanitize("Plan detailed itinerary"));
            suggestions.add(sanitize("Book 50% of reservations"));
        }

        if (containsKeywords(combined, "financial", "earn", "invest", "money", "income")) {
            suggestions.add(sanitize("Generate first $1,000 in revenue"));
            suggestions.add(sanitize("Reach financial milestone of 50% target"));
            suggestions.add(sanitize("Establish monthly recurring income"));
        }

        // 3. Mid-Progress Milestones
        suggestions.add(sanitize("Achieve 50% progress toward main goal"));
        suggestions.add(sanitize("Overcome major obstacles and adapt"));
        suggestions.add(sanitize("Document progress and learnings"));

        // 4. Final Phase
        suggestions.add(sanitize("Complete core deliverable or target"));
        suggestions.add(sanitize("Review results against success metrics"));

        // Collect unique, sanitized suggestions
        List<String> result = suggestions.stream()
                .distinct()
                .filter(s -> !s.isEmpty() && s.length() < 100)
                .limit(8)
                .collect(Collectors.toList());

        // Ensure at least 5 suggestions
        if (result.size() < 5) {
            result.addAll(getDefaultMilestones().stream()
                    .filter(m -> !result.contains(m))
                    .limit(5 - result.size())
                    .collect(Collectors.toList()));
        }

        return result;
    }

    /**
     * Sanitizes milestone text by removing special characters and ensuring proper formatting.
     */
    private String sanitize(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        return text.replaceAll("[^a-zA-Z0-9\\s\\-(),;']", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Extracts the first significant word from the dream title.
     */
    private String getFirstKeyword(String text) {
        if (text == null || text.isEmpty()) {
            return "it";
        }
        String[] words = text.toLowerCase().split("\\s+");
        return words.length > 0 ? words[0] : "it";
    }

    /**
     * Checks if the text contains any of the given keywords.
     */
    private boolean containsKeywords(String text, String... keywords) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns default generic milestones if specific ones cannot be generated.
     */
    private List<String> getDefaultMilestones() {
        return Arrays.asList(
                "Define clear goals and success criteria",
                "Create detailed action plan",
                "Complete first actionable step",
                "Achieve 25% progress",
                "Reach 50% milestone",
                "Overcome challenges and adapt",
                "Achieve 75% progress",
                "Complete and review final results"
        );
    }
}
