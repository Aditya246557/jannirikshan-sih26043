package com.sih.sociosphere.file;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(
            FileStorageService fileStorageService) {

        this.fileStorageService = fileStorageService;
    }

    @GetMapping({
            "/complaints/{complaintId}/{fileName:.+}",
            "/complaint/{complaintId}/{fileName:.+}",
            "/{complaintId:[0-9]+}/{fileName:.+}"
    })
    public ResponseEntity<Resource> getFile(
            @PathVariable Long complaintId,
            @PathVariable String fileName) {

        try {

            // ==========================================
            // GET ACTUAL FILE PATH
            // ==========================================

            Path file =
                    fileStorageService.getFile(
                            complaintId,
                            fileName
                    );

            // ==========================================
            // CHECK FILE
            // ==========================================

            if (!Files.exists(file)) {

                System.out.println(
                        "Evidence file not found: "
                                + file.toAbsolutePath()
                );

                return ResponseEntity
                        .notFound()
                        .build();
            }

            if (!Files.isRegularFile(file)) {

                System.out.println(
                        "Evidence path is not a regular file: "
                                + file.toAbsolutePath()
                );

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // ==========================================
            // CREATE RESOURCE
            // ==========================================

            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );

            if (!resource.exists() ||
                    !resource.isReadable()) {

                System.out.println(
                        "Evidence file is not readable: "
                                + file.toAbsolutePath()
                );

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // ==========================================
            // DETERMINE CONTENT TYPE
            // ==========================================

            String contentType =
                    detectContentType(file);

            // ==========================================
            // RETURN FILE
            // ==========================================

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    file.getFileName() +
                                    "\""
                    )
                    .header(
                            HttpHeaders.CACHE_CONTROL,
                            "no-cache, no-store, must-revalidate"
                    )
                    .body(resource);

        } catch (Exception e) {

            System.out.println(
                    "Error serving evidence file: "
                            + e.getMessage()
            );

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // ==================================================
    // CONTENT TYPE
    // ==================================================

    private String detectContentType(Path file) {

        try {

            String detected =
                    Files.probeContentType(file);

            if (detected != null &&
                    !detected.isBlank()) {

                return detected;
            }

        } catch (Exception ignored) {
            // Fall back to extension below.
        }

        String name =
                file.getFileName()
                        .toString()
                        .toLowerCase(Locale.ROOT);

        if (name.endsWith(".png")) {
            return "image/png";
        }

        if (name.endsWith(".jpg") ||
                name.endsWith(".jpeg")) {

            return "image/jpeg";
        }

        if (name.endsWith(".webp")) {
            return "image/webp";
        }

        if (name.endsWith(".gif")) {
            return "image/gif";
        }

        if (name.endsWith(".mp4")) {
            return "video/mp4";
        }

        if (name.endsWith(".webm")) {
            return "video/webm";
        }

        if (name.endsWith(".mov")) {
            return "video/quicktime";
        }

        if (name.endsWith(".pdf")) {
            return "application/pdf";
        }

        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}