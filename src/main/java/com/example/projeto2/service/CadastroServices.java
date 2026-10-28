package com.example.projeto2.service;

import com.example.projeto2.model.Cliente;
import com.example.projeto2.model.Produto;
import com.example.projeto2.model.Usuario;
import com.example.projeto2.repository.ClienteRepository;
import com.example.projeto2.repository.ProdutoRepository;
import com.example.projeto2.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CadastroServices {
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final PasswordEncoder passwordEncoder;

    public CadastroServices(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository, ProdutoRepository produtoRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public List<Usuario> listarUsuarios() { return usuarioRepository.findAll(); }
    public Usuario buscarUsuario(Long id) { return usuarioRepository.findById(id).orElseThrow(); }
    public Usuario salvarUsuario(Usuario input) { if (input.getId() == null || input.getSenha() == null || input.getSenha().isBlank()) input.setSenha(passwordEncoder.encode(input.getSenha() == null ? "" : input.getSenha())); else if (!input.getSenha().startsWith("$2a$")) input.setSenha(passwordEncoder.encode(input.getSenha())); return usuarioRepository.save(input); }
    public void excluirUsuario(Long id) { usuarioRepository.deleteById(id); }
    public List<Cliente> listarClientes() { return clienteRepository.findAll(); }
    public Cliente buscarCliente(Long id) { return clienteRepository.findById(id).orElseThrow(); }
    public Cliente salvarCliente(Cliente input) { return clienteRepository.save(input); }
    public void excluirCliente(Long id) { clienteRepository.deleteById(id); }
    public List<Produto> listarProdutos() { return produtoRepository.findAll(); }
    public Produto buscarProduto(Long id) { return produtoRepository.findById(id).orElseThrow(); }
    public Produto salvarProduto(Produto input) { return produtoRepository.save(input); }
    public void excluirProduto(Long id) { produtoRepository.deleteById(id); }
}
