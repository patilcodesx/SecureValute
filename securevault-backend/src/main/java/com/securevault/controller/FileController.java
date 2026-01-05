package com.securevault.controller;

import com.securevault.dto.ApiResponse;
import com.securevault.model.FileMeta;
import com.securevault.model.User;
import com.securevault.repository.FileRepository;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileRepository fileRepository;

    public FileController(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    // ======================================================
    // GET ALL PERSONAL FILES FOR LOGGED-IN USER
    // ======================================================
    @GetMapping
    public ResponseEntity<?> listFiles(HttpServletRequest request) {

        User user = (User) request.getAttribute("currentUser");

        return ResponseEntity.ok(
                fileRepository.findByOwnerId(user.getId())
        );
    }

    // ======================================================
    // DELETE FILE (ONLY IF OWNER)
    // ======================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        User user = (User) request.getAttribute("currentUser");

        FileMeta file = fileRepository.findById(id).orElse(null);
        if (file == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse(false, "File not found"));
        }

        // personal file -> must match ownerId
        if (!file.getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse(false, "You cannot delete this file"));
        }

        fileRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "File deleted"));
    }

    // ======================================================
    // UPLOAD PERSONAL FILE (NO TEAM SUPPORT)
    // ======================================================
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestBody FileMeta meta,
            HttpServletRequest request
    ) {
        User user = (User) request.getAttribute("currentUser");

        if (meta.getEncryptedData() == null || meta.getIv() == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Encrypted data or IV missing"));
        }

        // Always a personal file
        meta.setOwnerId(user.getId());
         // ensure no leftover team data
        meta.setUploadedAt(Instant.now());

        FileMeta saved = fileRepository.save(meta);

        return ResponseEntity.ok(
                new ApiResponse(true, "File uploaded", saved)
        );
    }
}
