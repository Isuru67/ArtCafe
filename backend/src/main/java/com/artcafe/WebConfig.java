package com.artcafe;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to upload directory
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        
        System.out.println("Configuring image path mapping. Upload dir: " + uploadAbsolutePath);

        // Map /images/posts/** to the uploads/posts directory
        registry.addResourceHandler("/images/posts/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/posts/");
                
        // Map /images/profile/** to the uploads/profile directory
        registry.addResourceHandler("/images/profile/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/profile/");
    }
}
