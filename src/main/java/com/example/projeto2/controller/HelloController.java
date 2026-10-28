package com.example.projeto2.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HelloController {
    @GetMapping("/api/health") public Map<String, String> health() { return Map.of("status", "ok", "service", "vendaflow-backend"); }
    @GetMapping("/hello") public String hello() { return "API VendaFlow Spring Boot funcionando"; }
}
