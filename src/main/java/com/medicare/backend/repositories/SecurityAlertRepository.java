package com.medicare.backend.repositories;

import com.medicare.backend.models.SecurityAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SecurityAlertRepository extends MongoRepository<SecurityAlert, String> {
    List<SecurityAlert> findByUserIdOrderByCreatedAtDesc(String userId);
    List<SecurityAlert> findAllByOrderByCreatedAtDesc();
}
