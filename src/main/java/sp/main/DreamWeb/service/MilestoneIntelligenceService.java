package sp.main.DreamWeb.service;

import sp.main.DreamWeb.dto.MilestoneResponse;
import sp.main.DreamWeb.model.Milestone;

import java.util.List;

public interface MilestoneIntelligenceService {
    /**
     * Enrich a single milestone with computed fields (risk, urgency, prediction, etc.)
     */
    MilestoneResponse enrich(Milestone milestone);

    /**
     * Suggest an ordering for a list of milestones. Returns responses with recommendedOrder filled.
     */
    List<MilestoneResponse> suggestOrder(List<Milestone> milestones);

    /**
     * Estimate expected completion time (days) for a milestone.
     */
    int estimateCompletionDays(Milestone milestone);

    /**
     * Detect if a milestone appears stalled based on last update time or user inactivity.
     */
    boolean isStalled(Milestone milestone);
}
