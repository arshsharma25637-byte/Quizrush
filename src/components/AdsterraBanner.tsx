import { useMemo } from 'react';

interface AdsterraBannerProps {
  slotKey?: string;
  className?: string;
}

const AD_BANNER_KEY = (
  import.meta.env.VITE_ADSTERRA_BANNER_KEY || '593b52b1c2b167ea4df260d75df07322'
).trim();
const AD_SCRIPT_URL = (
  import.meta.env.VITE_ADSTERRA_BANNER_SCRIPT_URL ||
  'https://bicea.org/22/593b52b1c2b167ea4df260d75df07322'
).trim();

const IS_VALID_AD_KEY =
  /^[a-zA-Z0-9_-]{8,64}$/.test(AD_BANNER_KEY) && !AD_BANNER_KEY.toUpperCase().startsWith('YOUR_');

const IS_VALID_SCRIPT_URL =
  AD_SCRIPT_URL.startsWith('https://') &&
  !AD_SCRIPT_URL.toUpperCase().includes('YOUR_') &&
  !/["'<>`\s]/.test(AD_SCRIPT_URL);

const IS_AD_CONFIGURED = IS_VALID_AD_KEY && IS_VALID_SCRIPT_URL;

export function AdsterraBanner({ slotKey = 'default', className = '' }: AdsterraBannerProps) {
  const srcDoc = useMemo(() => {
    if (!IS_AD_CONFIGURED) return '';
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 320px;
        height: 50px;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script>
      atOptions = {
        'key' : '${AD_BANNER_KEY}',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    </script>
    <script src="${AD_SCRIPT_URL}"></script>
  </body>
</html>`;
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Advertisement
      </span>
      <div className="flex h-[52px] w-[322px] max-w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/35">
        {IS_AD_CONFIGURED ? (
          <iframe
            key={slotKey}
            title="Sponsored Ad"
            srcDoc={srcDoc}
            width={320}
            height={50}
            scrolling="no"
            frameBorder={0}
            className="h-[50px] w-[320px] border-0"
          />
        ) : (
          <span className="px-3 text-center text-[11px] font-medium text-slate-500">
            Ad Banner Slot (320×50)
          </span>
        )}
      </div>
    </div>
  );
}
