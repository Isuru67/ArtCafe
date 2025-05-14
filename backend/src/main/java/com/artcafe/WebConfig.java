package com.artcafe;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import javax.annotation.PostConstruct;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        // Set DNS-related system properties to help with MongoDB Atlas connection
        System.setProperty("java.net.preferIPv4Stack", "true");
        System.setProperty("sun.net.spi.nameservice.provider.1", "dns,sun");
        System.setProperty("networkaddress.cache.ttl", "60");
    }

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
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
