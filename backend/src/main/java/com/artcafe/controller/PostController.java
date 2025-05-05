package com.artcafe.controller;

import com.artcafe.dto.PostDto;
import com.artcafe.dto.UserDto;
import com.artcafe.model.Like;
import com.artcafe.model.Notification;
import com.artcafe.model.Post;
import com.artcafe.model.User;
import com.artcafe.repository.CommentRepository;
import com.artcafe.repository.LikeRepository;
import com.artcafe.repository.NotificationRepository;
import com.artcafe.repository.PostRepository;
import com.artcafe.repository.UserRepository;
import com.artcafe.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationController notificationController;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Post> postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        
        List<PostDto> posts = postPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts);
        response.put("currentPage", postPage.getNumber());
        response.put("totalItems", postPage.getTotalElements());
        response.put("totalPages", postPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get posts by username
     */
    @GetMapping("/byUsername/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getPostsByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByUserId(user.getId(), pageable);
        
        List<PostDto> posts = postPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts);
        response.put("currentPage", postPage.getNumber());
        response.put("totalItems", postPage.getTotalElements());
        response.put("totalPages", postPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> getPostById(@PathVariable String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        return ResponseEntity.ok(convertToDto(post));
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCreatedAt(LocalDateTime.now());
        post.setUser(user);
        post.setUserId(user.getId());
        
        // Process and save the image if provided
        if (image != null && !image.isEmpty()) {
            try {
                // Generate a unique filename to prevent collisions
                String originalFilename = image.getOriginalFilename();
                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                
                // Create directory if it doesn't exist
                Path uploadPath = Paths.get(uploadDir).resolve("posts");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                // Save file to filesystem
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(image.getInputStream(), filePath);
                
                // Store the image URL and name in the database - use consistent path format
                // Include a debug log to see what paths are being stored
                String imageUrl = "/images/posts/" + uniqueFilename;
                System.out.println("Storing image URL in database: " + imageUrl);
                post.setImageUrl(imageUrl);
                post.setImageName(originalFilename);
                
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing image: " + e.getMessage());
            }
        }
        
        Post savedPost = postRepository.save(post);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedPost));
    }
    
    // Keep the existing createPost method for backward compatibility
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto postDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCreatedAt(LocalDateTime.now());
        post.setUser(user);
        post.setUserId(user.getId());
        post.setImageUrl(postDto.getImageUrl());
        post.setImageName(postDto.getImageName());
        
        Post savedPost = postRepository.save(post);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedPost));
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> updatePost(@PathVariable String id, @RequestBody PostDto postDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getUser().getId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this post");
        }
        
        // Only update title and content, ignore any image-related fields
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        
        Post updatedPost = postRepository.save(post);
        
        return ResponseEntity.ok(convertToDto(updatedPost));
    }
    
    // Keep this method signature for backward compatibility but ensure it also only updates 
    // title and content, explicitly ignoring any attempt to modify the image
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> updatePostWithImage(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam("content") String content) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getUser().getId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this post");
        }
        
        // Only update title and content
        post.setTitle(title);
        post.setContent(content);
        post.setUpdatedAt(LocalDateTime.now());
        
        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(convertToDto(updatedPost));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getUser().getId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this post");
        }
        
        postRepository.delete(post);
        
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }
    
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleLike(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        boolean liked = likeRepository.existsByPostIdAndUserId(id, userDetails.getId());
        Map<String, Object> response = new HashMap<>();
        
        if (liked) {
            // Unlike the post
            likeRepository.deleteByPostIdAndUserId(id, userDetails.getId());
            post.decrementLikeCount();
            response.put("liked", false);
            response.put("message", "Post unliked successfully");
        } else {
            // Like the post
            Like like = new Like();
            like.setPostId(post.getId());
            like.setUser(user);
            like.setUserId(user.getId());
            like.setCreatedAt(LocalDateTime.now());
            
            likeRepository.save(like);
            post.incrementLikeCount();
            response.put("liked", true);
            response.put("message", "Post liked successfully");
            
            // Create notification if the post isn't by the current user
            if (!post.getUserId().equals(userDetails.getId())) {
                // Check if a similar notification exists recently
                boolean notificationExists = notificationController.existsSimiarNotification(
                    post.getUserId(), user.getId(), "LIKE", post.getId());
                    
                if (!notificationExists) {
                    Notification notification = new Notification();
                    notification.setContent("<strong>" + user.getUsername() + "</strong> liked your post: <strong>" + truncateString(post.getTitle(), 30) + "</strong>");
                    notification.setLink("/posts/" + post.getId());
                    notification.setRecipientId(post.getUserId());
                    notification.setSender(user);
                    notification.setSenderId(user.getId());
                    notification.setType("LIKE");
                    notification.setReferenceId(post.getId());
                    
                    notificationRepository.save(notification);
                }
            }
        }
        
        // Update the post with the new like count
        postRepository.save(post);
        
        response.put("likeCount", post.getLikeCount());
        return ResponseEntity.ok(response);
    }
    
    // Helper method to truncate strings
    private String truncateString(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
    }
    
    private PostDto convertToDto(Post post) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setImageUrl(post.getImageUrl());
        dto.setImageName(post.getImageName()); // Include imageName in the DTO
        
        UserDto userDto = new UserDto();
        userDto.setId(post.getUser().getId());
        userDto.setUsername(post.getUser().getUsername());
        userDto.setFullName(post.getUser().getFullName());
        userDto.setProfilePicture(post.getUser().getProfilePicture());
        dto.setUser(userDto);
        
        dto.setCommentCount(post.getCommentCount());
        dto.setLikeCount(post.getLikeCount());
        
        // Check if current user liked this post
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            dto.setLikedByCurrentUser(likeRepository.existsByPostIdAndUserId(post.getId(), userDetails.getId()));
        } else {
            dto.setLikedByCurrentUser(false);
        }
        
        return dto;
    }
}
