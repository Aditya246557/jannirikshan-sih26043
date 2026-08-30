package com.jannirikshan.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader.substring(7);

            try {

                if (jwtService.isTokenValid(token)) {

                    String username =
                            jwtService.extractUsername(token);

                    String role =
                            jwtService.extractRole(token);

                    if (username != null
                            && SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                        List<SimpleGrantedAuthority> authorities =
                                role == null
                                        ? List.of()
                                        : List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role
                                        )
                                );

                        UsernamePasswordAuthenticationToken
                                authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        authorities
                                );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(
                                        authentication
                                );
                    }
                }

            } catch (Exception ignored) {
                /*
                 * Invalid JWT:
                 * leave request unauthenticated.
                 * Spring Security will reject protected endpoints.
                 */
            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}