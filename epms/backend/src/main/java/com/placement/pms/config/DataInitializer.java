package com.placement.pms.config;

import com.placement.pms.model.Student;
import com.placement.pms.model.User;
import com.placement.pms.repository.StudentRepository;
import com.placement.pms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedStudents();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setDepartment(null);
            admin.setFullName("System Administrator");
            userRepository.save(admin);
        }

        createCoordinatorIfNotExists("coordinator_cse", "coord123", "CSE", "CSE Coordinator");
        createCoordinatorIfNotExists("coordinator_it", "coord123", "IT", "IT Coordinator");
        createCoordinatorIfNotExists("coordinator_ece", "coord123", "ECE", "ECE Coordinator");
        createCoordinatorIfNotExists("coordinator_mech", "coord123", "MECH", "MECH Coordinator");
        createCoordinatorIfNotExists("coordinator_civil", "coord123", "CIVIL", "CIVIL Coordinator");
        createCoordinatorIfNotExists("coordinator_aids", "coord123", "AIDS", "AIDS Coordinator");

        if (!userRepository.existsByUsername("student")) {
            User student = new User();
            student.setUsername("student");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole("STUDENT");
            student.setDepartment(null);
            student.setFullName("Demo Student (Read Only)");
            userRepository.save(student);
        }
    }

    private void createCoordinatorIfNotExists(String username, String rawPassword, String dept, String fullName) {
        if (!userRepository.existsByUsername(username)) {
            User coordinator = new User();
            coordinator.setUsername(username);
            coordinator.setPassword(passwordEncoder.encode(rawPassword));
            coordinator.setRole("COORDINATOR");
            coordinator.setDepartment(dept);
            coordinator.setFullName(fullName);
            userRepository.save(coordinator);
        }
    }

    private void seedStudents() {
        if (studentRepository.count() > 0) {
            return;
        }

        // CSE
        addStudent("Arun Kumar", "CSE", "2021-2025", "arun.kumar@example.com", "CSE001", true, "TCS", "Full Time", 4.5, "9876543210");
        addStudent("Priya Sharma", "CSE", "2021-2025", "priya.sharma@example.com", "CSE002", true, "Infosys", "Full Time", 5.2, "9876543211");
        addStudent("Karthik Raj", "CSE", "2021-2025", "karthik.raj@example.com", "CSE003", false, null, null, null, "9876543212");
        addStudent("Divya Lakshmi", "CSE", "2021-2025", "divya.lakshmi@example.com", "CSE004", true, "Wipro", "Full Time", 4.0, "9876543213");

        // IT
        addStudent("Sanjay Verma", "IT", "2021-2025", "sanjay.verma@example.com", "IT001", true, "Cognizant", "Full Time", 4.8, "9876543214");
        addStudent("Meena Iyer", "IT", "2021-2025", "meena.iyer@example.com", "IT002", true, "Accenture", "Internship + FTE", 6.0, "9876543215");
        addStudent("Ravi Teja", "IT", "2021-2025", "ravi.teja@example.com", "IT003", false, null, null, null, "9876543216");

        // ECE
        addStudent("Anitha Reddy", "ECE", "2021-2025", "anitha.reddy@example.com", "ECE001", true, "HCL Tech", "Full Time", 4.2, "9876543217");
        addStudent("Vignesh Babu", "ECE", "2021-2025", "vignesh.babu@example.com", "ECE002", false, null, null, null, "9876543218");
        addStudent("Lakshmi Narayanan", "ECE", "2021-2025", "lakshmi.narayanan@example.com", "ECE003", true, "Bosch", "Full Time", 5.5, "9876543219");

        // MECH
        addStudent("Mohan Das", "MECH", "2021-2025", "mohan.das@example.com", "MECH001", true, "Ashok Leyland", "Full Time", 3.8, "9876543220");
        addStudent("Suresh Kumar", "MECH", "2021-2025", "suresh.kumar@example.com", "MECH002", false, null, null, null, "9876543221");

        // CIVIL
        addStudent("Gowtham S", "CIVIL", "2021-2025", "gowtham.s@example.com", "CIVIL001", true, "L&T Construction", "Full Time", 4.0, "9876543222");
        addStudent("Pavithra M", "CIVIL", "2021-2025", "pavithra.m@example.com", "CIVIL002", false, null, null, null, "9876543223");

        // AIDS
        addStudent("Naveen Kumar", "AIDS", "2021-2025", "naveen.kumar@example.com", "AIDS001", true, "Zoho", "Full Time", 6.5, "9876543224");
        addStudent("Swetha R", "AIDS", "2021-2025", "swetha.r@example.com", "AIDS002", true, "Freshworks", "Full Time", 7.0, "9876543225");
        addStudent("Bharath Chandra", "AIDS", "2021-2025", "bharath.chandra@example.com", "AIDS003", false, null, null, null, "9876543226");
    }

    private void addStudent(String name, String dept, String batch, String email, String rollNumber,
                             boolean placed, String company, String offerType, Double pkg, String phone) {
        Student s = new Student();
        s.setName(name);
        s.setDepartment(dept);
        s.setBatch(batch);
        s.setEmail(email);
        s.setRollNumber(rollNumber);
        s.setPlaced(placed);
        s.setCompanyName(company);
        s.setOfferType(offerType);
        s.setPackageLpa(pkg);
        s.setPhoneNumber(phone);
        s.setPhotoUrl(null);
        studentRepository.save(s);
    }
}
