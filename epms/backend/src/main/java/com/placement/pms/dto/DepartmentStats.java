package com.placement.pms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DepartmentStats {
    private String department;
    private long totalStudents;
    private long placedStudents;
    private long notPlacedStudents;
}
