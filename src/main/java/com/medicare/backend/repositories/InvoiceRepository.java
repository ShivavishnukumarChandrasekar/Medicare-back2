package com.medicare.backend.repositories;

import com.medicare.backend.models.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;
import java.util.Date;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    Optional<Invoice> findByInvoiceId(String invoiceId);
    List<Invoice> findByCreatedAtBetweenAndStatus(Date start, Date end, String status);
}
