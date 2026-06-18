# PROMPT — Reconstruir o app "Your Gaze"

## 1. Comando de uso

**No v0:** cole o bloco inteiro abaixo como primeira mensagem. Ele já define stack, design tokens, navegação e telas.

**No Gemini (ou outro LLM):** prefixe com:
> "Você é um engenheiro front-end sênior. Gere um app Next.js 16 (App Router) + React 19 + Tailwind CSS v4 completo e funcional, arquivo por arquivo, seguindo exatamente a especificação abaixo. Não use bibliotecas além das listadas. Entregue o código de cada arquivo em blocos separados."

---

## 2. Modelo / Stack (fixar exatamente)

- **Framework:** Next.js 16.2 (App Router, `app/`), React 19, TypeScript
- **Estilo:** Tailwind CSS v4 (sem `tailwind.config.js` — tokens em `app/globals.css` via `@theme inline`)
- **UI base:** shadcn (apenas `components/ui/button.tsx`) + `class-variance-authority`, `clsx`, `tailwind-merge`
- **Ícones:** `lucide-react` (NUNCA emojis como ícones)
- **Estado:** Context API + `localStorage` (sem backend; protótipo client-side)
- **Sem:** banco de dados, auth real, ORM. Dados mockados em `lib/data.ts`.

---

## 3. Identidade visual (design tokens)

```
Marca: "Your Gaze" — slogan "Veja e seja o que os outros não conseguem."
Estética: luxo discreto, editorial, dourado + navy sobre branco.

Cores (CSS vars em :root):
  --gold:     #d4af37   (dourado, destaque/CTA)
  --gold-soft:#f3e6b8
  --navy:     #1a2b4c   (primário/texto)
  --navy-soft:#eef1f6
  --background:#ffffff  --foreground:#1a2b4c
  --border:   #e7d9a8   (bordas douradas suaves)
  --radius:   0.625rem

Fontes:
  font-heading -> Cormorant (serif elegante, títulos e itálicos)
  font-sans    -> Geist
  font-mono    -> Geist Mono
  (carregadas via next/font em app/layout.tsx; <html> com className="bg-background")

Regras: máx 3-5 cores, sem gradientes, sem roxo. Mobile-first, flexbox primeiro.
Sidebar fixa de 288px (w-72) à esquerda; conteúdo à direita com header reduzido (logo "Your Gaze" + olhos).
```

---

## 4. Arquitetura de estado (`components/app-context.tsx`)

```
AccountType = 'espectador' | 'maker'
Screen = 'landing' | 'onboarding' | 'app'
PageKey = inicio | feed | degustacao | chat | assinaturas | transmissao
        | upload | precificacao | metricas | lives | indicacoes
        | produtos | config | suporte | admin

Flags: isFiel (espectador que assinou), isAdmin
Persistência: localStorage 'yourgaze:state' + deep-link ?step=onboarding-<tipo>
Ações: startOnboarding(tipo), completeOnboarding(), becomeFiel(),
       enterAdmin(), exitAdmin(), navigate(page), logout()
Hidratação: inicia no padrão (landing) e restaura do localStorage no useEffect (evita hydration mismatch).
```

---

## 5. Navegação (sidebar)

```
ESPECTADOR: Feed · Degustação · Chat · Assinaturas · Transmissão
MAKER:      Métricas de Vendas · Feed & Histórico · Chat · Gerenciador de Upload
            · Precificação · Transmissões · Indicações (MGM) · Lista de Produtos
COMUM:      Configurações · Suporte · Sair · seletor "yourgaze.br · PT"
Badge do perfil: "Maker" | "Fiel Espectador" | "Espectador"
```

---

## 6. Telas (comportamento exato)

**Landing** → escolha "Sou Espectador" / "Sou Maker" → **Onboarding** (interesses, nacionalidade) → **App**.

**Feed** (espectador e maker) — 3 abas:
- `Feed` (ordem padrão) · `Em Alta` (mais vistas + que mais vendem: ordena por `views`+`sales`) · `Recente` (últimas postagens em tempo real, por `minsAgo`).
- **Espectador:** vê posts de todos os Makers (pacotes de assinatura + degustação). Fileira de Histórias só para **assistir** — não existe "Sua história".
- **Maker:** vê **apenas os próprios posts**, com métricas de views/vendas em cada card, e "Sua história" para criar. Só o Maker cria histórias.
- Post não-Fiel fica bloqueado (`lock-gate`).

**Degustação** — vitrine "prove um pouco do que o Maker cria":
- Cada item tem flag `open`: o **Maker decide** o que liberar. Itens liberados aparecem **nítidos** (foto ou vídeo de 10s) com selo "Liberado pelo Maker"; o resto fica desfocado (`blur-xl`) com ícone de cadeado/olho até assinar. Fiel vê tudo nítido.

**Transmissão** (espectador) — **NÃO é trancada por assinatura**. É vitrine de compra:
- Compra de **tempo (PPV)** usável para assistir lives ou parte delas até o tempo acabar; **ingressos** para lives coletivas com vários espectadores; **games ao vivo**; **lives individuais (1:1)** ou **em grupo de até 10 pessoas**. Para Fiel, lives do plano aparecem como **bônus incluído**.

**Chat** — lista de threads com Makers + mídia paga (PPV no chat).

**Assinaturas** — 3 tiers: Premium (R$49), Premium Gold (R$99), Premium Diamond (R$199).

**Lado Maker:**
- **Métricas de Vendas:** 11 fontes de receita (Assinaturas, PPV, Fotos avulsas, Gorjetas, Lives, Gamificação, Grupos VIP, Podcasts, Mensagens combo, Indicações MGM, Lista de produtos) + gráfico de vendas/mês. Lucro líquido 85%.
- **Upload, Precificação, Transmissões, Indicações (MGM).**
- **Lista de Produtos:** Maker adiciona nome + link de qualquer loja (lucro 100% dele). Cada produto tem **espaço de mídia no topo** (foto ou vídeo de **até 10s**, com validação de duração) e o **link/botão "Comprar" logo abaixo**. Sem mídia → placeholder com ícone de carrinho.

**Admin / Configurações / Suporte:** telas simples.

---

## 7. Dados mockados (`lib/data.ts`)

```
Maker { id, name, handle, avatar }
5 makers: Valentina, Aurora, Celeste, Bianca, Lívia
currentMaker = Valentina (visão Maker filtra por ele)
Post { id, maker, image, caption, likes, tier, views, sales, minsAgo }
tiers, interesses, nacionalidades, fontesReceita, salesByMonth, chatThreads, sampleMessages
```

---

## 8. Estrutura de arquivos a gerar

```
app/{layout.tsx, page.tsx, globals.css}
components/app-context.tsx · your-gaze-app.tsx · sidebar.tsx · reduced-header.tsx
components/feed.tsx · stories.tsx · checkout-modal.tsx · lock-gate.tsx
components/brand/full-logo.tsx
components/screens/{landing,onboarding,feed-screen,degustacao-screen,chat-screen,
  assinaturas-screen,transmissao-screen,admin-screen,simple-screen}.tsx
components/screens/maker/{metricas,upload,precificacao,lives,indicacoes,produtos}-screen.tsx
components/ui/button.tsx · lib/{data.ts,utils.ts}
```
