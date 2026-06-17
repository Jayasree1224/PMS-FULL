package com.placement.pms.service;

import com.placement.pms.model.Student;
import com.placement.pms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsByDepartment(String department) {
        return studentRepository.findByDepartment(department.toUpperCase());
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Student saveStudent(Student student) {
        if (student.getDepartment() != null) {
            student.setDepartment(student.getDepartment().toUpperCase());
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student updated) {
        Student existing = getStudentById(id);

        existing.setName(updated.getName());
        existing.setDepartment(updated.getDepartment().toUpperCase());
        existing.setBatch(updated.getBatch());
        existing.setEmail(updated.getEmail());
        existing.setRollNumber(updated.getRollNumber());
        existing.setPlaced(updated.isPlaced());
        existing.setCompanyName(updated.getCompanyName());
        existing.setOfferType(updated.getOfferType());
        existing.setPackageLpa(updated.getPackageLpa());
        existing.setPhoneNumber(updated.getPhoneNumber());

        if (updated.getPhotoUrl() != null && !updated.getPhotoUrl().isEmpty()) {
            existing.setPhotoUrl(updated.getPhotoUrl());
        }

        return studentRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public String storePhoto(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return "/uploads/photos/" + fileName;
    }
}
