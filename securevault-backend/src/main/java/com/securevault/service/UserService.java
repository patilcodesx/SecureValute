package com.securevault.service;

import com.securevault.model.User;
import com.securevault.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // REGISTER
    public User register(String name, String email, String plainPassword) {
        User u = new User();

        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(BCrypt.hashpw(plainPassword, BCrypt.gensalt()));
        u.setRole("user");

        return repo.save(u);
    }

    // LOGIN
    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = repo.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        boolean matches = BCrypt.checkpw(password, user.getPasswordHash());

        if (!matches) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            user.setLastFailedLoginAt(Instant.now());
            repo.save(user);
            return Optional.empty();
        }

        user.setFailedLoginAttempts(0);
        user.setLastFailedLoginAt(null);
        repo.save(user);

        return Optional.of(user);
    }

    // FIND USER BY EMAIL
    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    // ADMIN FEATURE
    public List<User> findAllUsers() {
        return repo.findAll();
    }

    // LOGOUT (JWT cannot be invalidated)
    public void logout(User user) {
        System.out.println("User logged out: " + user.getEmail());
    }
    
    
}
