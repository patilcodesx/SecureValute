package com.securevault.service;

import com.securevault.model.Session;
import com.securevault.repository.SessionRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository repo;

    public SessionService(SessionRepository repo) {
        this.repo = repo;
    }

    public Session createSession(Long userId, String token, String userAgent, String device, String ip, boolean isCurrent) {
        if (isCurrent) {
            List<Session> userSessions = repo.findByUserId(userId);
            for (Session s : userSessions) {
                if (Boolean.TRUE.equals(s.getCurrent())) {
                    s.setCurrent(false);
                }
            }
            repo.saveAll(userSessions);
        }

        Session s = new Session();
        s.setUserId(userId);
        s.setToken(token);
        s.setUserAgent(userAgent);
        s.setDevice(device);
        s.setIp(ip);
        s.setCurrent(isCurrent);
        s.setCreatedAt(Instant.now());
        s.setLastActive(Instant.now());

        return repo.save(s);
    }

    public List<Session> findByUserId(Long userId) {
        return repo.findByUserIdOrderByLastActiveDesc(userId);
    }

    public Optional<Session> findById(Long id) {
        return repo.findById(id);
    }

    /**
     * FIX: safely return only the newest session for a token.
     */
    public Optional<Session> findByToken(String token) {
        List<Session> sessions = repo.findByToken(token);
        if (sessions.isEmpty()) return Optional.empty();

        // choose latest lastActive → avoids non-unique exceptions
        return sessions.stream()
                .max(Comparator.comparing(Session::getLastActive));
    }

    @Transactional
    public void deleteSessionForUser(Long id, Long userId) {
        repo.deleteByIdAndUserId(id, userId);
    }

    public Session refreshLastActive(Session session) {
        session.setLastActive(Instant.now());
        return repo.save(session);
    }
}
