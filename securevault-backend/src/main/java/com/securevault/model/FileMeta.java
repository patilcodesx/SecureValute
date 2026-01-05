package com.securevault.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
public class FileMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Secure ownership (never use email)
    private Long ownerId;

    private String name;
    private long size;
    private String type;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String encryptedData;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String iv;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String encryptionKey;

    private Instant uploadedAt;
}
