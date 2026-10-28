package com.example.projeto2.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tb_usuarios")
@Getter @Setter @NoArgsConstructor
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max = 100) @Column(nullable = false, length = 100)
    private String nome;
    @NotBlank @CPF @Size(min = 11, max = 11) @Column(nullable = false, unique = true, length = 11)
    private String cpf;
    @NotBlank @Size(max = 50) @Column(nullable = false, unique = true, length = 50)
    private String login;
    @NotBlank @Size(min = 4, max = 255) @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) @Column(nullable = false)
    private String senha;
    @NotBlank @Email @Column(nullable = false, unique = true)
    private String email;
}
