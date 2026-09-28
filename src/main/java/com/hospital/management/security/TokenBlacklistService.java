package com.hospital.management.security;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklisted = ConcurrentHashMap.newKeySet();

    public void blacklist(String token) {
        if (token != null && !token.isBlank()) {
            blacklisted.add(token);
        }
    }

    public boolean isBlacklisted(String token) {
        return token != null && blacklisted.contains(token);
    }
}
