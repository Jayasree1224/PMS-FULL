package com.placement.pms.controller;

import com.placement.pms.dto.DepartmentStats;
import com.placement.pms.model.Student;
import com.placement.pms.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final List<String> DEPARTMENTS = List.of("CSE", "IT", "ECE", "MECH", "CIVIL", "AIDS");

    private final StudentRepository studentRepository;

    public DashboardController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Overall stats for all departments
    @GetMapping("/stats")
    public ResponseEntity<List<DepartmentStats>> getDepartmentStats() {
        List<Student> all = studentRepository.findAll();

        Map<String, List<Student>> grouped = all.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment().toUpperCase()));

        List<DepartmentStats> result = new ArrayList<>();

        for (String dept : DEPARTMENTS) {
            List<Student> deptStudents = grouped.getOrDefault(dept, new ArrayList<>());
            long total = deptStudents.size();
            long placed = deptStudents.stream().filter(Student::isPlaced).count();
            long notPlaced = total - placed;
            result.add(new DepartmentStats(dept, total, placed, notPlaced));
        }

        // include any other departments not in standard list
        for (String dept : grouped.keySet()) {
            if (!DEPARTMENTS.contains(dept)) {
                List<Student> deptStudents = grouped.get(dept);
                long total = deptStudents.size();
                long placed = deptStudents.stream().filter(Student::isPlaced).count();
                long notPlaced = total - placed;
                result.add(new DepartmentStats(dept, total, placed, notPlaced));
            }
        }

        return ResponseEntity.ok(result);
    }

    // Overall summary (total students, total placed, total companies, avg package)
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<Student> all = studentRepository.findAll();

        long totalStudents = all.size();
        long totalPlaced = all.stream().filter(Student::isPlaced).count();

        long totalCompanies = all.stream()
                .filter(Student::isPlaced)
                .map(Student::getCompanyName)
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .distinct()
                .count();

        double avgPackage = all.stream()
                .filter(Student::isPlaced)
                .filter(s -> s.getPackageLpa() != null)
                .mapToDouble(Student::getPackageLpa)
                .average()
                .orElse(0.0);

        double highestPackage = all.stream()
                .filter(Student::isPlaced)
                .filter(s -> s.getPackageLpa() != null)
                .mapToDouble(Student::getPackageLpa)
                .max()
                .orElse(0.0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", totalStudents);
        summary.put("totalPlaced", totalPlaced);
        summary.put("totalNotPlaced", totalStudents - totalPlaced);
        summary.put("totalCompanies", totalCompanies);
        summary.put("averagePackage", Math.round(avgPackage * 100.0) / 100.0);
        summary.put("highestPackage", highestPackage);

        return ResponseEntity.ok(summary);
    }
}
