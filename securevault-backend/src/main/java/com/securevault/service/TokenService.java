package com.securevault.service;

import com.securevault.model.User;
import com.securevault.util.JwtUtil;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final JwtUtil jwtUtil;

    public TokenService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Generate JWT token for a user.
     */
    public String generateJwt(User user) {
        return jwtUtil.generateToken(user.getEmail());
    }

    /**
     * Validate JWT token.
     */
    public boolean isJwtValid(String token) {
        return jwtUtil.validateToken(token);
    }

    /**
     * Extract email from JWT.
     */
    public String getEmail(String token) {
        return jwtUtil.getEmailFromToken(token);
    }
}
