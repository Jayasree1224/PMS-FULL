package com.placement.pms.controller;

import com.placement.pms.config.JwtUtil;
import com.placement.pms.model.Student;
import com.placement.pms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final JwtUtil jwtUtil;

    public StudentController(StudentService studentService, JwtUtil jwtUtil) {
        this.studentService = studentService;
        this.jwtUtil = jwtUtil;
    }

    // GET all students - accessible to ADMIN, COORDINATOR, STUDENT (read-only)
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // GET students by department - accessible to all logged-in roles
    @GetMapping("/department/{dept}")
    public ResponseEntity<List<Student>> getStudentsByDepartment(@PathVariable String dept) {
        return ResponseEntity.ok(studentService.getStudentsByDepartment(dept));
    }

    // GET single student detail
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // ADD a new student - ADMIN (any dept) or COORDINATOR (only own dept)
    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student,
                                         @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String role = jwtUtil.getRoleFromToken(token);
        String userDept = jwtUtil.getDepartmentFromToken(token);

        if (role.equals("STUDENT")) {
            return forbidden("Students have read-only access");
        }

        if (role.equals("COORDINATOR")) {
            if (userDept == null || !userDept.equalsIgnoreCase(student.getDepartment())) {
                return forbidden("Coordinators can only manage their own department: " + userDept);
            }
        }

        Student saved = studentService.saveStudent(student);
        return ResponseEntity.ok(saved);
    }

    // UPDATE a student - ADMIN (any dept) or COORDINATOR (only own dept)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id,
                                            @RequestBody Student student,
                                            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String role = jwtUtil.getRoleFromToken(token);
        String userDept = jwtUtil.getDepartmentFromToken(token);

        if (role.equals("STUDENT")) {
            return forbidden("Students have read-only access");
        }

        Student existing = studentService.getStudentById(id);

        if (role.equals("COORDINATOR")) {
            if (userDept == null
                    || !userDept.equalsIgnoreCase(existing.getDepartment())
                    || !userDept.equalsIgnoreCase(student.getDepartment())) {
                return forbidden("Coordinators can only manage their own department: " + userDept);
            }
        }

        Student updated = studentService.updateStudent(id, student);
        return ResponseEntity.ok(updated);
    }

    // DELETE a student - ADMIN (any dept) or COORDINATOR (only own dept)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id,
                                            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String role = jwtUtil.getRoleFromToken(token);
        String userDept = jwtUtil.getDepartmentFromToken(token);

        if (role.equals("STUDENT")) {
            return forbidden("Students have read-only access");
        }

        Student existing = studentService.getStudentById(id);

        if (role.equals("COORDINATOR")) {
            if (userDept == null || !userDept.equalsIgnoreCase(existing.getDepartment())) {
                return forbidden("Coordinators can only manage their own department: " + userDept);
            }
        }

        studentService.deleteStudent(id);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Student deleted successfully");
        return ResponseEntity.ok(resp);
    }

    // UPLOAD student photo - ADMIN or COORDINATOR
    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file,
                                          @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String role = jwtUtil.getRoleFromToken(token);

        if (role.equals("STUDENT")) {
            return forbidden("Students have read-only access");
        }

        try {
            String photoUrl = studentService.storePhoto(file);
            Map<String, String> resp = new HashMap<>();
            resp.put("photoUrl", photoUrl);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload photo: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(403).body(error);
    }
}
