package com.securevault.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fileId;

    private String token;

    private Instant createdAt;

    private Instant expiresAt;

    private Integer maxOpens;

    private Integer opens = 0;

    private String password;
}
