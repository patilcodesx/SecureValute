package com.securevault.controller;

import com.securevault.model.ShareLink;
import com.securevault.repository.ShareRepository;
import com.securevault.repository.FileRepository;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final ShareRepository shareRepo;
    private final FileRepository fileRepo;

    public ShareController(ShareRepository shareRepo, FileRepository fileRepo) {
        this.shareRepo = shareRepo;
        this.fileRepo = fileRepo;
    }

    @PostMapping("/create")
    public ShareLink createShare(@RequestBody ShareRequest req) {

        if (!fileRepo.existsById(req.fileId())) {
            throw new RuntimeException("File not found");
        }

        ShareLink link = new ShareLink();
        link.setFileId(req.fileId());
        link.setToken(UUID.randomUUID().toString().replace("-", ""));
        link.setCreatedAt(Instant.now());

        Instant exp = Instant.now().plusSeconds(req.expiresInHours() * 3600L);
        link.setExpiresAt(exp);

        link.setMaxOpens(req.maxOpens());
        link.setPassword(req.password());

        return shareRepo.save(link);
    }

    @GetMapping("/{token}")
    public Map<String, Object> open(
            @PathVariable String token,
            @RequestParam(value = "password", required = false) String password
    ) {

        ShareLink link = shareRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid link"));

        if (link.getExpiresAt() != null && Instant.now().isAfter(link.getExpiresAt())) {
            throw new RuntimeException("Link expired");
        }

        if (link.getMaxOpens() != null && link.getOpens() >= link.getMaxOpens()) {
            throw new RuntimeException("Max opens reached");
        }

        if (link.getPassword() != null && !link.getPassword().isEmpty()) {
            if (password == null || !password.equals(link.getPassword())) {
                return Map.of(
                        "passwordRequired", true,
                        "message", "Password required"
                );
            }
        }

        var file = fileRepo.findById(link.getFileId())
                .orElseThrow(() -> new RuntimeException("File not found"));

        link.setOpens(link.getOpens() + 1);
        shareRepo.save(link);

        // ❗ Map.of → REPLACE WITH HashMap
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("passwordRequired", false);
        result.put("fileId", file.getId());
        result.put("fileName", file.getName());
        result.put("size", file.getSize());
        result.put("type", file.getType());
        result.put("encryptedData", file.getEncryptedData());
        result.put("iv", file.getIv());
        result.put("encryptionKey", file.getEncryptionKey());
        result.put("token", link.getToken());

        return result;
    }

}
