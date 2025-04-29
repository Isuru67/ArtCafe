package com.artcafe.controller;

import com.artcafe.dto.NotificationDto;
import com.artcafe.dto.UserDto;
import com.artcafe.model.Notification;
import com.artcafe.repository.NotificationRepository;
import com.artcafe.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Notification> notificationPage = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                userId, pageable);
        
        List<NotificationDto> notifications = notificationPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        response.put("currentPage", notificationPage.getNumber());
        response.put("totalItems", notificationPage.getTotalElements());
        response.put("totalPages", notificationPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        long count = notificationRepository.countByRecipientIdAndReadFalse(userId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        // Ensure user can only mark their own notifications as read
        if (!notification.getRecipientId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this notification");
        }
        
        notification.setRead(true);
        notification = notificationRepository.save(notification);
        
        return ResponseEntity.ok(convertToDto(notification));
    }
    
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        Pageable pageable = PageRequest.of(0, 100); // Handle up to 100 unread notifications at once
        Page<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalse(userId, pageable);
        
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
    
    @DeleteMapping("/clear-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> clearReadNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        Pageable pageable = PageRequest.of(0, 500); // Handle up to 500 read notifications
        Page<Notification> readNotifications = notificationRepository.findByRecipientIdAndReadTrue(userId, pageable);
        
        for (Notification notification : readNotifications) {
            notificationRepository.delete(notification);
        }
        
        return ResponseEntity.ok(Map.of("message", "All read notifications cleared"));
    }
    
    // Check if a similar notification exists (to prevent duplicates)
    public boolean existsSimiarNotification(
            String recipientId, String senderId, String type, String referenceId) {
        
        // This gives a 5-minute window to avoid duplicate notifications
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        
        // Check if there's a similar notification in the last 5 minutes
        return notificationRepository.existsBySenderIdAndRecipientIdAndTypeAndReferenceIdAndCreatedAtAfter(
            senderId, recipientId, type, referenceId, fiveMinutesAgo);
    }
    
    private NotificationDto convertToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setContent(notification.getContent());
        dto.setLink(notification.getLink());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setType(notification.getType());
        dto.setReferenceId(notification.getReferenceId());
        
        if (notification.getSender() != null) {
            UserDto senderDto = new UserDto();
            senderDto.setId(notification.getSender().getId());
            senderDto.setUsername(notification.getSender().getUsername());
            senderDto.setFullName(notification.getSender().getFullName());
            senderDto.setProfilePicture(notification.getSender().getProfilePicture());
            dto.setSender(senderDto);
        }
        
        return dto;
    }
}
