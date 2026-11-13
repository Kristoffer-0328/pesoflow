import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Banknote, ChevronLeft, ChevronRight, CreditCard, Pencil, Plus, Search, Smartphone, X } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { addWallet, updateWalletColor } from '../features/auth/services/walletServices'
import type { Wallet } from '../types'
import { getWalletBalance } from '../utils/calculation'
import { formatPeso, parsePesoToCentavos } from '../utils/money'
import { getWalletCardColors, getWalletProviderColor, walletColorOptions } from '../utils/walletColors'
import { useUserData } from '../features/auth/hooks/userData'
import { getMonthKey } from '../utils/date'

type WalletType = Exclude<Wallet['type'], 'other'>
type ProviderWalletType = Exclude<WalletType, 'cash'>

const providers: Record<ProviderWalletType, string[]> = {
  'e-wallet': [
    'GCash',
    'Maya',
    'GoTyme Bank',
    'DiskarTech',
    'Tonik',
    'SeaBank',
    'Maya Bank',
    'MariBank',
    'Coins.ph',
  ],
  bank: [
    'BDO Unibank',
    'BPI',
    'Metrobank',
    'UnionBank',
    'Landbank',
    'PNB',
    'Security Bank',
    'RCBC',
    'China Bank',
    'EastWest Bank',
    'Asia United Bank (AUB)',
  ],
  'credit-card': ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'RCBC', 'Security Bank'],
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20'
const labelClass = 'mb-1 block text-sm font-medium text-[#202A35]'

export default function WalletsPage() {
  const { user } = useAuth()
  const { wallets, transactions, loading, error } = useUserData(getMonthKey(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
        Couldn&apos;t load your wallets: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" />
      </div>
    )
  }

  const activeWallets = wallets.filter((wallet) => wallet.isActive)
  const selectedIndex = Math.min(activeIndex, Math.max(activeWallets.length - 1, 0))
  const totalBalance = activeWallets.reduce(
    (total, wallet) => total + getWalletBalance(wallet, transactions),
    0,
  )

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header className="flex items-center gap-3">
        <h1 className="flex-1 rounded-xl bg-[#278568] px-4 py-3 text-center text-2xl font-semibold leading-7 text-white shadow-sm">
          Wallets &amp; Cards
        </h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Add wallet"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#278568] text-white shadow-sm transition hover:bg-[#1f6e55] sm:h-12 sm:w-12"
        >
          <Plus size={26} />
        </button>
      </header>

      <section className="px-2">
        <p className="text-sm text-slate-500">Total balance</p>
        <p className="mt-1 text-3xl font-semibold text-[#202A35] sm:text-4xl">
          {formatPeso(totalBalance)}
        </p>
      </section>

      {activeWallets.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
          <h2 className="mt-3 font-semibold text-[#202A35]">No wallets yet</h2>
          <p className="mt-1 text-sm text-slate-500">Add your first Philippine bank or e-wallet.</p>
        </div>
      ) : (
        <section aria-label="Wallet cards" className="pt-8">
          <div className="relative mx-auto h-[310px] w-full max-w-[600px]">
            {activeWallets.map((wallet, index) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                balance={getWalletBalance(wallet, transactions)}
                index={index}
                activeIndex={selectedIndex}
                total={activeWallets.length}
                onSelect={() => setActiveIndex(index)}
                onEdit={() => setEditingWallet(wallet)}
              />
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between rounded-xl bg-[#E9EDF2] px-4 py-2">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((selectedIndex - 1 + activeWallets.length) % activeWallets.length)
              }
              aria-label="Previous wallet"
              className="flex h-10 w-12 items-center justify-center rounded-lg text-[#278568] transition hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft size={28} />
            </button>
            <span className="min-w-12 text-center text-lg font-medium text-slate-500">
              {selectedIndex + 1}/{activeWallets.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex((selectedIndex + 1) % activeWallets.length)}
              aria-label="Next wallet"
              className="flex h-10 w-12 items-center justify-center rounded-lg text-[#278568] transition hover:bg-white hover:shadow-sm"
            >
              <ChevronRight size={28} />
            </button>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">Swipe the card, or tap one behind it</p>
        </section>
      )}

      {modalOpen && user && <AddWalletModal userId={user.uid} onClose={() => setModalOpen(false)} />}
      {editingWallet && user && (
        <EditWalletColorModal
          userId={user.uid}
          wallet={editingWallet}
          onClose={() => setEditingWallet(null)}
        />
      )}
    </div>
  )
}

function WalletCard({
  wallet,
  balance,
  index,
  activeIndex,
  total,
  onSelect,
  onEdit,
}: {
  wallet: Wallet
  balance: number
  index: number
  activeIndex: number
  total: number
  onSelect: () => void
  onEdit: () => void
}) {
  const offset = (index - activeIndex + total) % total
  const isActive = offset === 0
  const isVisible = offset < Math.min(total, 3)
  const cardColors = getWalletCardColors(wallet)

  return (
    <div
      className={`absolute inset-x-0 top-0 mx-auto h-[280px] w-[92%] max-w-[570px] transition-all duration-300 ${
        isVisible ? 'visible' : 'invisible'
      }`}
      style={{
        transform: `translateY(${offset * -30}px) scale(${1 - offset * 0.035})`,
        zIndex: total - offset,
        opacity: isActive ? 1 : 0.72,
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Select ${wallet.name}`}
        className="absolute inset-0 overflow-hidden rounded-[22px] text-left text-white shadow-[0_10px_18px_rgba(15,23,42,0.22)]"
        style={{ background: `linear-gradient(135deg, ${cardColors[0]}, ${cardColors[1]})` }}
      >
        <span className="absolute -bottom-12 -right-2 text-[170px] font-black leading-none tracking-[-0.12em] text-white/10">
          {getBrandMark(wallet)}
        </span>
        <span className="absolute left-7 top-7 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 text-sm font-black ring-1 ring-white/30">
          {getBrandMark(wallet).slice(0, 3)}
        </span>
        <span className="absolute right-7 top-8 rounded-sm bg-white/15 px-3 py-2 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
          {wallet.type === 'e-wallet' ? 'E-wallet' : wallet.type === 'credit-card' ? 'Credit card' : 'Bank'}
        </span>
        <span className="absolute left-7 top-[84px] text-lg font-semibold sm:text-xl">{wallet.name}</span>
        {wallet.provider && wallet.provider !== wallet.name && (
          <span className="absolute left-7 top-[116px] text-xs text-white/70">{wallet.provider}</span>
        )}
        <span className="absolute bottom-8 left-7 text-2xl font-semibold sm:text-3xl">{formatPeso(balance)}</span>
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${wallet.name} color`}
        className="absolute right-5 top-5 z-10 rounded-lg bg-white/20 p-2 text-white transition hover:bg-white/35"
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}

function getBrandMark(wallet: Pick<Wallet, 'provider' | 'name'>) {
  const name = (wallet.provider || wallet.name).toUpperCase()
  if (name.includes('PHILIPPINE') || name.includes('PNB')) return 'PNB'
  if (name.includes('BPI')) return 'BPI'
  if (name.includes('METRO')) return 'MB'
  if (name.includes('UNION')) return 'UB'
  if (name.includes('GCASH')) return 'G'
  if (name.includes('MAYA')) return 'M'
  return name.replace(/[^A-Z]/g, '').slice(0, 3) || '₱'
}

function EditWalletColorModal({
  userId,
  wallet,
  onClose,
}: {
  userId: string
  wallet: Wallet
  onClose: () => void
}) {
  const [color, setColor] = useState(wallet.color || walletColorOptions[0].value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateWalletColor(userId, wallet.id, color)
      onClose()
    } catch {
      setError('Could not update the wallet color. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${wallet.name} color`}
        className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl md:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Wallet color</p>
            <h2 className="text-lg font-semibold text-[#202A35]">{wallet.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]">
            <X size={18} />
          </button>
        </div>
        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <div className="mb-6 flex flex-wrap gap-3" role="radiogroup" aria-label="Wallet color">
          {walletColorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-label={option.name}
              aria-checked={color === option.value}
              onClick={() => setColor(option.value)}
              className={`h-10 w-10 rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                color === option.value ? 'ring-2 ring-[#202A35] ring-offset-2' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: option.value }}
            />
          ))}
        </div>
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#278568] py-3 text-sm font-semibold text-white hover:bg-[#1f6e55] disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Saving...' : 'Save color'}
        </button>
      </form>
    </div>
  )
}

function AddWalletModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<WalletType | null>(null)
  const [provider, setProvider] = useState('')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#278568')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (nextType: WalletType) => {
    setType(nextType)
    setProvider(nextType === 'cash' ? 'Cash' : '')
    setColor('#278568')
    setStep(nextType === 'cash' ? 3 : 2)
    setSearch('')
    setError('')
  }

  const handleProviderChange = (nextProvider: string) => {
    setProvider(nextProvider)
    setColor(getWalletProviderColor(nextProvider))
    setStep(3)
    setError('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!type || !provider) return
    const walletName = name.trim() || provider
    const initialBalance = parsePesoToCentavos(balance || '0')
    if (initialBalance === null) {
      setError('Enter a valid balance with up to 2 decimal places.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await addWallet(userId, {
        name: walletName,
        type,
        provider: type === 'cash' ? undefined : provider,
        initialBalance,
        color,
      })
      onClose()
    } catch {
      setError('Could not save the wallet. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Add wallet" className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Step {step} of 3</p>
            <h2 className="text-lg font-semibold text-[#202A35]">
              {step === 1 ? 'What kind of wallet?' : step === 2 ? 'Choose a provider' : 'Wallet details'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]">
            <X size={18} />
          </button>
        </div>
        <div className="mb-6 flex gap-1">
          {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-[#278568]' : 'bg-[#E9EDF2]'}`} />)}
        </div>
        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <TypeChoice icon={Banknote} title="Bank" description="Savings and digital banks" onClick={() => handleTypeChange('bank')} />
            <TypeChoice icon={Smartphone} title="E-wallet" description="GCash, Maya, and more" onClick={() => handleTypeChange('e-wallet')} />
            <TypeChoice icon={Banknote} title="Cash" description="Money in your pocket" onClick={() => handleTypeChange('cash')} />
            <TypeChoice icon={CreditCard} title="Credit card" description="Track your card balance" onClick={() => handleTypeChange('credit-card')} />
          </div>
        )}

        {step === 2 && type && type !== 'cash' && (
          <div>
            <button type="button" onClick={() => setStep(1)} className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#278568]">
              <ArrowLeft size={16} /> Change type
            </button>
            <div className={`${inputClass} mb-3 flex items-center gap-2`}>
              <Search size={17} className="text-slate-400" />
              <input autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search providers" className="w-full bg-transparent text-sm outline-none" />
            </div>
            <div className="divide-y divide-slate-100">
              {providers[type]
                .filter((item) => item.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                  <button key={item} type="button" onClick={() => handleProviderChange(item)} className="flex w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-[#F7F8FA]">
                    <ProviderLogo provider={item} />
                    <span className="flex-1 text-sm font-semibold text-[#202A35]">{item}</span>
                    <ChevronRight size={17} className="text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {step === 3 && type && (
          <form onSubmit={handleSubmit} autoComplete="off">
            <button type="button" onClick={() => setStep(type === 'cash' ? 1 : 2)} className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#278568]">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#F7F8FA] p-3">
              <ProviderLogo provider={provider} />
              <div><p className="text-xs text-slate-500">{type === 'cash' ? 'Wallet type' : 'Provider'}</p><p className="text-sm font-semibold text-[#202A35]">{provider}</p></div>
            </div>
            <label className={labelClass} htmlFor="wallet-name">Wallet name <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="wallet-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={provider} className={`${inputClass} mb-4`} />
            <label className={labelClass} htmlFor="initial-balance">Current balance</label>
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-3 flex items-center text-lg font-semibold text-slate-400">₱</span>
              <input id="initial-balance" type="number" min="0" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} inputMode="decimal" placeholder="0.00" className={`${inputClass} pl-8`} />
            </div>
            <fieldset className="mb-6">
              <legend className={labelClass}>Wallet color</legend>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Wallet color">
                {walletColorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-label={option.name}
                    aria-checked={color === option.value}
                    onClick={() => setColor(option.value)}
                    className={`h-9 w-9 rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      color === option.value ? 'ring-2 ring-[#202A35] ring-offset-2' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: option.value }}
                  />
                ))}
              </div>
            </fieldset>
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#278568] py-3 text-sm font-semibold text-white hover:bg-[#1f6e55] disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving...' : 'Save wallet'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function TypeChoice({ icon: Icon, title, description, onClick }: { icon: typeof Banknote; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl border-2 border-[#278568] p-4 text-left transition hover:bg-[#278568]/5">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#278568] text-white"><Icon size={20} /></span>
      <span className="mt-4 block font-semibold text-[#202A35]">{title}</span>
      <span className="mt-1 block text-xs text-slate-500">{description}</span>
    </button>
  )
}

function ProviderLogo({ provider }: { provider: string }) {
  const mark = provider === 'Maya Bank' ? 'M' : provider === 'MariBank' ? 'MB' : getBrandMark({ provider, name: provider })
  const color = provider === 'Cash' ? '#278568' : getWalletProviderColor(provider)
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
      style={{ backgroundColor: `${color}1A`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}
    >
      {mark}
    </span>
  )
}
