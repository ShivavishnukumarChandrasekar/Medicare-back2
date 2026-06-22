package com.medicare.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequest {
    private Date newDate;
    private String newSlot;
    private String reason;
}
