package com.securevault.repository;

import com.securevault.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // ❌ REMOVE THIS (OLD SYSTEM)
    // Optional<User> findByAuthToken(String authToken);
}
