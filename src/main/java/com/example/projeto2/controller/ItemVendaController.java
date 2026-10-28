package com.example.projeto2.controller;

import com.example.projeto2.model.ItemVenda;
import com.example.projeto2.repository.ItemVendaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/itens-vendas")
public class ItemVendaController {
    private final ItemVendaRepository repository;
    public ItemVendaController(ItemVendaRepository repository) { this.repository = repository; }
    @GetMapping public List<ItemVenda> listar(@RequestParam(required = false) Long vendaId) { return vendaId == null ? repository.findAll() : repository.findByVendaId(vendaId); }
    @GetMapping("/{id}") public ResponseEntity<ItemVenda> buscar(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
}
