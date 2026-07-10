import Link from 'next/link'
import { FullLogo } from '@/components/brand/full-logo'
import {
  ShieldCheck,
  Radio,
  Users,
  Settings2,
  Gavel,
  MessageSquareLock,
  Fingerprint,
  BookOpen,
  Mic2,
  CalendarDays,
  Crown,
  TrendingUp,
  Check,
  BadgeCheck,
  DollarSign,
  Clapperboard,
  ArrowRight,
  Lock,
  Globe,
  Video,
} from 'lucide-react'
import { LilioRosaIcon } from '@/components/ui/lirio-rosa-icon'

// ─── Dados estáticos ──────────────────────────────────────────────────────────

const STUDIO_TOOLS = [
  {
    icon:  Settings2,
    title: 'Precificação de Assinaturas',
    desc:  'Configure faixas de preço (Free → Diamond), períodos de trial e cupons de desconto — sem interferência da plataforma.',
    cta:   'Configurar Tiers',
    href:  '/app',
  },
  {
    icon:  MessageSquareLock,
    title: 'Upload de Conteúdo PPV',
    desc:  'Suba fotos e vídeos com desfoque automático e defina o preço de desbloqueio por Espectador (USD $9,90 a USD $499).',
    cta:   'Novo Conteúdo PPV',
    href:  '/app',
  },
  {
    icon:  Gavel,
    title: 'Agendamento de Leilões',
    desc:  'Crie leilões de peça única (1/1) ou lote para grupo de vencedores com maiores lances, com cronômetro de escassez ao vivo.',
    cta:   'Criar Leilão',
    href:  '/app',
  },
]

const MGM_TIERS = [
  {
    range:  '#1 – #1.000',
    label:  'Makers Fundadores',
    rate:   '2%',
    isPerk: true,
    desc:   '2% fixo vitalício sobre cada venda dos Makers indicados — para sempre, independente do volume de ativos.',
  },
  {
    range:  '#1.001+ · 1–100 ativos',
    label:  'Nível Base',
    rate:   '1%',
    isPerk: false,
    desc:   '1% sobre cada venda dos Makers ativos na sua rede de indicados.',
  },
  {
    range:  '#1.001+ · 101–200 ativos',
    label:  'Nível Prata',
    rate:   '1,5%',
    isPerk: false,
    desc:   '1,5% ao superar 100 Makers ativos recorrentes indicados.',
  },
  {
    range:  '#1.001+ · 201+ ativos',
    label:  'Nível Ouro',
    rate:   '2%',
    isPerk: false,
    desc:   '2% plenos ao atingir 201+ Makers ativos na rede de indicação.',
  },
]

const PODCAST_EPISODES = [
  {
    ep: 'EP 01',
    title: 'PPV Direto: da Estratégia ao Primeiro USD $1.000',
    min: '48 min',
  },
  {
    ep: 'EP 02',
    title: 'Leilões 1/1 — Como Ancorar Preços Elevados e Vencer pela Escassez',
    min: '41 min',
  },
  {
    ep: 'EP 03',
    title: 'Precificação em Dólar — Blindagem Patrimonial para Criadores Latino-Americanos',
    min: '55 min',
  },
  {
    ep: 'EP 04',
    title: 'MGM e Renda Passiva: Como os Makers Fundadores Construíram Receita Vitalícia',
    min: '37 min',
  },
]

const TUTORIALS = [
  { icon: DollarSign, title: 'Split 85/15 — Entenda cada centavo do seu repasse'     },
  { icon: Video,      title: 'Lives com Mimos Coletivos — Gamificação em tempo real'  },
  { icon: Globe,      title: 'Atraindo Espectadores Internacionais (EUA e Europa)'    },
  { icon: Lock,       title: 'KYC Yoti — Passo a passo para liberar saques em USD'   },
]

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo em pill branca — mixBlendMode multiply requer fundo claro */}
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-lg bg-white px-3 py-1.5 shadow-sm shadow-amber-400/10">
            <FullLogo width={96} className="w-[76px]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-400/60">
              Your Gaze
            </span>
            <span className="font-serif text-base font-black tracking-[0.2em] text-amber-400 uppercase">
              Hub
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/app"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Plataforma
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/10 px-5 py-2 text-sm font-bold text-amber-300 transition-all hover:bg-amber-400/20"
          >
            <Clapperboard className="size-3.5" />
            Estúdio ao Vivo
          </Link>
        </nav>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/5 px-6 py-20 text-center"
      aria-labelledby="hub-hero-heading"
    >
      {/* Halos decorativos */}
      <div className="pointer-events-none absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-72 rounded-full bg-amber-400/5 blur-2xl" aria-hidden="true" />

      {/* Logo oficial em card branco centralizado — blend multiply sobre branco */}
      <div className="relative mb-6 inline-block overflow-hidden rounded-2xl border border-amber-400/20 bg-white px-8 py-4 shadow-xl shadow-amber-400/10">
        <FullLogo width={240} className="w-[180px] sm:w-[240px]" />
      </div>

      {/* Selo distintivo */}
      <div className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/8 px-4 py-1.5">
        <Crown className="size-3.5 text-amber-400" strokeWidth={1.5} />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          YOUR GAZE HUB — O Domínio Soberano do Criador
        </span>
      </div>

      {/* Título principal */}
      <h1
        id="hub-hero-heading"
        className="relative mx-auto max-w-4xl font-serif text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
      >
        Your Gaze Hub —{' '}
        <span className="text-amber-400">O Domínio Soberano do Criador</span>
      </h1>

      {/* Subtítulo */}
      <p className="relative mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
        Gestão audiovisual, estúdio ao vivo, repasse líquido de{' '}
        <strong className="font-bold text-amber-400">85%</strong> e escalabilidade em Dólar.
        Tudo que um Maker soberano precisa em um único hub.
      </p>

      {/* CTAs primários */}
      <div className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/app"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-amber-400/25 transition-all hover:opacity-95 active:scale-[.98]"
        >
          <Radio className="size-5" />
          Acessar Estúdio ao Vivo
        </Link>
        <Link
          href="/app"
          className="flex items-center gap-2 rounded-2xl border border-slate-700 px-8 py-4 text-base font-semibold text-slate-300 transition-all hover:border-amber-400/40 hover:text-white"
        >
          <DollarSign className="size-5 text-amber-400" />
          Configurar Preferências de Saque (85%)
        </Link>
      </div>
    </section>
  )
}

function StudioPanel() {
  return (
    <section className="px-6 py-16" aria-labelledby="studio-heading">
      <div className="mx-auto max-w-5xl">
        {/* Cabeçalho da seção */}
        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <Settings2 className="size-5 text-amber-400" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id="studio-heading" className="font-serif text-2xl font-black text-white sm:text-3xl">
              Painel de Gestão & Estúdio
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure, suba e agende — tudo com autonomia total de precificação.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {STUDIO_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <article
                key={tool.title}
                className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:border-amber-400/30 hover:bg-amber-400/[0.04]"
              >
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                  <Icon className="size-5 text-amber-400" strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 font-serif text-base font-bold text-white">{tool.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">{tool.desc}</p>
                <Link
                  href={tool.href}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-opacity hover:opacity-80"
                >
                  {tool.cta} <ArrowRight className="size-3.5" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LivePanel() {
  return (
    <section
      className="border-y border-white/5 px-6 py-16"
      aria-labelledby="live-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
            <Radio className="size-5 text-rose-400" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id="live-heading" className="font-serif text-2xl font-black text-white sm:text-3xl">
              Central de Transmissão — Live & Collabs
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Salas ao vivo individuais ou colaborativas com até 4 Makers simultâneos.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Live Solo */}
          <div className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <Video className="size-5 text-rose-400" strokeWidth={1.5} />
              <h3 className="font-serif text-lg font-bold text-white">Live Solo</h3>
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Ao Vivo
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Transmissão individual com gamificação de Mimos em Dólar (USD $), metas de desejos
              em tempo real e barra de progresso pública para a comunidade de Espectadores.
            </p>
            <ul className="space-y-2">
              {[
                'Mimos com ícone do Lírio Rosa em tempo real',
                'Metas de desejos configuráveis (USD $)',
                'Gravação automática para o acervo PPV',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="size-3.5 shrink-0 text-amber-400" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-500 active:scale-[.98]"
            >
              <Radio className="size-4" />
              Iniciar Live Solo
            </Link>
          </div>

          {/* Collab */}
          <div className="flex flex-col gap-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-6">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-amber-400" strokeWidth={1.5} />
              <h3 className="font-serif text-lg font-bold text-white">Collab (até 4 Makers)</h3>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Novo
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Sala colaborativa com até 4 Makers transmitindo simultaneamente.
              Os Espectadores podem enviar Mimos para qualquer Maker na sala — cada um recebe
              sua fração de 85% individualmente.
            </p>
            <ul className="space-y-2">
              {[
                'Até 4 Makers em tela dividida',
                'Mimos individuais por Maker na sala',
                'Audiência unificada dos 4 perfis',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="size-3.5 shrink-0 text-amber-400" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            {/* Illustração de 4 slots de avatar */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="flex size-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-[10px] font-bold text-amber-400"
                >
                  M{n}
                </div>
              ))}
              <span className="ml-1 text-xs text-slate-500">slots disponíveis</span>
            </div>
            <Link
              href="/app"
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-3 text-sm font-bold text-slate-950 shadow-md transition-all hover:opacity-95 active:scale-[.98]"
            >
              <Users className="size-4" />
              Criar Sala Collab
            </Link>
          </div>
        </div>

        {/* Nota de Mimos */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
          <LilioRosaIcon size={18} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-300">Gamificação de Mimos com Lírio Rosa</strong> — Cada Mimo enviado durante a Live exibe uma animação flutuante
            com o valor em <strong className="text-amber-400">USD ($)</strong>. Os Mimos são processados em tempo real
            com repasse líquido de <strong className="text-amber-400">85%</strong> ao Maker, pagos via Yoti KYC.
          </p>
        </div>
      </div>
    </section>
  )
}

function KycPanel() {
  return (
    <section className="px-6 py-16" aria-labelledby="kyc-heading">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
            {/* Ícone e badge */}
            <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                <Fingerprint className="size-7 text-emerald-400" strokeWidth={1.5} />
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <BadgeCheck className="size-3.5" />
                Segurança Antifraude Ativa
              </span>
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              <h2 id="kyc-heading" className="font-serif text-2xl font-black text-white sm:text-3xl">
                Conformidade & Yoti KYC
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                O recebimento de pagamentos em USD exige verificação obrigatória de identidade jurídica
                via <strong className="text-white">Yoti</strong> — pessoa física ou CNPJ próprio.
                Intermediários e laranjas são bloqueados automaticamente pelo sistema antifraude.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Pessoa Física (CPF)',      status: 'Verificação via Yoti'     },
                  { label: 'Pessoa Jurídica (CNPJ)',   status: 'CNPJ próprio obrigatório' },
                  { label: 'Chave PIX para Saque',     status: 'Vinculada ao KYC'         },
                  { label: 'Intermediários / Laranjas', status: 'Bloqueio automático'      },
                ].map(({ label, status }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/app"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
              >
                <ShieldCheck className="size-4" />
                Verificar Identidade (Yoti)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AcademyPanel() {
  return (
    <section
      className="border-y border-white/5 px-6 py-16"
      aria-labelledby="academy-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <Mic2 className="size-5 text-amber-400" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id="academy-heading" className="font-serif text-2xl font-black text-white sm:text-3xl">
              Academia & Podcast Your Gaze Hub
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tutoriais estratégicos, agenda de eventos e episódios para Makers de alta performance.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Tutoriais */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="size-4 text-amber-400" strokeWidth={1.75} />
              <h3 className="font-serif text-base font-bold text-white">Tutoriais Estratégicos</h3>
            </div>
            <ul className="space-y-3">
              {TUTORIALS.map(({ icon: Icon, title }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-amber-400/20"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-amber-400" strokeWidth={1.75} />
                  <span className="text-sm text-slate-300">{title}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-opacity hover:opacity-80"
            >
              Ver todos os tutoriais <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Podcast */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mic2 className="size-4 text-amber-400" strokeWidth={1.75} />
              <h3 className="font-serif text-base font-bold text-white">Podcast</h3>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                Novos eps semanais
              </span>
            </div>
            <ul className="space-y-3">
              {PODCAST_EPISODES.map(({ ep, title, min }) => (
                <li
                  key={ep}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-amber-400/20"
                >
                  <span className="mt-0.5 shrink-0 rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black text-amber-400 uppercase">
                    {ep}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">{title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{min}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-opacity hover:opacity-80"
            >
              Ouvir todos os episódios <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Agenda de Eventos */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-4">
          <CalendarDays className="size-5 shrink-0 text-amber-400" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Próximo Evento: Masterclass de Leilões 1/1</p>
            <p className="text-xs text-slate-500">Sábado, 12 Jul 2026 · 19h00 (BRT) · Transmissão ao Vivo</p>
          </div>
          <Link
            href="/app"
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/20"
          >
            Inscrever-se
          </Link>
        </div>
      </div>
    </section>
  )
}

function MGMPanel() {
  return (
    <section className="px-6 py-16" aria-labelledby="mgm-heading">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <TrendingUp className="size-5 text-amber-400" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id="mgm-heading" className="font-serif text-2xl font-black text-white sm:text-3xl">
              Programa MGM — Makers Fundadores
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Comissão paga 100% pela fatia dos 15% da plataforma. O Maker indicado não perde nada.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MGM_TIERS.map((tier) => (
            <div
              key={tier.range}
              className={`relative flex flex-col gap-3 rounded-2xl border p-5 ${
                tier.isPerk
                  ? 'border-amber-400/40 bg-amber-400/8 shadow-xl shadow-amber-400/5'
                  : 'border-white/8 bg-white/[0.03]'
              }`}
            >
              {/* Badge Fundadores */}
              {tier.isPerk && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-400/40 bg-slate-950 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  <Crown className="mb-0.5 mr-1 inline-block size-2.5" />
                  Fundadores
                </span>
              )}

              <p className={`text-[10px] font-semibold uppercase tracking-wider ${tier.isPerk ? 'text-amber-400' : 'text-slate-600'}`}>
                {tier.range}
              </p>

              <p className={`font-serif text-4xl font-black ${tier.isPerk ? 'text-amber-400' : 'text-white'}`}>
                {tier.rate}
              </p>

              <p className="text-sm font-bold text-white">{tier.label}</p>
              <p className="text-xs leading-relaxed text-slate-500">{tier.desc}</p>

              {tier.isPerk && (
                <span className="mt-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  <Crown className="size-3" /> Vitalício — Para Sempre
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Nota legal */}
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-400" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-slate-500">
            A comissão MGM é processada automaticamente em cada venda do Maker indicado e creditada
            na carteira USD do Maker referenciador. O recebimento exige KYC Yoti ativo e chave PIX
            ou conta bancária vinculada. Intermediários são bloqueados.
          </p>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="border-t border-white/5 px-6 py-20 text-center" aria-labelledby="final-cta-heading">
      <div className="mx-auto max-w-2xl">
        <Crown className="mx-auto mb-4 size-9 text-amber-400" strokeWidth={1.25} />
        <h2
          id="final-cta-heading"
          className="font-serif text-3xl font-black text-white sm:text-4xl"
        >
          Soberania total.{' '}
          <span className="text-amber-400">Seu estúdio. Sua renda.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-slate-500">
          Cadastro gratuito. Repasse de 85% a partir da primeira venda.
          Verificação KYC para liberar saques em USD.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-amber-400/25 transition-all hover:opacity-95 active:scale-[.98]"
          >
            <Radio className="size-5" />
            Acessar Estúdio ao Vivo
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 px-8 py-4 text-base font-semibold text-slate-300 transition-all hover:border-amber-400/40 hover:text-white"
          >
            <DollarSign className="size-5 text-amber-400" />
            Configurar Saque (85%)
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-700">
          Your Gaze Hub · Repasse 85% ao Maker · Taxa de plataforma fixa 15% · Multi-moeda USD
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row">
        <div className="flex flex-col items-center gap-0.5 sm:items-start">
          <span className="font-serif text-xs font-black tracking-[0.25em] text-amber-400 uppercase">
            YOUR GAZE HUB
          </span>
          <span className="text-[10px] text-slate-700">O Domínio Soberano do Criador</span>
        </div>
        <p className="text-xs text-slate-700">
          © {new Date().getFullYear()} Your Gaze. Plataforma de soberania audiovisual.
        </p>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-600 transition-colors hover:text-amber-400"
        >
          Página Institucional <ArrowRight className="size-3" />
        </Link>
      </div>
    </footer>
  )
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function MakerSpacePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <NavBar />
      <main>
        <HeroSection />
        <StudioPanel />
        <LivePanel />
        <KycPanel />
        <AcademyPanel />
        <MGMPanel />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
