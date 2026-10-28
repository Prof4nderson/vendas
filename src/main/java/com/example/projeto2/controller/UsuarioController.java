package com.example.projeto2.controller;

import com.example.projeto2.model.Usuario;
import com.example.projeto2.repository.UsuarioRepository;
import com.example.projeto2.service.CadastroServices;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final CadastroServices service; private final UsuarioRepository repository;
    public UsuarioController(CadastroServices service, UsuarioRepository repository) { this.service = service; this.repository = repository; }
    @GetMapping public List<Usuario> listar() { return service.listarUsuarios(); }
    @GetMapping("/{id}") public ResponseEntity<Usuario> buscar(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Usuario criar(@Valid @RequestBody Usuario usuario) { return service.salvarUsuario(usuario); }
    @PutMapping("/{id}") public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario input) { return repository.findById(id).map(usuario -> { usuario.setNome(input.getNome()); usuario.setCpf(input.getCpf()); usuario.setLogin(input.getLogin()); usuario.setEmail(input.getEmail()); if (input.getSenha() != null && !input.getSenha().isBlank()) usuario.setSenha(input.getSenha()); return ResponseEntity.ok(service.salvarUsuario(usuario)); }).orElse(ResponseEntity.notFound().build()); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deletar(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); service.excluirUsuario(id); return ResponseEntity.noContent().build(); }
}
