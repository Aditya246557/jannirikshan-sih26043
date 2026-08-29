package com.adhikar.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file is required"
            );
        }

        try {
            Map<?, ?> result =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    "adhikar-ai/complaints",
                                    "resource_type",
                                    "image"
                            )
                    );

            if (result != null && result.get("secure_url") != null) {
                return result.get("secure_url").toString();
            }
        } catch (Exception e) {
            System.err.println("Cloudinary upload notice: " + e.getMessage() + ". Using Data URL encoding fallback.");
        }

        // Fail-safe Fallback: Convert to Base64 Data URL so photo upload NEVER fails!
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + contentType + ";base64," + base64;
    }
}