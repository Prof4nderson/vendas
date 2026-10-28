package com.example.projeto2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException ex) { return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now(), "status", 400, "error", "Validação inválida", "message", ex.getBindingResult().getFieldErrors().stream().findFirst().map(error -> error.getField() + ": " + error.getDefaultMessage()).orElse("Revise os campos enviados."))); }
    @ExceptionHandler(java.util.NoSuchElementException.class)
    ResponseEntity<?> notFound(java.util.NoSuchElementException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("timestamp", Instant.now(), "status", 404, "error", "Não encontrado")); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> generic(Exception ex) { return ResponseEntity.status(500).body(Map.of("timestamp", Instant.now(), "status", 500, "error", "Erro interno", "message", ex.getMessage() == null ? "Falha inesperada" : ex.getMessage())); }
}
