import { registerSlashCommands } from '../src/features/register-commands'

// eslint-disable-next-line no-console
registerSlashCommands().then(() => process.exit(0)).catch(console.error)
