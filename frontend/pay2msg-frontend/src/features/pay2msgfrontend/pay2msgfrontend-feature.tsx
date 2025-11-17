import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { Pay2msgfrontendUiProgramExplorerLink } from './ui/pay2msgfrontend-ui-program-explorer-link'
import { Pay2msgfrontendUiCreate } from './ui/pay2msgfrontend-ui-create'
import { Pay2msgfrontendUiProgram } from '@/features/pay2msgfrontend/ui/pay2msgfrontend-ui-program'

export default function Pay2msgfrontendFeature() {
  const { account } = useSolana()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="Pay2msgfrontend" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <Pay2msgfrontendUiProgramExplorerLink />
        </p>
        <Pay2msgfrontendUiCreate account={account} />
      </AppHero>
      <Pay2msgfrontendUiProgram />
    </div>
  )
}
