import { PAY2MSGFRONTEND_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function Pay2msgfrontendUiProgramExplorerLink() {
  return <AppExplorerLink address={PAY2MSGFRONTEND_PROGRAM_ADDRESS} label={ellipsify(PAY2MSGFRONTEND_PROGRAM_ADDRESS)} />
}
