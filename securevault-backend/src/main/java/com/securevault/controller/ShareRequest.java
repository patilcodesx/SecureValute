package com.securevault.controller;

public record ShareRequest(
        Long fileId,
        Integer expiresInHours,
        Integer maxOpens,
        String password
) {}
