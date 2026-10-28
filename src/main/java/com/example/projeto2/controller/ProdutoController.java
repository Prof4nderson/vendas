package com.example.projeto2.controller;

import com.example.projeto2.model.Produto;
import com.example.projeto2.service.CadastroServices;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
    private final CadastroServices service;
    public ProdutoController(CadastroServices service) { this.service = service; }
    @GetMapping public List<Produto> listar() { return service.listarProdutos(); }
    @GetMapping("/{id}") public ResponseEntity<Produto> buscar(@PathVariable Long id) { try { return ResponseEntity.ok(service.buscarProduto(id)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Produto criar(@Valid @RequestBody Produto produto) { return service.salvarProduto(produto); }
    @PutMapping("/{id}") public ResponseEntity<Produto> atualizar(@PathVariable Long id, @Valid @RequestBody Produto input) { try { Produto produto = service.buscarProduto(id); produto.setNome(input.getNome()); produto.setFabricante(input.getFabricante()); produto.setValor(input.getValor()); return ResponseEntity.ok(service.salvarProduto(produto)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deletar(@PathVariable Long id) { try { service.excluirProduto(id); return ResponseEntity.noContent().build(); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
}
