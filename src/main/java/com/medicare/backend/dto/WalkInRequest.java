package com.medicare.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkInRequest {
    private String name;
    private String phone;
    private String gender;
    private String age;
    private Map<String, String> vitals;
}
