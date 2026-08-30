package com.jannirikshan.config;

import com.jannirikshan.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(
            CorsConfigurationSource corsConfigurationSource,
            JwtAuthFilter jwtAuthFilter) {

        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource
                        )
                )

                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =====================================
                        // PUBLIC ENDPOINTS
                        // =====================================

                        .requestMatchers(
                                "/auth/**",
                                "/actuator/**",
                                "/error",
                                "/files/**",
                                "/uploads/**",
                                "/complaints/explore",
                                "/complaints/public",
                                "/complaints/validate-image",
                                "/impact/summary",
                                "/analytics/overview",
                                "/ai/**"
                        ).permitAll()

                        // =====================================
                        // ROLE-BASED ACCESS CONTROL
                        // =====================================
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/audit/**").hasRole("ADMIN")
                        .requestMatchers("/government/**").hasAnyRole("GOVERNMENT", "ADMIN")
                        .requestMatchers("/university/challenges/**").hasAnyRole("UNIVERSITY", "ADMIN")
                        .requestMatchers("/industry/partnerships/express-interest").hasAnyRole("INDUSTRY", "ADMIN")

                        // =====================================
                        // ALL OTHER APIs REQUIRE JWT
                        // =====================================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}