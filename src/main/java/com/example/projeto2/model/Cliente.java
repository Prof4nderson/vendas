package com.example.projeto2.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tb_clientes")
@Getter @Setter @NoArgsConstructor
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max = 100) @Column(nullable = false, length = 100)
    private String nome;
    @NotBlank @CPF @Size(min = 11, max = 11) @Column(nullable = false, unique = true, length = 11)
    private String cpf;
    @NotBlank @Column(nullable = false, length = 20)
    private String telefone;
    @NotBlank @Column(nullable = false, length = 150)
    private String endereco;
    @NotBlank @Column(nullable = false, length = 8)
    private String cep;
    @NotBlank @Column(nullable = false, length = 80)
    private String cidade;
    @NotBlank @Size(min = 2, max = 2) @Column(nullable = false, length = 2)
    private String uf;
    @NotBlank @Email @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(columnDefinition = "text")
    private String foto;
}
