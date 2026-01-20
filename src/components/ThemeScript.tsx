export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldBeDark = theme === 'dark' || (theme !== 'light' && systemPrefersDark);
            if (shouldBeDark) {
              document.documentElement.classList.add('dark');
            }
          })();
        `,
      }}
    />
  );
}
