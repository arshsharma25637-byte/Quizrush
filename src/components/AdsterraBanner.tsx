import { useMemo } from 'react';

interface AdsterraBannerProps {
  slotKey?: string;
  className?: string;
}

export function AdsterraBanner({ slotKey = 'default', className = '' }: AdsterraBannerProps) {
  const srcDoc = useMemo(
    () => `<!doctype html>
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
        'key' : '593b52b1c2b167ea4df260d75df07322',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    </script>
    <script src="https://bicea.org/22/593b52b1c2b167ea4df260d75df07322"></script>
  </body>
</html>`,
    []
  );

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Advertisement
      </span>
      <div className="flex h-[52px] w-[322px] max-w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/35">
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
      </div>
    </div>
  );
}
