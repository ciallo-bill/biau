import type { ImgHTMLAttributes } from 'react'

type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
}

function getWebpSrc(src: string) {
  if (!/\.(png|jpe?g)$/i.test(src)) return ''
  return src.replace(/\.(png|jpe?g)$/i, '.webp')
}

export function ResponsiveImage({
  src,
  alt,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ResponsiveImageProps) {
  const webpSrc = getWebpSrc(src)

  if (!webpSrc) {
    return <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />
  }

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />
    </picture>
  )
}
