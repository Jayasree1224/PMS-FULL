package com.placement.pms.repository;

import com.placement.pms.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByDepartment(String department);
    List<Student> findByDepartmentAndPlaced(String department, boolean placed);
    List<Student> findByPlaced(boolean placed);
}
