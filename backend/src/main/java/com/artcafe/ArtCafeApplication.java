package com.artcafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;

import java.io.File;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@ComponentScan(basePackages = "com.artcafe")
public class ArtCafeApplication {

    public static void main(String[] args) {
        // Set DNS-related system properties before application starts
        System.setProperty("java.net.preferIPv4Stack", "true");
        System.setProperty("sun.net.spi.nameservice.provider.1", "dns,sun");
        System.setProperty("networkaddress.cache.ttl", "60");
        System.setProperty("jdk.internal.httpclient.disableHostnameVerification", "true");
        
        SpringApplication.run(ArtCafeApplication.class, args);
    }

    @Bean
    @Profile("!test")
    CommandLineRunner init(@org.springframework.beans.factory.annotation.Value("${file.upload-dir}") String uploadDir) {
        return args -> {
            // Create upload directories if they don't exist
            createDirectoryIfNotExists(uploadDir);
            createDirectoryIfNotExists(uploadDir + "/posts");
            createDirectoryIfNotExists(uploadDir + "/profile");
            System.out.println("Initialized upload directories at: " + uploadDir);
        };
    }
    
    private void createDirectoryIfNotExists(String path) {
        File directory = new File(path);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }
}
