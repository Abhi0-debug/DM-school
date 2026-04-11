const faviconVersion = "20260411.2";

export default function Head() {
  return (
    <>
      <link rel="icon" href={`/favicon.ico?v=${faviconVersion}`} sizes="any" />
      <link rel="shortcut icon" href={`/favicon.ico?v=${faviconVersion}`} />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`/favicon-32x32.png?v=${faviconVersion}`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`/favicon-16x16.png?v=${faviconVersion}`}
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`/apple-touch-icon.png?v=${faviconVersion}`}
      />
      <link rel="manifest" href={`/site.webmanifest?v=${faviconVersion}`} />
      <meta name="theme-color" content="#2f79f7" />
      <meta name="msapplication-TileColor" content="#2f79f7" />
    </>
  );
}
