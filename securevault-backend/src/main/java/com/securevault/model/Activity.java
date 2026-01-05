package com.securevault.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "activity_log")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String action;      // "login", "file_upload" etc.
    private String details;     // description: "Uploaded file abc.pdf"
    private String severity;    // info | warning | critical

    private Instant timestamp;
}
