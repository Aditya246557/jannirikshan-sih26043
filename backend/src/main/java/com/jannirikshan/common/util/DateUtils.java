package com.jannirikshan.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    public static String format(LocalDateTime time) {
        return time != null ? time.format(FORMATTER) : "";
    }
}