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
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;

    @Indexed(unique = true)
    private String invoiceId;

    @Indexed
    private String appointmentId;

    @Indexed
    private String patientId;

    private List<InvoiceItem> items;

    private Double total;

    @Indexed
    private String status = "pending"; // pending, paid

    private String paymentMethod; // Cash, Card, UPI, Insurance

    private Boolean hasInsurance = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItem {
        private String description;
        private Double amount;
    }
}
