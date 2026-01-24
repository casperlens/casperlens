// "use client";

// import { CONTENT_MODE, CsprClickInitOptions } from '@make-software/csprclick-core-types';
// import { ThemeProvider as NextThemesProvider } from "next-themes";
// import dynamic from 'next/dynamic';
// import * as React from "react";

// // Dynamically import ClickProvider (SSR: false skips server bundle)
// const ClickProvider = dynamic(
//   () => import('@make-software/csprclick-ui').then(mod => ({ default: mod.ClickProvider })),
//   { ssr: false }
// );
// const clickOptions: CsprClickInitOptions = {
//   appName: 'Casper dApp',
//   appId: 'csprclick-template',
//   contentMode: CONTENT_MODE.IFRAME,
//   providers: ['casper-wallet', 'ledger', 'metamask-snap', 'casperdash'],
// };

// export function ThemeProvider({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return (
//     <NextThemesProvider {...props}>
//       <ClickProvider options={clickOptions}>
//         {children}
//       </ClickProvider>
//     </NextThemesProvider>
//   );
// }

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
