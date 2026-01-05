package com.securevault.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "password_entries")
public class PasswordEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔐 secure owner reference
    private Long ownerId;

    private String title;
    private String username;
    private String url;

    @Column(columnDefinition = "TEXT")
    private String encryptedPassword;

    private String iv;

    private Instant createdAt;
    private Instant updatedAt;

    // GETTERS + SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }


    public String getEncryptedPassword() { return encryptedPassword; }
    public void setEncryptedPassword(String encryptedPassword) { this.encryptedPassword = encryptedPassword; }

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
