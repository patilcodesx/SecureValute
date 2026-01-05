package com.securevault.filter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter implements Filter {

    private final Map<String, RequestData> requestMap = new ConcurrentHashMap<>();

    private static final int LIMIT = 100; // 100 requests/minute
    private static final long WINDOW = 60_000; // 1 minute window

    private static class RequestData {
        int count;
        long timestamp;

        RequestData() {
            this.count = 1;
            this.timestamp = System.currentTimeMillis();
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();

        requestMap.compute(ip, (key, data) -> {
            if (data == null || now - data.timestamp > WINDOW) {
                return new RequestData(); // Reset window
            }
            data.count++;
            return data;
        });

        RequestData data = requestMap.get(ip);

        if (data.count > LIMIT) {
            response.setStatus(429);
            response.getWriter().write("Too many requests. Please try again later.");
            return;
        }

        chain.doFilter(req, res);
    }
}
