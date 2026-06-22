package com.medicare.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStats {
    private Double totalRevenue;
    private Double revenueGrowth;
    private Long totalPatients;
    private Double patientGrowth;
    private Long activeDoctors;
    private Long pharmacyAlerts;
    private List<RevenueTimelineItem> revenueTimeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTimelineItem {
        private String date;
        private Double amount;
    }
}
