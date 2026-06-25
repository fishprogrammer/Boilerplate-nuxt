Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $root "public/logo.png"
$publicDir = Join-Path $root "public"

function Save-PwaIcon {
    param(
        [int]$Size,
        [double]$Scale,
        [string]$OutputPath
    )

    $logoSize = [int][Math]::Round($Size * $Scale)
    $offset = [int][Math]::Floor(($Size - $logoSize) / 2)

    $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $source = [System.Drawing.Image]::FromFile($srcPath)
    $attributes = New-Object System.Drawing.Imaging.ImageAttributes
    $attributes.SetColorKey([System.Drawing.Color]::Black, [System.Drawing.Color]::FromArgb(40, 40, 40))

    $destRect = New-Object System.Drawing.Rectangle $offset, $offset, $logoSize, $logoSize
    $srcRect = New-Object System.Drawing.Rectangle 0, 0, $source.Width, $source.Height
    $graphics.DrawImage(
        $source,
        $destRect,
        $srcRect.X,
        $srcRect.Y,
        $srcRect.Width,
        $srcRect.Height,
        [System.Drawing.GraphicsUnit]::Pixel,
        $attributes
    )

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
    $source.Dispose()
    $attributes.Dispose()

    Write-Host "Created $OutputPath ($Size x $Size, scale $Scale)"
}

Save-PwaIcon -Size 512 -Scale 0.72 -OutputPath (Join-Path $publicDir "pwa-icon-512.png")
Save-PwaIcon -Size 192 -Scale 0.72 -OutputPath (Join-Path $publicDir "pwa-icon-192.png")
Save-PwaIcon -Size 512 -Scale 0.58 -OutputPath (Join-Path $publicDir "pwa-icon-512-maskable.png")
Save-PwaIcon -Size 192 -Scale 0.58 -OutputPath (Join-Path $publicDir "pwa-icon-192-maskable.png")
Save-PwaIcon -Size 180 -Scale 0.72 -OutputPath (Join-Path $publicDir "apple-touch-icon.png")
