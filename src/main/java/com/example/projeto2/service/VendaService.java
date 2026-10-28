package com.example.projeto2.service;

import com.example.projeto2.model.Cliente;
import com.example.projeto2.model.ItemVenda;
import com.example.projeto2.model.Produto;
import com.example.projeto2.model.Usuario;
import com.example.projeto2.model.Venda;
import com.example.projeto2.repository.ClienteRepository;
import com.example.projeto2.repository.ProdutoRepository;
import com.example.projeto2.repository.UsuarioRepository;
import com.example.projeto2.repository.VendaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VendaService {
    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public VendaService(VendaRepository vendaRepository, ClienteRepository clienteRepository, ProdutoRepository produtoRepository, UsuarioRepository usuarioRepository) {
        this.vendaRepository = vendaRepository; this.clienteRepository = clienteRepository; this.produtoRepository = produtoRepository; this.usuarioRepository = usuarioRepository;
    }
    public List<Venda> listar() { return vendaRepository.findAll(); }
    public Venda buscar(Long id) { return vendaRepository.findById(id).orElseThrow(); }
    @Transactional
    public Venda salvar(Venda input) {
        Venda venda = input.getId() == null ? new Venda() : buscar(input.getId());
        Cliente cliente = clienteRepository.findById(input.getCliente().getId()).orElseThrow();
        venda.setCliente(cliente);
        if (input.getUsuario() != null && input.getUsuario().getId() != null) venda.setUsuario(usuarioRepository.findById(input.getUsuario().getId()).orElseThrow());
        venda.setStatus(input.getStatus() == null ? Venda.StatusVenda.ABERTA : input.getStatus());
        venda.setObservacoes(input.getObservacoes());
        if (venda.getDataVenda() == null) venda.setDataVenda(input.getDataVenda() == null ? LocalDateTime.now() : input.getDataVenda());
        venda.getItens().clear();
        BigDecimal total = BigDecimal.ZERO;
        if (input.getItens() != null) for (ItemVenda itemInput : input.getItens()) {
            Produto produto = produtoRepository.findById(itemInput.getProduto().getId()).orElseThrow();
            ItemVenda item = new ItemVenda(); item.setVenda(venda); item.setProduto(produto); item.setQuantidade(itemInput.getQuantidade());
            BigDecimal unitario = itemInput.getValorUnitario() == null ? produto.getValor() : itemInput.getValorUnitario();
            item.setValorUnitario(unitario); item.setSubtotal(unitario.multiply(BigDecimal.valueOf(item.getQuantidade()))); total = total.add(item.getSubtotal()); venda.getItens().add(item);
        }
        venda.setTotal(total); return vendaRepository.save(venda);
    }
    @Transactional public void excluir(Long id) { vendaRepository.deleteById(id); }
}
