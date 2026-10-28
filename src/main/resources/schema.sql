-- Estruturas adicionadas pelo VendaFlow ao projeto Spring original.
-- IF NOT EXISTS preserva os dados e permite iniciar em bancos já utilizados.
CREATE TABLE IF NOT EXISTS vendas (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    usuario_id BIGINT,
    data_venda TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES tb_clientes (id),
    CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES tb_usuarios (id)
);

CREATE TABLE IF NOT EXISTS itens_vendas (
    id BIGSERIAL PRIMARY KEY,
    venda_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_itens_vendas_venda FOREIGN KEY (venda_id) REFERENCES vendas (id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_vendas_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos (id)
);

CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas (status);
CREATE INDEX IF NOT EXISTS idx_itens_vendas_venda ON itens_vendas (venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_vendas_produto ON itens_vendas (produto_id);
