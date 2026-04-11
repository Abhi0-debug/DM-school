Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $root "public"
$sourcePath = Join-Path $publicDir "CICA LOGO 3.png"

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Source logo not found at $sourcePath"
}

function Get-VisibleBounds {
  param(
    [System.Drawing.Bitmap]$Bitmap
  )

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0 -or $maxY -lt 0) {
    return [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
  }

  return [System.Drawing.Rectangle]::new(
    $minX,
    $minY,
    ($maxX - $minX + 1),
    ($maxY - $minY + 1)
  )
}

function New-SquareIconBitmap {
  param(
    [System.Drawing.Bitmap]$SourceBitmap,
    [System.Drawing.Rectangle]$SourceRect,
    [int]$Size
  )

  $bitmap = [System.Drawing.Bitmap]::new(
    $Size,
    $Size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $targetScale = 0.88
    $targetSize = [int][Math]::Round($Size * $targetScale)
    $targetX = [int][Math]::Round(($Size - $targetSize) / 2)
    $targetY = [int][Math]::Round(($Size - $targetSize) / 2)
    $targetRect = [System.Drawing.Rectangle]::new($targetX, $targetY, $targetSize, $targetSize)

    $graphics.DrawImage($SourceBitmap, $targetRect, $SourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $graphics.Dispose()
  }

  return $bitmap
}

function Save-BitmapAsPng {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Convert-BitmapToPngBytes {
  param(
    [System.Drawing.Bitmap]$Bitmap
  )

  $stream = [System.IO.MemoryStream]::new()
  try {
    $Bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    return $stream.ToArray()
  } finally {
    $stream.Dispose()
  }
}

function Write-IcoWithPng {
  param(
    [string]$Path,
    [byte[][]]$PngImages,
    [int[]]$Sizes
  )

  if ($PngImages.Length -ne $Sizes.Length) {
    throw "Png image count does not match size count."
  }

  $output = [System.IO.MemoryStream]::new()
  $writer = [System.IO.BinaryWriter]::new($output)

  try {
    $count = [uint16]$PngImages.Length
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write($count)

    $directorySize = 6 + (16 * $PngImages.Length)
    $offset = $directorySize

    for ($i = 0; $i -lt $PngImages.Length; $i++) {
      $size = $Sizes[$i]
      $data = $PngImages[$i]

      $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))
      $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]$data.Length)
      $writer.Write([uint32]$offset)

      $offset += $data.Length
    }

    for ($i = 0; $i -lt $PngImages.Length; $i++) {
      $writer.Write($PngImages[$i])
    }

    [System.IO.File]::WriteAllBytes($Path, $output.ToArray())
  } finally {
    $writer.Dispose()
    $output.Dispose()
  }
}

$sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
  $visibleBounds = Get-VisibleBounds -Bitmap $sourceBitmap

  $pngTargets = @(
    @{ Size = 16; Name = "favicon-16x16.png" },
    @{ Size = 32; Name = "favicon-32x32.png" },
    @{ Size = 180; Name = "apple-touch-icon.png" },
    @{ Size = 192; Name = "android-chrome-192x192.png" },
    @{ Size = 512; Name = "android-chrome-512x512.png" }
  )

  $icoBitmaps = New-Object System.Collections.Generic.List[System.Drawing.Bitmap]
  $icoPngBytes = New-Object System.Collections.Generic.List[byte[]]
  $icoSizes = New-Object System.Collections.Generic.List[int]

  foreach ($target in $pngTargets) {
    $bitmap = New-SquareIconBitmap -SourceBitmap $sourceBitmap -SourceRect $visibleBounds -Size $target.Size
    try {
      $outputPath = Join-Path $publicDir $target.Name
      Save-BitmapAsPng -Bitmap $bitmap -Path $outputPath
      Write-Output "Generated $($target.Name)"
    } finally {
      $bitmap.Dispose()
    }
  }

  foreach ($icoSize in @(16, 32, 48)) {
    $bitmap = New-SquareIconBitmap -SourceBitmap $sourceBitmap -SourceRect $visibleBounds -Size $icoSize
    $icoBitmaps.Add($bitmap)
    $icoPngBytes.Add((Convert-BitmapToPngBytes -Bitmap $bitmap))
    $icoSizes.Add($icoSize)
  }

  $icoPath = Join-Path $publicDir "favicon.ico"
  Write-IcoWithPng -Path $icoPath -PngImages $icoPngBytes.ToArray() -Sizes $icoSizes.ToArray()
  Write-Output "Generated favicon.ico"

  foreach ($bitmap in $icoBitmaps) {
    $bitmap.Dispose()
  }
} finally {
  $sourceBitmap.Dispose()
}
