package com.securevault.controller;

import com.securevault.model.Note;
import com.securevault.model.User;
import com.securevault.repository.NoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository repo;

    public NoteController(NoteRepository repo) {
        this.repo = repo;
    }

    // -----------------------------------------------------
    // GET ALL NOTES FOR LOGGED-IN USER
    // -----------------------------------------------------
    @GetMapping
    public ResponseEntity<List<Note>> listNotes(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        return ResponseEntity.ok(repo.findByOwnerId(user.getId()));
    }

    // -----------------------------------------------------
    // GET SINGLE NOTE
    // -----------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getNote(@PathVariable Long id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");

        Optional<Note> note = repo.findById(id);
        if (note.isEmpty() || !note.get().getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Note not found");
        }

        return ResponseEntity.ok(note.get());
    }

    // -----------------------------------------------------
    // CREATE NOTE
    // -----------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody Note incoming, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");

        Note note = new Note();
        note.setOwnerId(user.getId());
        note.setTitle(incoming.getTitle());
        note.setEncryptedContent(incoming.getEncryptedContent());
        note.setIv(incoming.getIv());
        note.setTags(incoming.getTags() == null ? "[]" : incoming.getTags());
        note.setCreatedAt(Instant.now());
        note.setUpdatedAt(Instant.now());

        Note saved = repo.save(note);
        return ResponseEntity.ok(saved);
    }

    // -----------------------------------------------------
    // UPDATE NOTE
    // -----------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id, @RequestBody Note incoming, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");

        Note existing = repo.findById(id).orElse(null);
        if (existing == null || !existing.getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Note not found");
        }

        existing.setTitle(incoming.getTitle());
        existing.setEncryptedContent(incoming.getEncryptedContent());
        existing.setIv(incoming.getIv());
        existing.setTags(incoming.getTags() == null ? "[]" : incoming.getTags());
        existing.setUpdatedAt(Instant.now());

        Note saved = repo.save(existing);
        return ResponseEntity.ok(saved);
    }

    // -----------------------------------------------------
    // DELETE NOTE
    // -----------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");

        Note note = repo.findById(id).orElse(null);
        if (note == null || !note.getOwnerId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Note not found");
        }

        repo.delete(note);
        return ResponseEntity.ok("{\"success\": true}");
    }
}
