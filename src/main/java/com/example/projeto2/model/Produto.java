package com.example.projeto2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_produtos")
@Getter @Setter @NoArgsConstructor
public class Produto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, length = 120)
    private String nome;
    @NotBlank @Column(nullable = false, unique = true, length = 80)
    private String fabricante;
    @DecimalMin(value = "0.01") @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;
    @Column(columnDefinition = "text")
    private String foto;
}
