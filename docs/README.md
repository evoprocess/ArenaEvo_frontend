# Manuais externos ArenaEvo

Esta pasta reúne materiais de apresentação e uso destinados a organizações e
usuários da plataforma:

- `MAEXT-GERAL-ARENAEVO.pdf`: apresentação geral e guia de uso do ArenaEvo.

As fontes editáveis ficam em `fontes/`. O manual é genérico: nomes, cores,
modalidades e módulos visíveis podem variar conforme a organização e o perfil do
usuário. Não incluir credenciais, dados pessoais reais ou informações internas de
infraestrutura.

## Atualização

1. atualize versão, data e histórico na fonte HTML;
2. revise as funções realmente disponíveis para gerente, supervisor e cliente;
3. execute `powershell -ExecutionPolicy Bypass -File docs/gerar-pdfs.ps1` a partir
   da raiz do frontend;
4. confira capa, sumário, paginação, legibilidade e linguagem externa;
5. versione fonte, CSS, README, gerador e PDF no mesmo conjunto de mudanças.
