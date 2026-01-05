package com.securevault.controller;

import com.securevault.model.Session;
import com.securevault.model.User;
import com.securevault.service.SessionService;
import com.securevault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;

    public SessionController(SessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    // List sessions for current user
    @GetMapping
    public ResponseEntity<?> list(HttpServletRequest req) {
        User current = (User) req.getAttribute("currentUser");
        if (current == null) {
            return ResponseEntity.status(401).body("{\"message\":\"Not authenticated\"}");
        }

        List<Session> sessions = sessionService.findByUserId(current.getId());
        return ResponseEntity.ok(sessions);
    }

    // Terminate specific session (must belong to current user)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest req) {
        User current = (User) req.getAttribute("currentUser");
        if (current == null) {
            return ResponseEntity.status(401).body("{\"message\":\"Not authenticated\"}");
        }

        // check ownership
        return sessionService.findById(id)
                .map(s -> {
                    if (!s.getUserId().equals(current.getId())) {
                        return ResponseEntity.status(403).body("{\"message\":\"Not allowed\"}");
                    }
                    sessionService.deleteSessionForUser(id, current.getId());
                    return ResponseEntity.ok("{\"success\":true}");
                })
                .orElse(ResponseEntity.status(404).body("{\"message\":\"Not found\"}"));
    }
}
