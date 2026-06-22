package com.medicare.backend.repositories;

import com.medicare.backend.models.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    Optional<MedicalRecord> findByRecordId(String recordId);
    List<MedicalRecord> findByPatientIdOrderByDateDesc(String patientId);
}
