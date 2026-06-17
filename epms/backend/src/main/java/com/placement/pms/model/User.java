package com.placement.pms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt encoded

    @Column(nullable = false)
    private String role; // ADMIN, COORDINATOR, STUDENT

    private String department; // applicable for coordinator/student (CSE, IT, ECE, MECH, CIVIL, AIDS)

    private String fullName;
}
