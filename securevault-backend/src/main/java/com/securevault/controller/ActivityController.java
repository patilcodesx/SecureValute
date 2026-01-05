package com.securevault.controller;

import com.securevault.model.Activity;
import com.securevault.model.User;
import com.securevault.service.ActivityService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "*")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getMyActivity(HttpServletRequest req) {
        User user = (User) req.getAttribute("currentUser");
        return ResponseEntity.ok(activityService.getUserActivity(user.getId()));
    }
}
