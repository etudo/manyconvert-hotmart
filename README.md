# ManyConvert — Landing multi-nicho + Afiliados Hotmart

Landing page da ManyConvert com proposta ampliada para qualquer segmento, não só e-commerce. Tem também uma seção completa para o programa de afiliados com comissão recorrente pela Hotmart.

Site estático: HTML, CSS e JavaScript puros, sem build e sem dependências.

## Estrutura

```
index.html                  página completa
assets/css/style.css        estilos, animações e regras responsivas
assets/js/main.js           interações (conversa animada, segmentos, simulador, parallax)
assets/img/                 logomarca oficial e as fotos (.webp)
tools/gerar-fotos.py        gera e entrega as fotos
```

## Fotos

As fotos de segmento e do afiliado são geradas com o Gemini (Nano Banana Pro,
`gemini-3-pro-image-preview`) na proporção 4:5 em 2K (1856x2304) e entregues em
WebP 1200x1500 qualidade 85, que é o tamanho de exibição em tela retina.

```bash
python3 tools/gerar-fotos.py                # gera e entrega as que faltam
python3 tools/gerar-fotos.py saude          # só uma cena
python3 tools/gerar-fotos.py --so-webp      # reprocessa sem chamar a API
```

Os prompts de cada cena estão em `tools/gerar-fotos.py`. A chave `GEMINI_API_KEY`
é lida do `.env` do perfil. Os masters ficam em `~/.cache/mc-landing-fotos` e não
entram no repositório. Cada imagem gerada custa cerca de US$ 0,13.

Dois cuidados que vêm da prática: a tela do celular entra sempre em ângulo e fora
de foco (de frente, o modelo inventa texto ilegível) e logomarca nunca vai no
prompt (o modelo desenha uma logo falsa, e a oficial entra depois por código).

## Rodar localmente

Abra o `index.html` no navegador ou sirva a pasta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicar

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)`.
- **Netlify ou Vercel:** importe o repositório. Não há comando de build; o diretório de publicação é a raiz.

## Ajustes rápidos

**Comissão e ticket do simulador.** No início de `assets/js/main.js`:

```js
var CONFIG = {
  commission: 30, // % de comissão recorrente
  ticket: 297     // ticket médio de exemplo (R$/mês)
};
```

O percentual é atualizado em todos os pontos da página: hero de afiliados, simulador, FAQ e CTA final.

**Links que ainda apontam para âncoras ou `#`.** Troque pelos endereços reais no `index.html`:

| Onde | Hoje | Trocar por |
|---|---|---|
| Botões "App Store" e "Google Play" (topo, bloco do app e rodapé) | `#` | URLs das lojas |
| "Quero me afiliar na Hotmart" / "Quero ser afiliado" | `#afiliar` | link de afiliação do produto na Hotmart |
| "Teste grátis", "Começar teste grátis", "Entrar", "Agendar demonstração" | `#contato` | cadastro, login e agenda |

## Antes de divulgar

- Confirmar os recursos citados que ampliam a proposta atual: Instagram, Messenger, chat do site e o app iOS/Android.
- Trocar os ícones genéricos das lojas pelos selos oficiais da Apple e do Google.
- Os números usados (+85% de abertura, +30% de carrinhos recuperados, Meta Business Partner desde 2020) vêm do site atual da ManyConvert.

## Recursos da página

- **Conversa animada no topo:** mensagens no estilo WhatsApp em loop, com os canais em órbita.
- **Seletor de segmentos:** E-commerce, Saúde, Educação, Imobiliárias, Serviços e Varejo, com foto e casos de uso.
- **Simulador de renda recorrente** para afiliados.
- **Parallax** na faixa "Para todo tipo de negócio" e nas fotos de segmentos e afiliados.
- **Responsivo:** desktop, tablet e celular.
- **Acessibilidade:** respeita "reduzir movimento"; com ele ativo, animações e parallax ficam desligados.
