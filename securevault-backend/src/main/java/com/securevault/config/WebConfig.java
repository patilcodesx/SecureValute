package com.securevault.config;

import com.securevault.service.SessionService;
import com.securevault.service.UserService;
import com.securevault.util.JwtUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final UserService userService;
    private final SessionService sessionService;
    private final JwtUtil jwtUtil;

    public WebConfig(UserService userService, SessionService sessionService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(
                new TokenInterceptor(userService, sessionService, jwtUtil)
        )
        .addPathPatterns("/api/**")
        .excludePathPatterns(
                "/api/auth/**",
                "/error",
                "/actuator/**",
                "/api/share/**"
        );
    }
}
