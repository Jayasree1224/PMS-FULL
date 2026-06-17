package com.placement.pms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department; // CSE, IT, ECE, MECH, CIVIL, AIDS, etc.

    @Column(nullable = false)
    private String batch; // e.g. 2021-2025

    @Column(nullable = false)
    private String email;

    private String rollNumber;

    @Column(name = "is_placed")
    private boolean placed;

    private String companyName;

    private String offerType; // e.g. Full Time, Internship, Internship + FTE

    private Double packageLpa; // package in LPA

    private String photoUrl; // path/url of uploaded photo

    private String phoneNumber;
}
