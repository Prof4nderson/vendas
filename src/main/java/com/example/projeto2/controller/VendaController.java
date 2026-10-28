package com.example.projeto2.controller;

import com.example.projeto2.model.Venda;
import com.example.projeto2.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {
    private final VendaService service;
    public VendaController(VendaService service) { this.service = service; }
    @GetMapping public List<Venda> listar() { return service.listar(); }
    @GetMapping("/{id}") public ResponseEntity<Venda> buscar(@PathVariable Long id) { try { return ResponseEntity.ok(service.buscar(id)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Venda criar(@Valid @RequestBody Venda venda) { return service.salvar(venda); }
    @PutMapping("/{id}") public ResponseEntity<Venda> atualizar(@PathVariable Long id, @Valid @RequestBody Venda input) { try { input.setId(id); return ResponseEntity.ok(service.salvar(input)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deletar(@PathVariable Long id) { try { service.excluir(id); return ResponseEntity.noContent().build(); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
}
