package com.securevault.controller;

import com.securevault.model.PasswordEntry;
import com.securevault.model.User;
import com.securevault.repository.PasswordRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/passwords")
public class PasswordController {

    private final PasswordRepository repo;

    public PasswordController(PasswordRepository repo) {
        this.repo = repo;
    }

    // -----------------------------------------------------
    // LIST ALL PASSWORDS FOR LOGGED-IN USER
    // -----------------------------------------------------
    @GetMapping
    public ResponseEntity<List<PasswordEntry>> list(HttpServletRequest request) {

        User user = (User) request.getAttribute("currentUser");

        return ResponseEntity.ok(
                repo.findByOwnerId(user.getId())
        );
    }

    // -----------------------------------------------------
    // GET SINGLE PASSWORD ENTRY
    // -----------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id, HttpServletRequest request) {

        User user = (User) request.getAttribute("currentUser");

        Optional<PasswordEntry> entry = repo.findById(id);

        if (entry.isEmpty() || !entry.get().getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Password not found");
        }

        return ResponseEntity.ok(entry.get());
    }

    // -----------------------------------------------------
    // CREATE PASSWORD ENTRY
    // -----------------------------------------------------
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PasswordEntry entry, HttpServletRequest request) {

        User user = (User) request.getAttribute("currentUser");

        PasswordEntry newEntry = new PasswordEntry();
        newEntry.setOwnerId(user.getId());
        newEntry.setTitle(entry.getTitle());
        newEntry.setUsername(entry.getUsername());
        newEntry.setUrl(entry.getUrl());
//        newEntry.setCategory(entry.getCategory());
        newEntry.setEncryptedPassword(entry.getEncryptedPassword());
        newEntry.setIv(entry.getIv());
        newEntry.setCreatedAt(Instant.now());
        newEntry.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(repo.save(newEntry));
    }

    // -----------------------------------------------------
    // UPDATE PASSWORD ENTRY (ADDED)
    // -----------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody PasswordEntry incoming,
            HttpServletRequest request
    ) {

        User user = (User) request.getAttribute("currentUser");

        PasswordEntry existing = repo.findById(id).orElse(null);

        if (existing == null || !existing.getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Password not found");
        }

        // Update fields
        existing.setTitle(incoming.getTitle());
        existing.setUsername(incoming.getUsername());
        existing.setUrl(incoming.getUrl());
//        existing.setCategory(incoming.getCategory());
        existing.setEncryptedPassword(incoming.getEncryptedPassword());
        existing.setIv(incoming.getIv());
        existing.setUpdatedAt(Instant.now());

        PasswordEntry saved = repo.save(existing);
        return ResponseEntity.ok(saved);
    }

    // -----------------------------------------------------
    // DELETE PASSWORD ENTRY
    // -----------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {

        User user = (User) request.getAttribute("currentUser");

        PasswordEntry entry = repo.findById(id).orElse(null);

        if (entry == null || !entry.getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Password not found");
        }

        repo.delete(entry);
        return ResponseEntity.ok("{\"success\": true}");
    }
}
