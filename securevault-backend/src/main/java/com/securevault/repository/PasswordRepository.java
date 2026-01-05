package com.securevault.repository;

import com.securevault.model.PasswordEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PasswordRepository extends JpaRepository<PasswordEntry, Long> {
    List<PasswordEntry> findByOwnerId(Long ownerId);
}
