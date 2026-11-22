export type Hold = {
  id: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

type HoldOverlayProps = {
  imageUrl: string
  holds: Hold[]
  alt: string
}

export function HoldOverlay({ imageUrl, holds, alt }: HoldOverlayProps) {
  return (
    <div className="hold-image">
      <img src={imageUrl} alt={alt} />
      {holds.map((hold) => (
        <div
          className="hold-outline"
          key={hold.id}
          title={`${hold.id}: ${hold.color}`}
          style={{
            left: `${hold.x * 100}%`,
            top: `${hold.y * 100}%`,
            width: `${hold.width * 100}%`,
            height: `${hold.height * 100}%`,
            borderColor: hold.color === 'unknown' ? '#111827' : hold.color,
          }}
        >
          <span>{hold.id}</span>
        </div>
      ))}
    </div>
  )
}
