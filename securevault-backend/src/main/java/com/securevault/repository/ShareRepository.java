package com.securevault.repository;

import com.securevault.model.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShareRepository extends JpaRepository<ShareLink, Long> {
    Optional<ShareLink> findByToken(String token);
}
