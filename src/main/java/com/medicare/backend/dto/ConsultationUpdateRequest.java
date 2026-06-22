package com.medicare.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationUpdateRequest {
    private DiagnosisDto diagnosis;
    private List<String> labTests;
}
