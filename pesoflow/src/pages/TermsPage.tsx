import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <article className="mx-auto max-w-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <Link to="/register" className="text-sm font-medium text-[#278568] hover:underline">
          ← Back to registration
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-[#202A35]">Terms of Service &amp; Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: November 8, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-6 text-[#202A35]">
          <section>
            <h2 className="font-semibold">1. Using PesoFlow</h2>
            <p className="mt-2">
              PesoFlow helps you organize personal financial information such as wallets, budgets,
              goals, and transactions. You are responsible for keeping your account credentials
              secure and ensuring the accuracy of all information you enter.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">2. Important Notice (Financial &amp; Legal Disclaimer)</h2>
            <p className="mt-2">
              PesoFlow is an organization and tracking tool only. It does not provide financial,
              legal, tax, or investment advice. You must make your own financial decisions or
              consult a qualified professional.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">3. Data Privacy Notice (R.A. 10173 / Philippine Data Privacy Act)</h2>
            <p className="mt-2">
              Pursuant to Republic Act No. 10173 (Data Privacy Act of 2012) and its Implementing
              Rules and Regulations:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Personal Data Collected:</strong> We collect account details (e.g., email address, password hash) and transaction/financial entries you manually input into the application.</li>
              <li><strong>Purpose &amp; Legal Basis:</strong> Data is processed solely to provide personal financial organization services based on your consent when creating an account. We do not sell or monetize your financial data.</li>
              <li><strong>Security &amp; Storage:</strong> We implement appropriate technical, organizational, and physical security measures to protect your personal data from unauthorized access, loss, or misuse.</li>
              <li><strong>Data Retention:</strong> Your data is retained while your account remains active. Upon account deletion, your personal data will be permanently deleted or anonymized securely.</li>
              <li><strong>Data Subject Rights:</strong> Under the Data Privacy Act, you have the right to be informed, access, correct, object to, or request the erasure of your personal data, as well as the right to data portability and to file a complaint with the National Privacy Commission (NPC).</li>
              <li><strong>Data Privacy Contact:</strong> To exercise your rights, contact our Data Protection Officer at support@pesoflow.ph.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">4. Accepting These Terms</h2>
            <p className="mt-2">
              By creating an account, you confirm that you have read, understood, and agreed to
              these Terms of Service and Privacy Policy. If you do not agree to these terms, please
              do not create an account or use PesoFlow.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
