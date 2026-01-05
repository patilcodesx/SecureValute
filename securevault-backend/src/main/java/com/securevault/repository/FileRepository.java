package com.securevault.repository;

import com.securevault.model.FileMeta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<FileMeta, Long> {

    // 🔥 Secure method: fetch by ownerId
    List<FileMeta> findByOwnerId(Long ownerId);
}
