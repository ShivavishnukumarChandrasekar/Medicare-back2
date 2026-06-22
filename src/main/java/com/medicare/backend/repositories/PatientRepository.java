package com.medicare.backend.repositories;

import com.medicare.backend.models.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface PatientRepository extends MongoRepository<Patient, String> {
    Optional<Patient> findByUserId(String userId);
    Optional<Patient> findByPatientId(String patientId);
    List<Patient> findByNameRegexOrPatientIdRegex(String name, String patientId);
}
