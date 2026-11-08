import { useState } from 'react'
import { AlertTriangle, Check, Save, Trash2 } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { deleteAccount, updateUserSettings } from '../features/auth/services/authServices'

const inputClass =
  'w-full border-2 border-[#19372D] bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#247354]'

export default function SettingsPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (!user) return null

  const saveSettings = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await updateUserSettings(displayName)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const removeAccount = async () => {
    if (confirmation !== 'DELETE') return
    setDeleting(true)
    setError('')
    try {
      await deleteAccount(password)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete your account.')
      setDeleting(false)
    }
  }

  const usesPassword = user.providerData.some((provider) => provider.providerId === 'password')

  return (
    <div className="max-w-3xl space-y-7">
      <header>
        <p className="text-sm font-medium text-[#247354]">Preferences</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#19372D]">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your profile and account.</p>
      </header>

      {error && <p role="alert" className="border-2 border-red-800 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <section className="border-2 border-[#19372D] bg-white p-5 shadow-[4px_4px_0_#A9BC91]">
        <h2 className="text-lg font-semibold text-[#19372D]">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">This name appears in your PesoFlow account.</p>
        <label className="mt-5 block text-sm font-medium text-[#19372D]" htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          autoComplete="off"
          className={`${inputClass} mt-1`}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
        />
        <p className="mt-3 text-sm text-slate-500">{user.email}</p>
        <button type="button" onClick={() => void saveSettings()} disabled={saving} className="mt-5 flex items-center gap-2 border-2 border-[#19372D] bg-[#247354] px-4 py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#163F33] disabled:opacity-60">
          {saved ? <Check size={17} /> : <Save size={17} />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
      </section>

      <section className="border-2 border-red-800 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-700" size={20} />
          <div>
            <h2 className="font-semibold text-red-800">Delete account</h2>
            <p className="mt-1 text-sm text-red-700">Permanently deletes your profile, wallets, budgets, goals, and transactions. This cannot be undone.</p>
          </div>
        </div>
        <button type="button" onClick={() => { setError(''); setDeleteOpen(true) }} className="mt-5 flex items-center gap-2 border-2 border-red-800 bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#7F1D1D]">
          <Trash2 size={17} /> Delete account
        </button>
      </section>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md border-2 border-[#19372D] bg-[#FFFDF0] p-5 shadow-[5px_5px_0_#19372D]">
            <h2 id="delete-title" className="text-lg font-semibold text-[#19372D]">Confirm account deletion</h2>
            <p className="mt-2 text-sm text-slate-600">Type <strong>DELETE</strong> to permanently remove your account and all data.</p>
            {usesPassword && (
              <>
                <label className="mt-4 block text-sm font-medium text-[#19372D]" htmlFor="delete-password">Password</label>
                <input id="delete-password" type="password" autoComplete="off" className={`${inputClass} mt-1`} value={password} onChange={(event) => setPassword(event.target.value)} />
              </>
            )}
            <label className="mt-4 block text-sm font-medium text-[#19372D]" htmlFor="delete-confirmation">Confirmation</label>
            <input id="delete-confirmation" autoComplete="off" className={`${inputClass} mt-1`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="border-2 border-[#19372D] px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={() => void removeAccount()} disabled={deleting || confirmation !== 'DELETE' || (usesPassword && !password)} className="border-2 border-red-800 bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
