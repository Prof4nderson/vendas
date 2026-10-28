CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cpf` varchar(11) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`endereco` varchar(150) NOT NULL,
	`cep` varchar(8) NOT NULL,
	`cidade` varchar(80) NOT NULL,
	`uf` varchar(2) NOT NULL,
	`email` varchar(150) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `clientes_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `itens_vendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendaId` int NOT NULL,
	`produtoId` int NOT NULL,
	`quantidade` int NOT NULL,
	`valorUnitario` decimal(12,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	CONSTRAINT `itens_vendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(120) NOT NULL,
	`fabricante` varchar(80) NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cpf` varchar(11) NOT NULL,
	`login` varchar(50) NOT NULL,
	`senha` varchar(255) NOT NULL,
	`email` varchar(150) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `usuarios_login_unique` UNIQUE(`login`),
	CONSTRAINT `usuarios_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`usuarioId` int,
	`dataVenda` timestamp NOT NULL DEFAULT (now()),
	`status` enum('aberta','concluida','cancelada') NOT NULL DEFAULT 'aberta',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`observacoes` text,
	CONSTRAINT `vendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `itens_vendas_venda_idx` ON `itens_vendas` (`vendaId`);--> statement-breakpoint
CREATE INDEX `itens_vendas_produto_idx` ON `itens_vendas` (`produtoId`);--> statement-breakpoint
CREATE INDEX `vendas_cliente_idx` ON `vendas` (`clienteId`);--> statement-breakpoint
CREATE INDEX `vendas_status_idx` ON `vendas` (`status`);