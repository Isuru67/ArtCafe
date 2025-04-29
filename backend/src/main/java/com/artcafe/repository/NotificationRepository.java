package com.artcafe.repository;

import com.artcafe.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);
    Page<Notification> findByRecipientIdAndReadFalse(String recipientId, Pageable pageable);
    Page<Notification> findByRecipientIdAndReadTrue(String recipientId, Pageable pageable);
    long countByRecipientIdAndReadFalse(String recipientId);
    boolean existsBySenderIdAndRecipientIdAndTypeAndReferenceIdAndCreatedAtAfter(
        String senderId, String recipientId, String type, String referenceId, LocalDateTime after);
}
