package com.example.projeto2.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_vendas")
@Getter @Setter @NoArgsConstructor
public class ItemVenda {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonBackReference @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "venda_id", nullable = false)
    private Venda venda;
    @NotNull @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "produto_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Produto produto;
    @NotNull @Min(1) @Column(nullable = false)
    private Integer quantidade;
    @NotNull @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUnitario;
    @NotNull @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}
