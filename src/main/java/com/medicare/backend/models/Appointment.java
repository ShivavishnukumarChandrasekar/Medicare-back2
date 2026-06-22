package com.medicare.backend.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;

    @Indexed(unique = true)
    private String appointmentId;

    @Indexed
    private String doctorId;

    @Indexed
    private String patientId;

    private Date date;

    private String slot;

    private String token;

    @Indexed
    private String status = "upcoming"; // upcoming, completed, cancelled, settled

    private Diagnosis diagnosis;

    private List<LabTest> labTests;

    private Vitals vitals;

    private PendingChange pendingChange;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Diagnosis {
        private String notes;
        private String medicines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabTest {
        private String testName;
        private String status = "requested"; // requested, completed
        private Date date = new Date();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Vitals {
        private String bp;
        private String pulse;
        private String temp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingChange {
        private String type; // cancel, reschedule
        private Date newDate;
        private String newSlot;
        private String reason;
        private Date requestDate;
    }
}
