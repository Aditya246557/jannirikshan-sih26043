package com.sih.sociosphere.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(
            @Value("${app.file.upload-dir:uploads/complaints}")
            String uploadDir) {

        this.uploadRoot =
                Paths.get(uploadDir)
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to initialize upload directory.",
                    e
            );
        }
    }

    public String store(
            Long complaintId,
            MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Evidence file is empty."
            );
        }

        try {

            Path complaintDirectory =
                    uploadRoot
                            .resolve(String.valueOf(complaintId))
                            .normalize();

            Files.createDirectories(
                    complaintDirectory
            );

            String original =
                    file.getOriginalFilename();

            String extension =
                    getExtension(original);

            String generatedName =
                    UUID.randomUUID() + extension;

            Path target =
                    complaintDirectory
                            .resolve(generatedName)
                            .normalize();

            if (!target.startsWith(
                    complaintDirectory
            )) {
                throw new IllegalStateException(
                        "Invalid file path."
                );
            }

            try (InputStream input =
                         file.getInputStream()) {

                Files.copy(
                        input,
                        target,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            return generatedName;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Unable to store evidence file.",
                    e
            );
        }
    }

    public Path getFile(
            Long complaintId,
            String fileName) {

        if (fileName == null ||
                fileName.isBlank()) {

            throw new IllegalArgumentException(
                    "File name is required."
            );
        }

        Path directory =
                uploadRoot
                        .resolve(String.valueOf(complaintId))
                        .normalize();

        Path file =
                directory
                        .resolve(fileName)
                        .normalize();

        if (!file.startsWith(directory)) {
            throw new IllegalArgumentException(
                    "Invalid file path."
            );
        }

        return file;
    }

    public void delete(
            Long complaintId,
            String fileName) {

        try {

            Files.deleteIfExists(
                    getFile(
                            complaintId,
                            fileName
                    )
            );

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Unable to delete evidence file.",
                    e
            );
        }
    }

    private String getExtension(
            String fileName) {

        if (fileName == null ||
                fileName.isBlank()) {

            return "";
        }

        int index =
                fileName.lastIndexOf('.');

        if (index < 0) {
            return "";
        }

        String extension =
                fileName.substring(index)
                        .toLowerCase();

        if (extension.length() > 10) {
            return "";
        }

        return extension;
    }
}