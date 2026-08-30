package com.jannirikshan.common.dto;

public record PaginationRequest(
        int page,
        int size,
        String sortBy,
        String direction
) {
    public PaginationRequest() {
        this(0, 10, "createdAt", "DESC");
    }
}