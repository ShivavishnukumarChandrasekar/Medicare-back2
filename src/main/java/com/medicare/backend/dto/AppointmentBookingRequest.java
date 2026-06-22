package com.medicare.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookingRequest {
    private String doctorId;
    private String slot;
    private String date;
}
