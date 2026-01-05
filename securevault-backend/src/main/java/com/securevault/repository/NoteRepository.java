package com.securevault.repository;

import com.securevault.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    // 🔐 secure: find notes by userId NOT email
    List<Note> findByOwnerId(Long ownerId);
}
