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
@Document(collection = "medical_records")
public class MedicalRecord {
    @Id
    private String id;

    @Indexed(unique = true)
    private String recordId;

    @Indexed
    private String patientId;

    @Indexed
    private String type; // Prescription, Lab Report, Scan, Medical Follow Up, Other

    private String title;

    private Date date;

    private String fileUrl;

    private RecordDetails details;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordDetails {
        private String notes;
        private String medicines;
        private List<String> labTests;
        private String doctorName;
    }
}
