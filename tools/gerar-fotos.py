# -*- coding: utf-8 -*-
"""
Gera as fotos da landing com o Gemini (Nano Banana Pro) e entrega em WebP.

Cada foto nasce na proporcao 4:5 das fotos da pagina, no modelo Pro em 2K
(1856x2304), e e reduzida para 1200x1500 em WebP qualidade 85, que e o tamanho
de exibicao em tela retina (~570px de layout).

Uso:
    python3 tools/gerar-fotos.py                # gera/entrega as que faltam
    python3 tools/gerar-fotos.py saude varejo   # so estas
    python3 tools/gerar-fotos.py --so-webp      # nao chama a API, so reprocessa

A chave GEMINI_API_KEY e lida do .env do perfil Hermes (nunca passa pelo shell).
Cada imagem gerada custa ~US$ 0,13 (Nano Banana Pro 2K); erro de API nao e cobrado.
"""
import base64
import glob
import json
import os
import re
import sys
import urllib.error
import urllib.request

from PIL import Image

MODELO = "gemini-3-pro-image-preview"
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "assets/img")
MASTERS = os.environ.get("FOTOS_MASTERS", os.path.expanduser("~/.cache/mc-landing-fotos"))
ALVO = (1200, 1500)

ESTILO = (
    "Fotografia publicitaria realista e sofisticada, luz natural suave difusa, "
    "profundidade de campo rasa, lente 50mm, enquadramento vertical em retrato, "
    "tratamento de cor profissional, expressao espontanea e confiavel, alta definicao. "
    "Paleta com acentos discretos em violeta e roxo da marca (#530477, #9a3092) no ambiente, "
    "roupas ou objetos. Sem logotipo, sem marca d'agua, sem texto legivel ou letras na imagem."
)

# A tela do celular sempre aparece em angulo e fora de foco: o modelo nao escreve
# texto de verdade e o que ele inventa na tela suja a foto.
CENAS = {
    "saude": (
        "Uma mulher brasileira de cerca de 35 anos, sorridente e confiavel, com jaleco branco aberto sobre "
        "uma blusa lilas, em pe na recepcao de uma clinica moderna e muito clara. Ela segura o celular com as "
        "duas maos e olha para a tela, que mostra uma conversa de mensagens com baloes verdes e brancos e icones "
        "simples, sem palavras legiveis. Ao fundo, desfocados, uma sala de espera com plantas verdes, poltronas "
        "claras e um detalhe em violeta na parede"
    ),
    "varejo": (
        "Uma mulher brasileira de cerca de 30 anos, elegante e sorridente, caminhando por um shopping moderno e "
        "muito bem iluminado, carregando duas sacolas de compras, uma delas com detalhe em roxo. Na outra mao ela "
        "segura o celular, com a tela em angulo, parcialmente visivel e fora de foco. Ao fundo, desfocadas, "
        "vitrines de lojas com luzes suaves, piso claro e um detalhe violeta na sinalizacao"
    ),
    "ecommerce": (
        "Uma empreendedora brasileira de cerca de 32 anos, sorridente e descontraida, em um pequeno centro de "
        "distribuicao muito claro e organizado, com caixas de papelao empilhadas e uma bancada com fita adesiva. "
        "Ela segura o celular e mostra a tela em angulo, com uma conversa de mensagens em baloes verdes e brancos, "
        "fora de foco e sem textos legiveis. Etiquetas e detalhes em roxo nos materiais de expedicao"
    ),
    "educacao": (
        "Uma jovem estudante brasileira de cerca de 17 anos, com mochila nas costas e sorriso espontaneo, em um "
        "patio escolar moderno e claro, com plantas e bancos de concreto. Ela segura o celular com a tela em angulo, "
        "parcialmente visivel e fora de foco, sem textos legiveis. Uniforme simples em tons claros com um detalhe violeta"
    ),
    "imobiliaria": (
        "Uma corretora de imoveis brasileira de cerca de 38 anos, bem vestida com blazer cinza sobre blusa clara, em "
        "pe em uma sala ampla com janelas grandes mostrando a cidade ao fundo. Ela gesticula enquanto mostra o celular, "
        "com a tela em angulo e fora de foco, sem textos legiveis. Sobre a mesa, uma maquete de edificio e uma pasta; "
        "detalhes em violeta na decoracao"
    ),
    "servicos": (
        "Uma consultora brasileira de cerca de 34 anos, sorridente, sentada a uma mesa de escritorio moderno e muito "
        "claro, com notebook, caderno e uma caneca branca. Ela segura o celular mostrando a tela em angulo, fora de foco "
        "e sem textos legiveis, com uma conversa de mensagens. Colegas desfocados ao fundo trabalhando, detalhes em roxo na parede"
    ),
    "afiliado": (
        "Uma pessoa brasileira de cerca de 33 anos, sorridente e a vontade, em um home office claro e aconchegante, com "
        "notebook aberto na mesa, caderno e uma planta. Ao lado, o celular apoiado mostra em angulo uma tela com graficos "
        "de crescimento, fora de foco e sem textos legiveis. Detalhes em violeta na parede, na caneca e nas anotacoes"
    ),
}


def chave() -> str:
    for caminho in sorted(glob.glob("/home/ubuntu/.hermes/profiles/*/.env")):
        for linha in open(caminho, encoding="utf-8", errors="replace"):
            m = re.match(r"\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$", linha)
            if m:
                valor = m.group(1).strip().strip('"').strip("'")
                if valor and not valor.startswith("#"):
                    return valor
    raise RuntimeError("GEMINI_API_KEY nao encontrada nos .env dos perfis")


def chamar(prompt: str, com_config: bool):
    corpo = {"contents": [{"parts": [{"text": prompt}]}]}
    gc = {"responseModalities": ["Image"]}
    if com_config:
        # o Pro aceita a proporcao aqui (dentro de imageConfig); no topo do
        # generationConfig a API recusa com 400
        gc["imageConfig"] = {"aspectRatio": "4:5", "imageSize": "2K"}
    corpo["generationConfig"] = gc
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent",
        data=json.dumps(corpo).encode(),
        headers={"x-goog-api-key": chave(), "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.load(r), None
    except urllib.error.HTTPError as e:
        return None, (e.code, e.read().decode("utf-8", "replace")[:300])


def gerar(nome: str) -> None:
    cena = CENAS[nome]
    os.makedirs(MASTERS, exist_ok=True)
    resposta, erro = chamar(f"{cena}. {ESTILO}", com_config=True)
    if erro:
        print(f"  imageConfig recusado ({erro[0]}), refazendo so com a dica no texto")
        resposta, erro = chamar(
            "A foto e vertical, em retrato, na proporcao 4:5. " + cena + ". " + ESTILO, com_config=False
        )
    if erro:
        raise RuntimeError(f"{nome}: {erro[0]} {erro[1]}")
    for parte in resposta.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        inline = parte.get("inlineData") or parte.get("inline_data")
        if inline and inline.get("data"):
            destino = os.path.join(MASTERS, f"{nome}.png")
            with open(destino, "wb") as f:
                f.write(base64.b64decode(inline["data"]))
            print(f"gerado {destino} ({os.path.getsize(destino) // 1024} KB)")
            return
    raise RuntimeError(f"{nome}: resposta sem imagem")


def entregar(nome: str) -> None:
    master = os.path.join(MASTERS, f"{nome}.png")
    if not os.path.exists(master):
        raise RuntimeError(f"{nome}: master {master} nao existe")
    im = Image.open(master).convert("RGB")
    bruto = im.size
    im = im.resize(ALVO, Image.LANCZOS)
    saida = os.path.join(DESTINO, f"{nome}.webp")
    im.save(saida, "WEBP", quality=85, method=6)
    print(f"entregue {saida} {im.size} ({os.path.getsize(saida) // 1024} KB, master {bruto[0]}x{bruto[1]})")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    so_webp = "--so-webp" in sys.argv
    nomes = args or list(CENAS)
    for nome in nomes:
        if nome not in CENAS:
            raise SystemExit(f"cena desconhecida: {nome} (use {', '.join(CENAS)})")
        if not so_webp and not os.path.exists(os.path.join(MASTERS, f"{nome}.png")):
            gerar(nome)
        entregar(nome)
