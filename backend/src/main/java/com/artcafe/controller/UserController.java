package com.artcafe.controller;

import com.artcafe.dto.UserDto;
import com.artcafe.model.User;
import com.artcafe.repository.UserRepository;
import com.artcafe.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return ResponseEntity.ok(mapUserToDto(user));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return ResponseEntity.ok(mapUserToDto(user));
    }
    
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateUserProfile(@RequestBody UserDto userDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (userDto.getFullName() != null) {
            user.setFullName(userDto.getFullName());
        }
        
        if (userDto.getBio() != null) {
            user.setBio(userDto.getBio());
        }
        
        User updatedUser = userRepository.save(user);
        
        return ResponseEntity.ok(mapUserToDto(updatedUser));
    }
    
    @PostMapping("/profile/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir).resolve("profile");
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Delete old profile picture if exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                try {
                    String oldFileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                    Path oldFilePath = uploadPath.resolve(oldFileName);
                    Files.deleteIfExists(oldFilePath);
                } catch (Exception e) {
                    // Just log the error but continue with the update
                    System.err.println("Could not delete old profile picture: " + e.getMessage());
                }
            }
            
            user.setProfilePicture("/images/profile/" + fileName);
            User updatedUser = userRepository.save(user);
            
            return ResponseEntity.ok(mapUserToDto(updatedUser));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload file: " + e.getMessage());
        }
    }
    
    @PutMapping("/profile/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Validate current password
        if (!passwordEncoder.matches(passwordData.get("currentPassword"), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
        }
        
        // Update to new password
        String newPassword = passwordData.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New password must be at least 6 characters long"));
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
    
    @DeleteMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Delete profile picture if exists
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            try {
                String fileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDir).resolve("profile").resolve(fileName);
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                // Log the error but continue with the deletion
                System.err.println("Could not delete profile picture: " + e.getMessage());
            }
        }
        
        // Delete user account
        userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
    
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameAvailability(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        Map<String, Object> response = new HashMap<>();
        response.put("available", !exists);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        Map<String, Object> response = new HashMap<>();
        response.put("available", !exists);
        return ResponseEntity.ok(response);
    }
    
    private UserDto mapUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setBio(user.getBio());
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }
}
