package com.example.projeto2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean WebMvcConfigurer corsConfigurer() { return new WebMvcConfigurer() {
        @Override public void addCorsMappings(CorsRegistry registry) { registry.addMapping("/api/**").allowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:*").allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS").allowedHeaders("*"); }
    }; }
}
