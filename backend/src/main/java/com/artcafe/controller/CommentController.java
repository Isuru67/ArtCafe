package com.artcafe.controller;

import com.artcafe.dto.CommentDto;
import com.artcafe.dto.UserDto;
import com.artcafe.model.Comment;
import com.artcafe.model.Post;
import com.artcafe.model.User;
import com.artcafe.repository.CommentRepository;
import com.artcafe.repository.PostRepository;
import com.artcafe.repository.UserRepository;
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
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCommentsByPostId(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Verify the post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Comment> commentPage = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        
        List<CommentDto> comments = commentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("comments", comments);
        response.put("currentPage", commentPage.getNumber());
        response.put("totalItems", commentPage.getTotalElements());
        response.put("totalPages", commentPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> createComment(
            @PathVariable String postId,
            @RequestBody CommentDto commentDto) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setPostId(postId);
        comment.setUser(user);
        comment.setUserId(user.getId());
        
        Comment savedComment = commentRepository.save(comment);
        
        // Increment comment count on the post
        post.incrementCommentCount();
        postRepository.save(post);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedComment));
    }
    
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody CommentDto commentDto) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        
        if (!comment.getPostId().equals(postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to the specified post");
        }
        
        if (!comment.getUserId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this comment");
        }
        
        comment.setContent(commentDto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        
        Comment updatedComment = commentRepository.save(comment);
        
        return ResponseEntity.ok(convertToDto(updatedComment));
    }
    
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        
        if (!comment.getPostId().equals(postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to the specified post");
        }
        
        if (!comment.getUserId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this comment");
        }
        
        commentRepository.delete(comment);
        
        // Decrement comment count on the post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        post.decrementCommentCount();
        postRepository.save(post);
        
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
    
    private CommentDto convertToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setPostId(comment.getPostId());
        
        UserDto userDto = new UserDto();
        userDto.setId(comment.getUser().getId());
        userDto.setUsername(comment.getUser().getUsername());
        userDto.setFullName(comment.getUser().getFullName());
        userDto.setProfilePicture(comment.getUser().getProfilePicture());
        dto.setUser(userDto);
        
        return dto;
    }
}
