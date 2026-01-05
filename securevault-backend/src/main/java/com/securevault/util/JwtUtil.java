package com.securevault.util;

import com.securevault.model.User;
import com.securevault.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${securevault.token.expiry-ms:0}")
    private long expirationMs;

    private final UserRepository userRepo;

    public JwtUtil(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // GENERATE TOKEN
    public String generateToken(String email) {
        if (expirationMs > 0) {
            return Jwts.builder()
                    .subject(email)
                    .expiration(new Date(System.currentTimeMillis() + expirationMs))
                    .signWith(getSigningKey())
                    .compact();
        }

        return Jwts.builder()
                .subject(email)
                .signWith(getSigningKey())
                .compact();
    }

    // VALIDATE TOKEN
    public boolean validateToken(String token) {
        try {
            token = cleanToken(token);
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            return false;
        } catch (Exception ex) {
            return false;
        }
    }

    // GET EMAIL
    public String getEmailFromToken(String token) {
        token = cleanToken(token);
        return parseClaims(token).getSubject();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Get userId (not mandatory)
    public Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;

        String token = authHeader.substring(7).trim();

        try {
            String email = getEmailFromToken(token);
            return userRepo.findByEmail(email)
                    .map(User::getId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // HELPERS
    private String cleanToken(String token) {
        if (token == null) return null;
        if (token.startsWith("Bearer ")) {
            return token.substring(7).trim();
        }
        return token.trim();
    }
}
