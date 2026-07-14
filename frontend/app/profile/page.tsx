import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccountSummary } from "@/components/profile/account-summary";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { EmailForm } from "@/components/profile/email-form";
import { PasswordForm } from "@/components/profile/password-form";
import { DangerZone } from "@/components/profile/danger-zone";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 009 — Profile
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Your account.</h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              View your account details, update your personal information, email, or password, or
              close your account.
            </p>

            <div className="mt-12 flex flex-col gap-8">
              <AccountSummary />
              <PersonalInfoForm />
              <EmailForm />
              <PasswordForm />
              <DangerZone />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
