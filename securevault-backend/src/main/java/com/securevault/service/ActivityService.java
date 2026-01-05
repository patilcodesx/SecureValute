package com.securevault.service;

import com.securevault.model.Activity;
import com.securevault.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository repo;

    public ActivityService(ActivityRepository repo) {
        this.repo = repo;
    }

    public void log(Long userId, String action, String details, String severity) {
        Activity a = new Activity();
        a.setUserId(userId);
        a.setAction(action);
        a.setDetails(details);
        a.setSeverity(severity);
        a.setTimestamp(Instant.now());
        repo.save(a);
    }

    public List<Activity> getUserActivity(Long userId) {
        return repo.findByUserIdOrderByTimestampDesc(userId);
    }
}
