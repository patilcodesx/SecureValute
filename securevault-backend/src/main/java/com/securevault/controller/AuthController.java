package com.securevault.controller;

import com.securevault.dto.*;
import com.securevault.model.User;
import com.securevault.service.SessionService;
import com.securevault.service.UserService;
import com.securevault.service.ActivityService;  // <-- ADDED
import com.securevault.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;
    private final JwtUtil jwtUtil;
    private final ActivityService activityService;   // <-- ADDED

    public AuthController(
            UserService userService,
            SessionService sessionService,
            JwtUtil jwtUtil,
            ActivityService activityService     // <-- ADDED
    ) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.jwtUtil = jwtUtil;
        this.activityService = activityService;   // <-- ADDED
    }

    // ---------------------------
    // REGISTER
    // ---------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getEmail() == null || req.getPassword() == null || req.getName() == null)
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Missing fields"));

        if (userService.findByEmail(req.getEmail()).isPresent())
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email already registered"));

        userService.register(req.getName(), req.getEmail(), req.getPassword());
        return ResponseEntity.ok(new ApiResponse(true, "User registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest http) {

        // STEP 1: Check if user exists
        Optional<User> userCheck = userService.findByEmail(req.getEmail());
        if (userCheck.isEmpty()) {
            return ResponseEntity.status(404).body(
                    new ApiResponse(false, "User not found")
            );
        }

        // STEP 2: Check password
        Optional<User> userOpt = userService.login(req.getEmail(), req.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(
                    new ApiResponse(false, "Invalid credentials")
            );
        }

        // STEP 3: Login success
        User user = userOpt.get();

        // Create JWT
        String jwt = jwtUtil.generateToken(user.getEmail());

        // Session tracking
        String userAgent = http.getHeader("User-Agent");
        String ip = http.getRemoteAddr();
        String device = userAgent != null && userAgent.toLowerCase().contains("mobi")
                ? "Mobile" : "Desktop";

        sessionService.createSession(
                user.getId(),
                jwt,
                userAgent,
                device,
                ip,
                true
        );

        // Activity log
        activityService.log(user.getId(), "login", "User logged in", "info");

        return ResponseEntity.ok(
                new AuthResponse(jwt, user.getEmail(), user.getName(), user.getRole())
        );
    }

    // ---------------------------
    // GET ALL USERS
    // ---------------------------
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    // ---------------------------
    // LOGOUT
    // ---------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestAttribute(name = "currentUser", required = false) User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Not logged in"));
        }

        userService.logout(currentUser);
        activityService.log(currentUser.getId(), "logout", "User logged out", "info");

        return ResponseEntity.ok(new ApiResponse(true, "Logged out"));
    }
}
