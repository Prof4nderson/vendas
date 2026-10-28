package com.example.projeto2.controller;

import com.example.projeto2.model.Cliente;
import com.example.projeto2.service.CadastroServices;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final CadastroServices service;
    public ClienteController(CadastroServices service) { this.service = service; }
    @GetMapping public List<Cliente> listar() { return service.listarClientes(); }
    @GetMapping("/{id}") public ResponseEntity<Cliente> buscar(@PathVariable Long id) { try { return ResponseEntity.ok(service.buscarCliente(id)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Cliente criar(@Valid @RequestBody Cliente cliente) { return service.salvarCliente(cliente); }
    @PutMapping("/{id}") public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @Valid @RequestBody Cliente input) { try { Cliente cliente = service.buscarCliente(id); cliente.setNome(input.getNome()); cliente.setCpf(input.getCpf()); cliente.setTelefone(input.getTelefone()); cliente.setEndereco(input.getEndereco()); cliente.setCep(input.getCep()); cliente.setCidade(input.getCidade()); cliente.setUf(input.getUf()); cliente.setEmail(input.getEmail()); return ResponseEntity.ok(service.salvarCliente(cliente)); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deletar(@PathVariable Long id) { try { service.excluirCliente(id); return ResponseEntity.noContent().build(); } catch (RuntimeException ex) { return ResponseEntity.notFound().build(); } }
}
