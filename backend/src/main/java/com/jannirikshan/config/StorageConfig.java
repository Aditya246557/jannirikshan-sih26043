package com.jannirikshan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StorageConfig {

    public StorageConfig(
            @Value("${app.file.upload-dir:uploads/complaints}")
            String uploadDirectory) {

        Path uploadPath =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not create upload directory: "
                            + uploadPath,
                    e
            );
        }
    }
}