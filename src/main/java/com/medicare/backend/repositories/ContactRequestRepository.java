package com.medicare.backend.repositories;

import com.medicare.backend.models.ContactRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ContactRequestRepository extends MongoRepository<ContactRequest, String> {
    List<ContactRequest> findAllByOrderByCreatedAtDesc();
}
