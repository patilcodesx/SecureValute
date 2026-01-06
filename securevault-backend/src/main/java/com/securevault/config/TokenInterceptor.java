package com.securevault.config;

import com.securevault.model.User;
import com.securevault.service.SessionService;
import com.securevault.service.UserService;
import com.securevault.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

public class TokenInterceptor implements HandlerInterceptor {

    private final UserService userService;
    private final SessionService sessionService;
    private final JwtUtil jwtUtil;

    public TokenInterceptor(UserService userService,
                            SessionService sessionService,
                            JwtUtil jwtUtil) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // ✅ ALLOW CORS PREFLIGHT
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // ✅ ALLOW AUTH ENDPOINTS
        String uri = request.getRequestURI();
        if (uri.startsWith("/api/auth")) {
            return true;
        }

        // 🔐 CHECK JWT
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return reject(response, "Missing token");
        }

        String token = auth.substring(7).trim();

        if (!jwtUtil.validateToken(token)) {
            return reject(response, "Invalid or expired token");
        }

        String email = jwtUtil.getEmailFromToken(token);
        Optional<User> userOpt = userService.findByEmail(email);

        if (userOpt.isEmpty()) {
            return reject(response, "User not found");
        }

        // ✅ ATTACH USER TO REQUEST
        User user = userOpt.get();
        request.setAttribute("currentUser", user);

        // ✅ UPDATE SESSION ACTIVITY
        sessionService.findByToken(token)
                .ifPresent(sessionService::refreshLastActive);

        return true;
    }

    private boolean reject(HttpServletResponse res, String msg) throws Exception {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("""
            {
              "success": false,
              "message": "%s"
            }
            """.formatted(msg));
        return false;
    }
}

