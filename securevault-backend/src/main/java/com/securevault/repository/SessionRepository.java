package com.securevault.repository;

import com.securevault.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByUserId(Long userId);
    List<Session> findByUserIdOrderByLastActiveDesc(Long userId);

    // FIX: return all sessions matching token
    List<Session> findByToken(String token);

    void deleteByIdAndUserId(Long id, Long userId);
}
